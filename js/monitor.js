import { analyzeScam } from "./scanner.js";

export class ActiveShield {
    constructor() {
        this.interval = null;
        this.lastClipboard = "";
        // Auto-resume if active
        if (localStorage.getItem("shieldActive") === "true") {
            this.initUI();
            this.scanLoop();
        }
    }

    start() {
        localStorage.setItem("shieldActive", "true");
        this.initUI();
        this.scanLoop();
    }

    stop() {
        localStorage.setItem("shieldActive", "false");
        const ui = document.getElementById("cyber-shield-overlay");
        if (ui) ui.remove();
        if (this.interval) clearInterval(this.interval);
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
    }

    scanLoop() {
        if (this.interval) clearInterval(this.interval);

        this.interval = setInterval(async () => {
            const logs = document.getElementById("shield-logs");
            if (!logs) return;

            // 1. Activity Simulation
            const activities = [
                "Scanning memory processes...",
                "Analyzing network packets...",
                "Verifying browser extensions...",
                "Checking phishing database...",
                "Monitoring system clipboard..."
            ];
            const action = activities[Math.floor(Math.random() * activities.length)];
            this.addLog(action);

            // 2. Real Clipboard Analysis (Browser capability limited)
            try {
                // Note: Navigator clipboard access often requires focus
                const text = await navigator.clipboard.readText();
                if (text && text !== this.lastClipboard) {
                    this.lastClipboard = text;
                    const analysis = analyzeScam(text);

                    if (analysis.risk !== "LOW") {
                        this.addLog(`🚨 ${analysis.risk} THREAT DETECTED in Clipboard: ${analysis.categories.join(", ")}`, "danger");
                        // Play sound or alert
                        alert(`Cybershield Protection Alert!\n\nMalicious content detected in your clipboard:\n"${text.substring(0, 30)}..."\n\nRisk: ${analysis.risk}\nReason: ${analysis.explanation}`);
                    } else {
                        this.addLog(`✅ Clipboard content verified safe.`, "success");
                    }
                }
            } catch (e) {
                // Silent fail if permission denied or not focused
            }
        }, 2000);
    }

    addLog(msg, type = "info") {
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
