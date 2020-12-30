const cacheName = 'v1';

// Call Install Event
self.addEventListener('install', e => {
    console.log('Serveice Worker: Installed')
});

// Call Activate Event
self.addEventListener('activate', e => {
    console.log('Service Worker: Activated')
    // Remove unwanted caches:
    e.waitUntil(
        self.clients.claim(),
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== cacheName) {
                        console.log('Service Worker: Clearing Old Cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', function (event) {
    console.log('Service Worker: Fetching')
    event.respondWith(
        caches.open(cacheName).then(function (cache) {
            return cache.match(event.request).then(function (response) {
                return response || fetch(event.request).then(function (response) {
                    if (!event.request.url.includes('api/session/list?subId')) { // check that this is not the call to the data from the server (which I don't want to cache)
                        cache.put(event.request, response.clone());
                    }
                    return response;
                });
            });
        })
    );
});
