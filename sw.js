// Guarda o app no celular para abrir sem internet na loja. A versão muda a cada build.
const CACHE = "b-toner-tecnico-202610222112";
const ARQUIVOS = [
  "./",
  "index.html",
  "app.js?v=202610222112",
  "app.css?v=202610222112",
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

// Abrir o app: com sinal, pega a página nova (e com ela o app.js da versão nova); sem sinal ou com sinal
// fraco, abre a guardada em até 3 s. Sem isso o celular rodava a versão antiga até abrir o app duas vezes.
function paginaNova(e) {
  // no-cache: confere com o servidor (o GitHub Pages deixa a página 10 min no cache do navegador).
  const rede = fetch(e.request.url, { cache: "no-cache", credentials: "same-origin" }).then((r) => {
    if (r.ok) caches.open(CACHE).then((c) => c.put("index.html", r.clone()));
    return r;
  });
  const espera = new Promise((ok) => setTimeout(ok, 3000)).then(() => caches.match("index.html"));
  return Promise.race([rede.catch(() => caches.match("index.html")), espera]).then((r) => r || rede);
}

// O resto: primeiro o que está guardado (funciona sem sinal); a página abre mesmo com #m=SERIE no endereço.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (e.request.mode === "navigate") return e.respondWith(paginaNova(e));
  e.respondWith(
    caches.match(e.request, { ignoreSearch: e.request.mode === "navigate" }).then((achado) => achado || fetch(e.request).catch(() => caches.match("index.html"))),
  );
});
