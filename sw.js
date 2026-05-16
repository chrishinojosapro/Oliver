// sw.js - Oliver's Background Push Interceptor

self.addEventListener('install', (event) => {
    self.skipWaiting();
    console.log('Oliver Service Worker Installed');
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
    console.log('Oliver Service Worker Activated');
});

// This is the critical event that listens for my backend pings when the app is closed
self.addEventListener('push', function(event) {
    console.log('Push received in background context');
    
    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { title: 'Oliver', body: event.data.text() };
        }
    }

    const title = data.title || 'Oliver';
    const options = {
        body: data.body || 'New message from Oliver.',
        icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%23010409%22/><text y=%22.9em%22 x=%2210%22 font-size=%2280%22>🌌</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌌</text></svg>',
        requireInteraction: true, // Keeps the notification on screen until you dismiss it
        vibrate: [200, 100, 200]
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// When you tap the push notification on your lock screen, this opens the app
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    // Check if the app is already open in the background, if so, focus it. Otherwise, open a new window.
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});
