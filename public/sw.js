const CACHE_NAME = 'nanixhe-chicken-v1'
const urlsToCache = [
  '/',
  '/tienda/nanixhe-chicken',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
]

// Instalar service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto')
        return cache.addAll(urlsToCache)
      })
  )
})

// Activar service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antigua:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Interceptar requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Devolver desde cache si está disponible
        if (response) {
          return response
        }
        
        // Si no está en cache, hacer fetch
        return fetch(event.request)
      })
  )
})
