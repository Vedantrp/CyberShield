import { saveReport } from "./data.js";

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => {
                console.log('Service Worker Registered (PWA)', reg.scope);
                // Check for updates
                reg.onupdatefound = () => {
                    const installingWorker = reg.installing;
                    installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                console.log('New content is available; please refresh.');
                            } else {
                                console.log('Content is cached for offline use.');
                            }
                        }
                    };
                };
            })
            .catch(err => console.error('Service Worker Registration Failed:', err));

        // Auto reload when new SW takes over
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log("New Service Worker activated. Reloading...");
            window.location.reload();
        });
    });

    // Auto-Sync when back online
    window.addEventListener('online', async () => {
        console.log("Back online! Syncing reports...");
        const queue = JSON.parse(localStorage.getItem("offlineReports")) || [];

        if (queue.length > 0) {
            const tempQueue = [...queue];
            localStorage.setItem("offlineReports", "[]"); // Clear safely

            for (const report of tempQueue) {
                try {
                    await saveReport(report);
                    console.log("Synced report:", report.id);
                } catch (e) {
                    // If failed again, push back to queue
                    console.error("Sync failed for:", report.id);
                    // Re-save failed ones
                    const current = JSON.parse(localStorage.getItem("offlineReports")) || [];
                    current.push(report);
                    localStorage.setItem("offlineReports", JSON.stringify(current));
                }
            }
            alert("Connection restored. Offline reports have been synced.");
        }
    });
}
// PWA Install Logic
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    deferredPrompt = e;
    console.log("✅ 'beforeinstallprompt' fired! App is installable.");

    // Show Floating Button
    showInstallPromotion();

    // Also show footer link as fallback
    const manualBtn = document.getElementById('manual-install-btn');
    if (manualBtn) {
        manualBtn.style.display = 'inline-block';
        manualBtn.addEventListener('click', triggerInstall);
    }
});

function showInstallPromotion() {
    if (document.getElementById('install-pwa-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'install-pwa-btn';
    btn.innerHTML = '📲 Install Cybershield';
    btn.className = 'btn btn-primary';
    Object.assign(btn.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: '9999',
        boxShadow: '0 0 15px var(--accent-primary)',
        border: '1px solid var(--accent-primary)',
        animation: 'pulse 2s infinite'
    });
    btn.addEventListener('click', triggerInstall);
    document.body.appendChild(btn);
}

async function triggerInstall() {
    if (!deferredPrompt) {
        alert("Installation not supported or already installed. Check your browser menu.");
        return;
    }
    // Hide UI
    const floatBtn = document.getElementById('install-pwa-btn');
    if (floatBtn) floatBtn.style.display = 'none';

    // Show prompt
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    deferredPrompt = null;
}

window.addEventListener('appinstalled', () => {
    console.log('✅ PWA was installed successfully');
    deferredPrompt = null;
    const btn = document.getElementById('install-pwa-btn');
    if (btn) btn.remove();
    const manual = document.getElementById('manual-install-btn');
    if (manual) manual.style.display = 'none';
});
