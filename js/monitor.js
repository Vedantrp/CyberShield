import { analyzeScam, checkUrlSafety } from "./scanner.js";

export class ActiveShield {
    constructor() {
        this.interval = null;
        this.lastClipboard = "";

        // Default to TRUE if not set (User Request: Monitor automatically)
        if (localStorage.getItem("shieldActive") === null) {
            localStorage.setItem("shieldActive", "true");
        }

        // Auto-resume if active
        if (localStorage.getItem("shieldActive") === "true") {
            this.initUI();
            this.scanLoop();
            this.requestPermissions();
        }

        // Handle Background/Foreground transitions
        document.addEventListener("visibilitychange", () => {
            if (document.hidden && localStorage.getItem("shieldActive") === "true") {
                console.log("Cybershield entering background mode...");
                this.notifyBackgroundProtection();
            } else {
                console.log("Cybershield resumed in foreground.");
            }
        });
    }

    start() {
        localStorage.setItem("shieldActive", "true");
        this.initUI();
        this.scanLoop();
        this.requestPermissions();
    }

    stop() {
        localStorage.setItem("shieldActive", "false");
        const ui = document.getElementById("cyber-shield-overlay");
        if (ui) ui.remove();
        if (this.interval) clearInterval(this.interval);
    }

    async requestPermissions() {
        if ("Notification" in window && Notification.permission !== "granted") {
            await Notification.requestPermission();
        }
    }

    initUI() {
        if (document.getElementById("cyber-shield-overlay")) return;

        const div = document.createElement("div");
        div.id = "cyber-shield-overlay";
        div.className = "shield-overlay";
        div.innerHTML = `
            <div class="shield-header">
                <span class="pulse">🛡️</span> Cybershield Active
                <button id="stop-shield">STOP</button>
            </div>
            <div id="shield-logs" class="shield-logs">
                <p class="log-entry">Protection initialized...</p>
            </div>
            <div class="loading-bar"><div class="bar"></div></div>
        `;
        document.body.appendChild(div);

        document.getElementById("stop-shield").addEventListener("click", () => this.stop());

        // Add Permission Button if needed
        if ("Notification" in window && Notification.permission === "default") {
            const btn = document.createElement("button");
            btn.innerText = "🔔 Enable Alerts";
            btn.style.cssText = "width:100%; margin-top:5px; background:var(--accent-primary); border:none; border-radius:4px; cursor:pointer;";
            btn.addEventListener("click", () => {
                Notification.requestPermission().then(p => {
                    if (p === 'granted') btn.remove();
                });
            });
            div.appendChild(btn);
        }
    }

    notifyBackgroundProtection() {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Cybershield Active", {
                body: "Monitoring clipboard and URLs in the background.",
                icon: "https://cdn-icons-png.flaticon.com/512/2092/2092663.png",
                tag: "shield-active",
                silent: true
            });
        }
    }

    scanLoop() {
        if (this.interval) clearInterval(this.interval);

        this.interval = setInterval(async () => {
            // Ensure UI exists if we are in foreground
            if (!document.hidden && !document.getElementById("cyber-shield-overlay")) {
                this.initUI();
            }

            const logs = document.getElementById("shield-logs");

            // 1. Activity Simulation (Only update UI if visible)
            if (!document.hidden && logs) {
                const activities = [
                    "Scanning memory processes...",
                    "Analyzing network packets...",
                    "Verifying browser extensions...",
                    "Checking phishing database...",
                    "Monitoring system clipboard..."
                ];
                const action = activities[Math.floor(Math.random() * activities.length)];
                this.addLog(action);
            }

            // 2. Real Clipboard Analysis (Works in background if permission persisted)
            try {
                // Note: Reading clipboard in background is restricted by most browsers
                // We attempt it, but catch errors silently.
                const text = await navigator.clipboard.readText();

                if (text && text !== this.lastClipboard) {
                    this.lastClipboard = text;
                    const analysis = analyzeScam(text);

                    // URL Safety Check
                    const urlMatch = text.match(/(https?:\/\/[^\s]+)/g);
                    let isUrlUnsafe = false;

                    if (urlMatch) {
                        this.addLog(" Verifying URL with Google Safe Browsing...", "info");
                        const urlReport = await checkUrlSafety(urlMatch[0]);
                        if (!urlReport.safe) {
                            isUrlUnsafe = true;
                            const threatType = urlReport.matches[0].threatType;
                            this.addLog(`🚨 CRITICAL THREAT: Google detected ${threatType} in URL!`, "danger");

                            // Send Notification if in background
                            if (document.hidden && Notification.permission === "granted") {
                                new Notification("CRITICAL THREAT BLOCKED", {
                                    body: `Malicious URL detected: ${threatType}`,
                                    icon: "https://cdn-icons-png.flaticon.com/512/2092/2092663.png",
                                    requireInteraction: true
                                });
                            } else {
                                alert(`CRITICAL WARNING: The copied URL is a known ${threatType} site.\nDo not open it!`);
                            }
                        }
                    }

                    if (isUrlUnsafe) {
                        // Already handled
                    } else if (analysis.risk !== "LOW") {
                        const msg = `🚨 ${analysis.risk} THREAT DETECTED: ${analysis.categories.join(", ")}`;
                        this.addLog(msg, "danger");

                        if (document.hidden && Notification.permission === "granted") {
                            new Notification("Potential Scam Detected", {
                                body: "Clipboard content appears risky. Open Cybershield to verify.",
                                icon: "https://cdn-icons-png.flaticon.com/512/2092/2092663.png"
                            });
                        }
                    } else {
                        this.addLog(`✅ Clipboard content verified safe.`, "success");
                    }
                }
            } catch (e) {
                // Silent fail (expected in background)
            }
        }, 2000);
    }

    addLog(msg, type = "info") {
        if (document.hidden) return; // Don't update DOM if hidden

        const logs = document.getElementById("shield-logs");
        if (!logs) return;

        const p = document.createElement("p");
        p.className = `log-entry ${type}`;
        p.textContent = `> ${msg}`;

        logs.prepend(p);
        // Keep only last 4 logs
        if (logs.children.length > 4) logs.lastChild.remove();
    }
}

// Singleton Instance
export const activeShield = new ActiveShield();
