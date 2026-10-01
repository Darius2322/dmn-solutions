import { touchActivity } from './activity';
import { db, newRecordBase, enqueueSync } from './db';
import { recordAuditEvent } from './audit';
import type { Product, InventoryMovement } from './types';

/** Logs one row to the stock-movement ledger and queues it for sync.
 * inventory_movements is append-only (see sync.ts's INSERT_ONLY set) — call
 * this once per quantity change, right alongside the products.quantity
 * update, never as an edit to an existing movement. Shared here so every
 * stock-changing flow (adjustments now; sales/purchases/refunds next) logs
 * movements the same way instead of each reinventing the write. */
export async function recordInventoryMovement(input: {
  businessId: string; branchId: string; productId: string;
  reason: InventoryMovement['reason']; quantityChange: number; resultingQuantity: number;
  userId?: string | null; referenceId?: string | null; quantityBefore?: number | null; note?: string | null;
}): Promise<void> {
  const id = crypto.randomUUID();
  await db.inventoryMovements.add({
    id, businessId: input.businessId, branchId: input.branchId, productId: input.productId,
    reason: input.reason, quantityChange: input.quantityChange, resultingQuantity: input.resultingQuantity,
    quantityBefore: input.quantityBefore ?? null, note: input.note?.trim() || null,
    referenceId: input.referenceId ?? null, userId: input.userId ?? null,
    createdAt: new Date().toISOString()
  });
  await enqueueSync('inventoryMovements', id, 'create');
}

export interface CreateProductInput {
  businessId: string;
  branchId: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  brand?: string | null;
  categoryId?: string | null;
  supplierId?: string | null;
  unit: string;
  buyingPrice: number;
  sellingPrice: number;
  wholesalePrice?: number | null;
  quantity: number;
  minStock: number;
  reorderLevel?: number;
  imageUrl?: string | null;
}

/** The one place a new product record gets built, so Inventory's "Add
 * product" and the Suppliers "this product isn't in stock yet" flow can't
 * silently drift apart on which fields get set. */
export async function createProduct(input: CreateProductInput): Promise<Product> {
  const product = await createProductInner(input);
  touchActivity('inventory');
  return product;
}

async function createProductInner(input: CreateProductInput): Promise<Product> {
  if (!input.name.trim()) throw new Error('Product name is required');
  const record: Product = {
    ...newRecordBase(),
    businessId: input.businessId,
    branchId: input.branchId,
    categoryId: input.categoryId ?? null,
    supplierId: input.supplierId ?? null,
    name: input.name.trim(),
    sku: input.sku || null,
    barcode: input.barcode?.trim() || null,
    brand: input.brand || null,
    description: null,
    unit: input.unit,
    imageUrl: input.imageUrl ?? null,
    buyingPrice: input.buyingPrice,
    sellingPrice: input.sellingPrice,
    wholesalePrice: input.wholesalePrice ?? null,
    quantity: input.quantity,
    minStock: input.minStock,
    reorderLevel: input.reorderLevel ?? input.minStock,
    expiryDate: null,
    active: true
  } as Product;
  await db.products.add(record);
  await enqueueSync('products', record.id, 'create');
  return record;
}

export type AdjustMode = 'add' | 'remove' | 'set';
export const ADJUST_REASONS: { value: InventoryMovement['reason']; label: string; hint: string; direction: 'in' | 'out' | 'any' }[] = [
  { value: 'supply', label: 'New supply received', hint: 'Stock arrived from a supplier', direction: 'in' },
  { value: 'return', label: 'Customer return', hint: 'Item came back and is resalable', direction: 'in' },
  { value: 'adjustment', label: 'Stock count', hint: 'Physical count differs from the system', direction: 'any' },
  { value: 'damage', label: 'Damaged', hint: 'Broken or spoiled, cannot be sold', direction: 'out' },
  { value: 'expiry', label: 'Expired', hint: 'Past its expiry date', direction: 'out' },
  { value: 'theft', label: 'Lost or stolen', hint: 'Missing stock', direction: 'out' },
  { value: 'correction', label: 'Correction', hint: 'Fixing an earlier entry mistake', direction: 'any' },
  { value: 'other', label: 'Other', hint: 'Explain in the note', direction: 'any' }
];

export function previewAdjustment(current: number, mode: AdjustMode, amount: number): number {
  return mode === 'add' ? current + amount : mode === 'remove' ? current - amount : amount;
}

/** THE way to change stock by hand: validates, updates the product, writes a documented ledger entry (who, when,
 * why, before → after, note) and an audit event, and queues everything for sync. Used by the product page and the
 * quick-adjust sheet in Inventory so the two can never record adjustments differently. Server-side, the database
 * only accepts the movement if the signed-in user has the inventory.adjust permission. */
export async function adjustStock(input: {
  product: Pick<Product, 'id' | 'businessId' | 'branchId' | 'quantity' | 'name'>;
  mode: AdjustMode; amount: number; reason: InventoryMovement['reason']; note?: string; userId: string | null;
}): Promise<{ before: number; after: number; change: number }> {
  const { product, mode, amount, reason, userId } = input;
  const note = input.note?.trim() ?? '';
  if (!Number.isFinite(amount) || amount < 0) throw new Error('Enter a valid quantity.');
  if (mode !== 'set' && amount === 0) throw new Error('Enter a quantity greater than zero.');
  if (reason === 'other' && note.length < 3) throw new Error('Please add a short note explaining this adjustment.');
  // Always adjust from the latest stored quantity, not from what the screen showed when it opened.
  const fresh = await db.products.get(product.id);
  const before = fresh?.quantity ?? product.quantity;
  const after = previewAdjustment(before, mode, amount);
  if (after < 0) throw new Error(`Can't remove more than the ${before} in stock.`);
  if (after === before) throw new Error("That doesn't change the stock level.");
  const now = new Date().toISOString();
  await db.products.update(product.id, { quantity: after, updatedAt: now, syncStatus: 'pending' } as any);
  await enqueueSync('products', product.id, 'update');
  await recordInventoryMovement({
    businessId: product.businessId, branchId: product.branchId, productId: product.id, reason,
    quantityChange: after - before, resultingQuantity: after, quantityBefore: before, note, userId
  });
  await recordAuditEvent({
    businessId: product.businessId, branchId: product.branchId, userId, action: 'stock_adjusted', entityType: 'product', entityId: product.id,
    previousValue: JSON.stringify({ quantity: before }), newValue: JSON.stringify({ quantity: after, reason, note: note || undefined })
  });
  touchActivity('inventory');
  return { before, after, change: after - before };
}
