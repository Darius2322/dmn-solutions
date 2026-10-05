// Minimal service worker: lets the admin show system notifications on phones
// (Android Chrome needs a service worker for notifications) and focus the app on tap.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) { c.navigate && c.navigate(url); return c.focus(); }
      }
      return self.clients.openWindow(url);
    })
  );
});
