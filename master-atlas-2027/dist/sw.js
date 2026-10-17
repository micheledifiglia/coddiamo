'use strict';
const CACHE='master-atlas-shell-v7';
const SHELL=['/','/index.html','/style.css','/auth.css','/pwa.css','/glass-ui.css','/config.js','/auth.js','/core.js','/storage.js','/globe.js','/app.js','/pwa.js','/manifest.webmanifest','/data.json','/icons/atlas-192.png','/icons/atlas-512.png','/icons/atlas-180.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('master-atlas-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
  if(!SHELL.includes(url.pathname)&&url.pathname!=='/')return;
  event.respondWith(fetch(request).then(async response=>{
    if(response.ok){const copy=response.clone();await caches.open(CACHE).then(cache=>cache.put(request,copy));}
    return response;
  }).catch(async()=>{
    const cached=await caches.match(request)||await caches.match(url.pathname==='/index.html'?'/':'/index.html');
    return cached||new Response('Sei offline. Riconnettiti per usare Master Atlas.',{status:503,headers:{'content-type':'text/plain; charset=utf-8'}});
  }));
});
