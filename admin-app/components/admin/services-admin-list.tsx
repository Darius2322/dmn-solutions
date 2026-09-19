"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, MoreVertical, Trash2, EyeOff, Eye, X } from "lucide-react";
import { ServiceStatusToggle } from "@/components/admin/service-status-toggle";
import { ServiceFormModal } from "@/components/admin/service-form-modal";
import { DeleteServiceButton } from "@/components/admin/delete-service-button";
import { DetailsModal } from "@/components/admin/details-modal";
import { updateServiceStatus, deleteService } from "@/lib/actions/admin/services";
import { getServiceImage } from "@/lib/service-images";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

type Service = {
  id: string; title: string; slug: string; category: string; description: string;
  active: boolean; created_at: string; updated_at: string | null; sort_order: number | null;
  price_label: string | null; features: string[] | null;
};

export function ServicesAdminList({ services }: { services: Service[] }) {
  const router = useRouter();
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleSelectMode() {
    setSelectMode((v) => !v);
    setSelected(new Set());
  }

  function toggleItem(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function runBulk(action: "hide" | "show" | "delete") {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (action === "delete" && !window.confirm(`Delete ${ids.length} service(s)? This cannot be undone.`)) return;

    startTransition(async () => {
      if (action === "delete") {
        await Promise.all(ids.map((id) => deleteService(id)));
      } else {
        await Promise.all(ids.map((id) => updateServiceStatus(id, action === "show")));
      }
      setSelected(new Set());
      setSelectMode(false);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={toggleSelectMode}
          aria-label="Toggle selection mode"
          className={`rounded-md border p-2 ${selectMode ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-background"}`}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {selectMode && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface-muted px-3 py-2">
          <span className="text-xs font-medium text-foreground">{selected.size} selected</span>
          <button disabled={selected.size === 0 || isPending} onClick={() => runBulk("hide")}
            className="flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-foreground hover:bg-background disabled:opacity-50">
            <EyeOff className="h-3.5 w-3.5" /> Deactivate
          </button>
          <button disabled={selected.size === 0 || isPending} onClick={() => runBulk("show")}
            className="flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-foreground hover:bg-background disabled:opacity-50">
            <Eye className="h-3.5 w-3.5" /> Activate
          </button>
          <button disabled={selected.size === 0 || isPending} onClick={() => runBulk("delete")}
            className="flex items-center gap-1 rounded-md border border-error/30 bg-surface px-3 py-1.5 text-xs text-error hover:bg-error/5 disabled:opacity-50">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
          <button onClick={toggleSelectMode} className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" /> Cancel
          </button>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {services.map((service) => {
          const isExpanded = expandedId === service.id;
          return (
            <div key={service.id} className="overflow-hidden rounded-lg border border-border bg-surface">
              <div className="flex items-start gap-3 p-4">
                {selectMode && (
                  <input
                    type="checkbox"
                    checked={selected.has(service.id)}
                    onChange={() => toggleItem(service.id)}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getServiceImage(service.category)}
                  alt={service.title}
                  className="h-14 w-14 shrink-0 rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : service.id)}
                  className="flex flex-1 items-start justify-between gap-2 text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{service.title}</p>
                    <p className="text-xs text-muted-foreground">{service.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${service.active ? "bg-success/10 text-success" : "bg-muted-foreground/10 text-muted-foreground"}`}>
                      {service.active ? "Active" : "Inactive"}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </button>
              </div>

              {isExpanded && (
                <div className="border-t border-border px-4 pb-4 pt-3">
                  <p className="text-sm text-foreground">{service.description}</p>
                  {service.price_label && (
                    <p className="mt-2 text-xs font-medium text-secondary">{service.price_label}</p>
                  )}
                  {service.features && service.features.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {service.features.map((f) => (
                        <li key={f} className="text-xs text-muted-foreground">• {f}</li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <ServiceFormModal service={service as any} />
                    <ServiceStatusToggle serviceId={service.id} active={service.active} />
                    <DetailsModal
                      title={service.title}
                      rows={[
                        { label: "Added", value: formatDate(service.created_at) },
                        { label: "Last edited", value: formatDate(service.updated_at) },
                        { label: "Status", value: service.active ? "Active" : "Inactive" },
                        { label: "Slug", value: service.slug },
                        { label: "Sort order", value: String(service.sort_order ?? "—") },
                      ]}
                    />
                    <DeleteServiceButton serviceId={service.id} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {services.length === 0 && <p className="text-sm text-muted-foreground">No services yet.</p>}
      </div>
    </div>
  );
}
