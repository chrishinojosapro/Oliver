self.addEventListener('push', function(event) {
    if (event.data) {
        try {
            const data = event.data.json();
            const title = data.title || "Oliver AI";
            const options = {
                body: data.body || "You have a new message.",
                icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%23010409%22/><text y=%22.9em%22 x=%2210%22 font-size=%2280%22>🌌</text></svg>',
                badge: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌌</text></svg>',
                data: data.url || '/' // Allows us to open a specific page on click
            };
            event.waitUntil(self.registration.showNotification(title, options));
        } catch (e) {
            // Fallback for plain text payloads
            event.waitUntil(self.registration.showNotification("Oliver AI", { body: event.data.text() }));
        }
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // If the app is already open in the background, focus it
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            // If the app is fully closed, open it
            if (clients.openWindow) {
                const targetUrl = event.notification.data || '/';
                return clients.openWindow(targetUrl);
            }
        })
    );
});
