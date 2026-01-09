import { saveReport } from "./data.js";

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker Registered (PWA)', reg.scope))
            .catch(err => console.error('Service Worker Registration Failed:', err));
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
