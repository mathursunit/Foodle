const CACHE = 'fihr-foodle-v3-7-11';
const ASSETS = [
  './',
  './index.html',
  './assets/styles.css',
  './scripts/main.js',
  './manifest.json',
  './assets/fihr_food_words_v1.4.csv'
];
self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch', (e)=>{
  const req = e.request;
  e.respondWith(
    caches.match(req).then(cached=> cached || fetch(req).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c=>c.put(req, copy));
      return resp;
    }).catch(()=>cached))
  );
});