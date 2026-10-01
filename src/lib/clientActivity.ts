import { supabase, backendConfigured } from './supabase';

/** Sessions that happen while the device has no connection (opening the app, unlocking with biometrics, ringing up
 * sales) used to be invisible to the admin until the next online login. Each one is now written to a small on-device
 * queue with its real timestamp and uploaded automatically once the connection is back, so "last active" and login
 * counts in the admin portal reflect true usage. The server (record_client_activity) checks that the signed-in user
 * really belongs to the business, ignores duplicates and rejects implausible timestamps. */
export type ActivityKind = 'login' | 'logout' | 'biometric_login' | 'app_open' | 'offline_session' | 'sale' | 'inventory' | 'sync';

interface QueuedEvent { clientEventId: string; businessId: string; eventType: ActivityKind; occurredAt: string; wasOffline: boolean; deviceInfo: string }

const KEY = 'shopos.activity.queue.v1';
const LAST_OPEN = 'shopos.activity.lastOpen';
const MAX_QUEUE = 500;
const OPEN_GAP_MS = 30 * 60 * 1000;
let flushing = false;

function read(): QueuedEvent[] { try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; } }
function write(list: QueuedEvent[]) { try { localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX_QUEUE))); } catch { /* storage full/unavailable: activity logging is best-effort */ } }
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = (Math.random() * 16) | 0; return (c === 'x' ? r : (r & 3) | 8).toString(16); }));
const device = () => `${/Android|iPhone|iPad/i.exec(navigator.userAgent)?.[0] ?? navigator.platform ?? 'device'} · ${navigator.userAgent.slice(0, 120)}`;

export function recordActivity(businessId: string | null | undefined, eventType: ActivityKind, opts?: { throttleOpen?: boolean }) {
  if (!businessId) return;
  if (opts?.throttleOpen) {
    try {
      const last = Number(localStorage.getItem(LAST_OPEN) ?? 0);
      if (Date.now() - last < OPEN_GAP_MS) return;
      localStorage.setItem(LAST_OPEN, String(Date.now()));
    } catch { /* ignore */ }
  }
  const list = read();
  list.push({ clientEventId: uuid(), businessId, eventType, occurredAt: new Date().toISOString(), wasOffline: !navigator.onLine, deviceInfo: device() });
  write(list);
  if (navigator.onLine) void flushActivity();
}

/** Called when the app opens (throttled to one per 30 minutes) — offline opens are recorded as offline sessions. */
export function recordAppOpen(businessId: string | null | undefined) {
  recordActivity(businessId, navigator.onLine ? 'app_open' : 'offline_session', { throttleOpen: true });
}

export function pendingActivityCount(): number { return read().length; }

export async function flushActivity(): Promise<void> {
  if (flushing || !navigator.onLine || !backendConfigured() || !supabase) return;
  const list = read();
  if (list.length === 0) return;
  const { data: sess } = await supabase.auth.getSession();
  if (!sess.session) return; // wait until signed in; nothing is lost
  flushing = true;
  try {
    for (let i = 0; i < list.length; i += 100) {
      const batch = list.slice(i, i + 100);
      const { error } = await supabase.rpc('record_client_activity', { p_events: batch });
      if (error) return; // keep everything, retry on the next trigger
      const sent = new Set(batch.map((b) => b.clientEventId));
      write(read().filter((e) => !sent.has(e.clientEventId)));
    }
  } finally { flushing = false; }
}

export function startActivityFlush() {
  window.addEventListener('online', () => { void flushActivity(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void flushActivity(); });
  void flushActivity();
}
