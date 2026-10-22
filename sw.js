// Guarda o app no celular para abrir sem internet na loja. A versão muda a cada build.
const CACHE = "b-toner-tecnico-202610222104";
const ARQUIVOS = [
  "./",
  "index.html",
  "app.js?v=202610222104",
  "app.css?v=202610222104",
  "manifest.webmanifest",
  "icone.svg",
  "icone-180.png",
  "icone-192.png",
  "icone-512.png",
  "fontes/bricolage-grotesque-latin-800-normal.woff2",
  "fontes/ibm-plex-mono-latin-500-normal.woff2",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith("b-toner-tecnico-") && n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

// Primeiro o que está guardado (funciona sem sinal); a página abre mesmo com #m=SERIE no endereço.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: e.request.mode === "navigate" }).then((achado) => achado || fetch(e.request).catch(() => caches.match("index.html"))),
  );
});
