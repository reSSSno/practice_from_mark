const VERSION="v1",SHELL=`shell-${VERSION}`,API=`api-${VERSION}`;
const SHELL_FILES=["/","/index.html","/styles.css","/app.js","/worker.js","/search.js"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(SHELL).then(cache=>cache.addAll(SHELL_FILES)));self.skipWaiting();});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==SHELL&&k!==API).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=="GET"||url.origin!==location.origin)return;
 if(url.pathname.startsWith("/api/")){
   event.respondWith((async()=>{
     try{
       const response=await fetch(event.request);
       if(response.ok){const copy=response.clone();event.waitUntil(caches.open(API).then(cache=>cache.put(event.request,copy)));}
       return response;
     }catch(error){const cached=await caches.match(event.request);if(cached)return cached;throw error;}
   })());
   return;
 }
 event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request)));
});
