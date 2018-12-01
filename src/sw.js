const staticCacheName = 'mws-restaurant-pt2-v2';
const mapCacheName = 'mws-restaurant-map';
const imageCacheName = 'mws-restaurant-images';

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(staticCacheName).then(function(cache) {
            return cache.addAll([
                '/',
                'index.html',
                'js/main.js',
                'js/restaurant_info.js',
                'css/styles.css',
                'restaurant.html',
                'img/restaurant-default.svg'

            ]);
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName) {
                    return cacheName.startsWith('mws-restaurant-pt2') &&
                        cacheName != staticCacheName;
                }).map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('fetch', function(event) {



// if the request url is from google maps, add it to the map cache. Otherwise, look for it in the static cache or the network.
    //  to cache files from the map api, I used two resources to develop my code:
    // 1) https://developer.mozilla.org/en-US/docs/Web/API/Cache
    // 2) https://stackoverflow.com/questions/27915193/how-to-cache-apis-like-google-maps-while-using-service-workers
      if (event.request.url.match('https://maps.googleapis.com/maps/api/js/') && !event.request.url.startsWith('https://maps.googleapis.com/maps/api/js/QuotaService')){
        event.respondWith(
          caches.open(mapCacheName).then( cache => {
            return cache.match(event.request).then(response => {
              if (response) {
                  console.log("found a response in the cache ", response);
                  return response;
              }
             console.log("fetching from network and putting in cache") ;
             fetch (event.request).then(networkResponse => {
                cache.put(event.request, networkResponse.clone());

                return networkResponse;
              }).catch( () => console.log("something went wrong with map cache"))
            })
          })
        );
      }
      else {
          if (event.request.url.startsWith('http://localhost:8000/img/')) {
              event.respondWith(
                  caches.open(imageCacheName).then(cache => {
                      return cache.match(event.request).then(response => {
                          if (response) {
                              console.log("found the image in the cache");
                              return response;
                              return;
                          }
                          console.log("fetching from network and putting in cache");
                          fetch(event.request).then(networkResponse => {
                              cache.put(event.request, networkResponse.clone());
                              return networkResponse;
                          }).catch(() => console.log("something went wrong with image cache"));
                      });
                  })
              )
          }
      }


          event.respondWith(
              caches.match(event.request).then(response => {
                  return response || fetch(event.request);
              })
          );


});






self.addEventListener('message', function(event) {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});


