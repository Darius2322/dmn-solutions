"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, BellRing, HandHeart, Inbox, MessageSquare, Volume2, VolumeX, X } from "lucide-react";
import {
  getNotifications,
  getAdminNotificationSnapshot,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/actions/admin/notifications";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  created_at: string;
  service_request_id: string | null;
};

type Toast = { id: string; title: string; message: string | null; type: string };

const TYPE_LINKS: Record<string, string> = {
  service_request: "/requests",
  contact_message: "/messages",
  support_submission: "/support",
};
const TYPE_ICONS: Record<string, any> = {
  service_request: Inbox,
  contact_message: MessageSquare,
  support_submission: HandHeart,
};

const POLL_MS = 10000;
const BASE_TITLE = "DMN Solutions — Admin";

// Shared across both bell instances (desktop + mobile header) so a new
// notification only chimes once.
let lastSeenId: string | null | undefined;
let audioCtx: AudioContext | null = null;

function playChime() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx ?? new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const now = audioCtx.currentTime;
    [880, 1318.5].forEach((freq, i) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.16);
      gain.gain.linearRampToValueAtTime(0.25, now + i * 0.16 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.16 + 0.5);
      osc.connect(gain).connect(audioCtx!.destination);
      osc.start(now + i * 0.16);
      osc.stop(now + i * 0.16 + 0.55);
    });
  } catch {
    /* autoplay blocked until the first tap — ignore */
  }
}

async function showSystemNotification(title: string, body: string | null, url: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(title, { body: body ?? undefined, icon: "/favicon.ico", tag: "dmn-admin", data: { url } });
    } else {
      new Notification(title, { body: body ?? undefined, tag: "dmn-admin" });
    }
  } catch {
    /* some browsers refuse — in-app alert still shows */
  }
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [soundOn, setSoundOn] = useState(true);
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");
  const [toast, setToast] = useState<Toast | null>(null);
  const [, startTransition] = useTransition();
  const soundRef = useRef(true);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const stored = localStorage.getItem("admin-notif-sound");
    const on = stored !== "off";
    setSoundOn(on);
    soundRef.current = on;
    setPerm(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
    // Browsers only allow audio after a tap — unlock it on the first interaction.
    const unlock = () => {
      try {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (Ctx) {
          audioCtx = audioCtx ?? new Ctx();
          audioCtx.resume();
        }
      } catch {}
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  const poll = useCallback(async () => {
    const snap = await getAdminNotificationSnapshot();
    setUnreadCount(snap.unread);
    document.title = snap.unread > 0 ? `(${snap.unread}) ${BASE_TITLE}` : BASE_TITLE;

    const latestId = snap.latest?.id ?? null;
    if (lastSeenId === undefined) {
      lastSeenId = latestId; // first load: set baseline, no chime
      return;
    }
    if (latestId && latestId !== lastSeenId) {
      lastSeenId = latestId;
      const n = snap.latest!;
      if (soundRef.current) playChime();
      showSystemNotification(n.title, n.message, TYPE_LINKS[n.type] ?? "/");
      setToast({ id: n.id, title: n.title, message: n.message, type: n.type });
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 7000);
    } else if (!latestId) {
      lastSeenId = null;
    }
  }, []);

  useEffect(() => {
    poll();
    const interval = setInterval(poll, POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && poll();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      clearTimeout(toastTimer.current);
    };
  }, [poll]);

  async function handleOpen() {
    setOpen(true);
    setToast(null);
    const list = await getNotifications(40);
    setNotifications(list as Notification[]);
  }

  function handleItemClick(n: Notification) {
    if (!n.read) {
      startTransition(async () => {
        await markNotificationRead(n.id);
        poll();
      });
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    }
    setOpen(false);
    const link = TYPE_LINKS[n.type];
    if (link) router.push(link);
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((x) => ({ ...x, read: true })));
      setUnreadCount(0);
      document.title = BASE_TITLE;
    });
  }

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    soundRef.current = next;
    localStorage.setItem("admin-notif-sound", next ? "on" : "off");
    if (next) playChime();
  }

  async function enableAlerts() {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPerm(result);
    if (result === "granted") showSystemNotification("Alerts enabled", "You'll get a pop-up when a new request arrives.", "/");
  }

  const shown = tab === "unread" ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        className="relative rounded-md border border-border p-2 text-muted-foreground hover:bg-background hover:text-foreground"
      >
        {unreadCount > 0 ? <BellRing className="h-4 w-4 text-primary" /> : <Bell className="h-4 w-4" />}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {toast && !open && (
        <button
          onClick={() => {
            setToast(null);
            const link = TYPE_LINKS[toast.type];
            markNotificationRead(toast.id).then(poll);
            if (link) router.push(link);
          }}
          className="fixed right-4 top-4 z-[60] w-80 max-w-[90vw] rounded-lg border border-primary/30 bg-surface p-4 text-left shadow-xl"
        >
          <div className="flex items-start gap-3">
            <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{toast.title}</p>
              {toast.message && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{toast.message}</p>}
            </div>
          </div>
        </button>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-96 max-w-[92vw] rounded-lg border border-border bg-surface shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-medium text-foreground">Notifications</p>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleSound}
                  aria-label={soundOn ? "Mute sound" : "Unmute sound"}
                  title={soundOn ? "Sound on" : "Sound off"}
                  className="rounded p-1.5 text-muted-foreground hover:bg-background"
                >
                  {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button onClick={() => setOpen(false)} aria-label="Close" className="rounded p-1.5 hover:bg-background">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <div className="flex gap-1">
                {(["all", "unread"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-background"
                    }`}
                  >
                    {t}{t === "unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
                  </button>
                ))}
              </div>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline">
                  Mark all read
                </button>
              )}
            </div>

            {perm === "default" && (
              <button
                onClick={enableAlerts}
                className="flex w-full items-center gap-2 border-b border-border bg-primary/5 px-4 py-2.5 text-left text-xs text-foreground hover:bg-primary/10"
              >
                <BellRing className="h-4 w-4 text-primary" />
                Turn on pop-up alerts for new requests
              </button>
            )}
            {perm === "denied" && (
              <p className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-xs text-muted-foreground">
                <BellOff className="h-4 w-4" /> Pop-up alerts are blocked in your browser settings.
              </p>
            )}

            <div className="max-h-96 overflow-y-auto">
              {shown.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {tab === "unread" ? "You're all caught up." : "No notifications yet."}
                </p>
              ) : (
                shown.map((n) => {
                  const Icon = TYPE_ICONS[n.type] ?? Bell;
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleItemClick(n)}
                      className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left last:border-0 hover:bg-background ${!n.read ? "bg-primary/5" : ""}`}
                    >
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${!n.read ? "bg-primary/15 text-primary" : "bg-surface-muted text-muted-foreground"}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className={`text-sm text-foreground ${!n.read ? "font-semibold" : "font-medium"}`}>{n.title}</span>
                          {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                        </span>
                        {n.message && <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{n.message}</span>}
                        <span className="mt-1 block text-[11px] text-muted-foreground">{timeAgo(n.created_at)}</span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
