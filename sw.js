const staticCacheName = 'mws-restaurant-pt1-v1';
const mapCacheName = 'mws-restaurant-map-v1';

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(staticCacheName).then(function(cache) {
            return cache.addAll([
                '/',
                'js/main.js',
                'js/restaurant_info.js',
                'js/dbhelper.js',
                'css/styles.css',
                'img/1.webp', 'img/1.jpg', 'img/medium-1.jpg', 'img/medium-1.webp', 'img/small-1.jpg', 'img/small-1.webp',
                 'img/2.webp', 'img/2.jpg', 'img/medium-2.jpg', 'img/medium-2.webp', 'img/small-2.jpg', 'img/small-2.webp',
                'img/3.webp', 'img/3.jpg', 'img/medium-3.jpg', 'img/medium-3.webp', 'img/small-3.jpg', 'img/small-3.webp',
                'img/4.webp', 'img/4.jpg', 'img/medium-4.jpg', 'img/medium-4.webp', 'img/small-4.jpg', 'img/small-4.webp',
                'img/5.webp', 'img/5.jpg', 'img/medium-5.jpg', 'img/medium-5.webp', 'img/small-5.jpg', 'img/small-5.webp',
                'img/6.webp', 'img/6.jpg', 'img/medium-6.jpg', 'img/medium-6.webp', 'img/small-6.jpg', 'img/small-6.webp',
                'img/7.webp', 'img/7.jpg', 'img/medium-7.jpg', 'img/medium-7.webp', 'img/small-7.jpg', 'img/small-7.webp',
                'img/8.webp', 'img/8.jpg', 'img/medium-8.jpg', 'img/medium-8.webp', 'img/small-8.jpg', 'img/small-8.webp',
                'img/9.webp', 'img/9.jpg', 'img/medium-9.jpg', 'img/medium-9.webp', 'img/small-9.jpg', 'img/small-9.webp',
                'img/10.webp', 'img/10.jpg', 'img/medium-10.jpg', 'img/medium-10.webp', 'img/small-10.jpg', 'img/small-10.webp',
                'data/restaurants.json',
                'restaurant.html'

            ]);
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName) {
                    return cacheName.startsWith('mws-restaurant-pt1') &&
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
      if (event.request.url.startsWith('https://maps.googleapis.com/maps/api/js')){
        event.respondWith(
          caches.open(mapCacheName).then( cache => {
            return cache.match(event.request).then(response => {
              if (response) {
                  console.log("found a response in the cache ", response.url);
                  return response;
              }
             console.log("fetching from network and putting in cache") ;
             fetch (event.request).then(networkResponse => {
                cache.put(event.request, networkResponse.clone()).then( () => console.log('just put something in the cache', networkResponse));

                return networkResponse;
              }).catch( () => console.log("something went wrong"))
            })
          })
        );
      }

    else {
          event.respondWith(
              caches.match(event.request).then(response => {
                  console.log(response);
                  return response || fetch(event.request);
              })
          );
      }
});






self.addEventListener('message', function(event) {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});


