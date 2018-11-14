
console.log("Service Worker Working")
addEventListener('fetch', event => {
    event.respondWith(
        new Response('service worker fetch <b> :P </b>')
    );
});