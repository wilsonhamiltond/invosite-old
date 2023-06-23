import { Promise } from "core-js/library/web/timers";
(() =>{
    const PRECACHE = 'is_cache_v1';

    const PRECACHE_URLS = [
    '/', // Alias for index.html
    //JS
    '/0.bundle.js',
    '/1.bundle.js',
    '/2.bundle.js',
    '/3.bundle.js',
    '/4.bundle.js',
    '/5.bundle.js',
    '/6.bundle.js',
    '/7.bundle.js',
    '/8.bundle.js',
    '/9.bundle.js',
    '/10.bundle.js',
    '/11.bundle.js',
    '/12.bundle.js',
    '/13.bundle.js',
    '/14.bundle.js',
    '/init.bundle.js',
    '/vendor.bundle.js',
    '/main.bundle.js',
    
    //CSS
    '/bootstrap/dist/css/bootstrap.css',
    '/material-design-icons/iconfont/material-icons.css',
    '/@angular/material/prebuilt-themes/deeppurple-amber.css',
    'assests/css/main.css',
    'https://fonts.googleapis.com/css?family=Josefin+Slab',
    
    //Othes
    '/favicon.ico',
    'assests/images/loading_spinner.gif',
    'assests/images/avatar.png'
    ];

    // The install handler takes care of precaching the resources we always need.
    self.addEventListener('install', (event:any) =>{
    event.waitUntil(
        caches.open(PRECACHE)
            .then( (cache: any) => { 
            return cache.addAll(PRECACHE_URLS) 
            })
        );
    });

    // The activate handler takes care of cleaning up old caches.
    self.addEventListener('activate', ( event:any ) =>{
        event.waitUntil(() => {
            return new Promise(() =>{});
        });
    });


    self.addEventListener('fetch', event => {
    });

    self.addEventListener('push', event => {
    });
})();