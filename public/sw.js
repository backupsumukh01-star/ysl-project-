self.addEventListener("install", (event) => {
  event.waitUntil(caches.open("rsm-static").then((cache) => cache.addAll(["/", "/offline"])));
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET") return;
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/account") || url.pathname.startsWith("/checkout") || url.pathname.startsWith("/admin")) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(url.pathname === "/" ? "/" : "/offline")));
});
