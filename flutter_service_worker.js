'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "92c6cc0f2b741e5fc771e35c90fdc07a",
"assets/assets/fonts/Lato-Bold.ttf": "85d339d916479f729938d2911b85bf1f",
"assets/assets/fonts/Lato-Regular.ttf": "2d36b1a925432bae7f3c53a340868c6e",
"assets/assets/img/css3.png": "69b8642690d8b84dedaa98fb6636a564",
"assets/assets/img/flutter.png": "8a50b602aa79b19775c22d02a290f51f",
"assets/assets/img/html5.png": "cebe131c7a48e8f2fd16be72b2ddd80d",
"assets/assets/img/iBadminton.png": "2dc23b10eb1a809c23b37532e6a394c6",
"assets/assets/img/iGaming.png": "1d2193df8ca3d9e152a74a225e6fabf2",
"assets/assets/img/iPainting.png": "497acf614cccaefe9acc3645ea2f782b",
"assets/assets/img/iSleeping.png": "a95131649eb8f9d365db7c3213706ba0",
"assets/assets/img/kotlin.png": "d363f13ef08110574b8c8a97f27e432e",
"assets/assets/img/laravel.png": "074ca6c07b29709b69bc6c0d09042734",
"assets/assets/img/me.jpg": "7863f6a98bf7d243a15214ce8030a69d",
"assets/assets/img/prAsesmenCovid.png": "754d95bc93bd6a0583f6e1aa82535afb",
"assets/assets/img/prAttitudeRecord.png": "feb5c64d5cff1917b262600f913aeecb",
"assets/assets/img/prAuthUwu.png": "bb5d370091069d9b01c59f1629245443",
"assets/assets/img/prMieIndo.png": "2dab73b75a0ea1f473b3f52b8604e6fc",
"assets/assets/img/prQuiztoria.png": "9d133128be9677432eebba580cae69de",
"assets/assets/img/sertAndroid.png": "cc0adbdfefa983953eaa884ce312bc7f",
"assets/assets/img/sertWeb.png": "3ff5789d7b5d8cbb4e4b6c937dbdade3",
"assets/FontManifest.json": "f83e0ea5e53ca6d80485c6cb60576101",
"assets/fonts/MaterialIcons-Regular.ttf": "56d3ffdef7a25659eab6a68a3fbfaf16",
"assets/LICENSE": "8402b631f2450a4e892e83da0dc8ed65",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "115e937bb829a890521f72d2e664b632",
"assets/packages/font_awesome_flutter/lib/fonts/fa-brands-400.ttf": "5a37ae808cf9f652198acde612b5328d",
"assets/packages/font_awesome_flutter/lib/fonts/fa-regular-400.ttf": "2bca5ec802e40d3f4b60343e346cedde",
"assets/packages/font_awesome_flutter/lib/fonts/fa-solid-900.ttf": "2aa350bd2aeab88b601a593f793734c0",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "bd053d4699e838ce1608f4cee963084c",
"/": "bd053d4699e838ce1608f4cee963084c",
"main.dart.js": "550f017577c48c270e25933a5fc7c371",
"manifest.json": "fd810f7e713bc9aa460e94ac22616723"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/LICENSE",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      // Provide a no-cache param to ensure the latest version is downloaded.
      return cache.addAll(CORE.map((value) => new Request(value, {'cache': 'no-cache'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');

      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }

      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#')) {
    key = '/';
  }
  // If the URL is not the the RESOURCE list, skip the cache.
  if (!RESOURCES[key]) {
    return event.respondWith(fetch(event.request));
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache. Ensure the resources are not cached
        // by the browser for longer than the service worker expects.
        var modifiedRequest = new Request(event.request, {'cache': 'no-cache'});
        return response || fetch(modifiedRequest).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.message == 'skipWaiting') {
    return self.skipWaiting();
  }

  if (event.message = 'downloadOffline') {
    downloadOffline();
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.add(resourceKey);
    }
  }
  return Cache.addAll(resources);
}
