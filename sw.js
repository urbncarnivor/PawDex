self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  const data = event.data
    ? event.data.json()
    : {
        title: "PawDex Alert",
        body: "A companion profile was opened.",
      };

  event.waitUntil(
    self.registration.showNotification(data.title || "PawDex Alert", {
      body: data.body || "A companion profile was opened.",
      icon: "/images/pawdex-icon-192.png",
      badge: "/images/pawdex-icon-192.png",
      tag: data.tag || "pawdex-alert",
      data: {
        url: data.url || "/",
      },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(event.notification.data?.url || "/")
  );
});
