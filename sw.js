// sw.js - Oliver's Background Push Interceptor

self.addEventListener('install', (e) => {
    // Force the waiting service worker to become the active service worker immediately
    e.waitUntil(self.skipWaiting());
    console.log('Oliver Service Worker Installed');
});

self.addEventListener('activate', (e) => {
    // Tell the active service worker to take control of the page immediately
    e.waitUntil(self.clients.claim());
    console.log('Oliver Service Worker Activated');
});

// This is the critical event that listens for my backend pings when the app is closed
self.addEventListener('push', (e) => {
    console.log('Push received in background context');
    
    // iOS REQUIRES showing a notification from every push event.
    // Always show immediately — never skip or defer.
    let data = {};
    if (e.data) {
        try { 
            data = e.data.json(); 
        } catch (err) { 
            data = { title: 'Oliver', body: e.data.text() };
        }
    }

    const notifTitle = data.title || 'Oliver';
    const notifBody = data.body || 'New message from Oliver.';
    const notifIcon = data.icon || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%23010409%22/><text y=%22.9em%22 x=%2210%22 font-size=%2280%22>🌌</text></svg>';
    const notifBadge = data.badge || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌌</text></svg>';
    const notifTag = data.tag || 'oliver-notif-' + Date.now();

    // The promise chain MUST be passed directly to e.waitUntil for iOS
    const promiseChain = self.registration.showNotification(notifTitle, {
        body: notifBody,
        icon: notifIcon,
        badge: notifBadge,
        tag: notifTag,
        vibrate: [200, 100, 200],
        requireInteraction: true,
        renotify: true
    });

    e.waitUntil(promiseChain);
});

// When you tap the push notification on your lock screen, this opens the app
self.addEventListener('notificationclick', (e) => {
    e.notification.close();
    
    const targetUrl = 'https://chrishinojosapro.github.io/Oliver/';

    e.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
            // Try to find an existing window to focus safely using .includes
            for (const client of clients) {
                if (client.url && client.url.includes('/Oliver/')) {
                    client.focus();
                    return;
                }
            }
            // If no window is found, open a new one
            return self.clients.openWindow(targetUrl);
        })
    );
});
