import { getReports } from "./data.js";
import { CorrelationEngine } from "./scanner.js";
import { activeShield } from "./monitor.js";

const container = document.getElementById("alertsContainer");
// Skeleton removed as per request

async function loadAlerts() {
    if (!container) return;

    try {
        const reports = await getReports();

        // 1. Render Correlation Insights
        const patterns = CorrelationEngine.analyzePatterns(reports);
        container.innerHTML = ""; // Clear existing content
        if (patterns && reports.length > 0) {
            const dashboard = document.createElement("div");
            dashboard.className = "correlation-dashboard";
            dashboard.innerHTML = `
                <div class="insight-card">
                    <h4>Trending Threat</h4>
                    <p class="highlight">${patterns.trendingScam || "None"}</p>
                </div>
                <div class="insight-card">
                    <h4>24h Activity</h4>
                    <p class="${patterns.recentSpike ? 'danger' : 'safe'}">
                        ${patterns.recentSpike ? "High Spike Detected" : "Normal Levels"}
                    </p>
                </div>
                <div class="insight-card full-width">
                    <h4>System Insight</h4>
                    <p>${patterns.insights}</p>
                </div>
            `;
            container.appendChild(dashboard);
        }

        // 2. Render Reports
        if (!reports || reports.length === 0) {
            container.innerHTML += "<div class='scam-card'><h3>No Recent Alerts</h3><p>Stay safe! Check back later for real-time scam updates.</p></div>";
        } else {
            const grid = document.createElement("div"); // Create a grid wrapper for reports
            grid.className = "scam-grid";

            reports.forEach(report => {
                const card = document.createElement("article");
                const riskClass = report.risk ? report.risk.toLowerCase() : 'low';
                card.className = `scam-card risk-${riskClass}`;

                const title = document.createElement("h3");
                title.textContent = report.type;

                const risk = document.createElement("span");
                risk.className = `risk-badge ${riskClass}`;
                risk.textContent = report.risk || 'LOW';

                // Lifecycle Status Badge
                const status = document.createElement("span");
                const statusText = report.status || "Active Investigation";
                let statusClass = "status-active";
                if (statusText.includes("Verified")) statusClass = "status-verified";
                if (statusText.includes("Resolved")) statusClass = "status-resolved";

                status.className = `status-badge ${statusClass}`;
                status.innerHTML = `● ${statusText}`;

                // Explainable AI Section
                const analysis = document.createElement("div");
                analysis.className = "analysis-box";
                analysis.innerHTML = `<strong>why this was flagged:</strong> ${report.explanation || "Manual user report."}`;

                const desc = document.createElement("p");
                desc.textContent = report.description;

                if (report.contact) {
                    const contactInfo = document.createElement("p");
                    contactInfo.style.fontSize = "0.9rem";
                    contactInfo.style.marginTop = "0.5rem";
                    contactInfo.style.color = "var(--text-secondary)";
                    contactInfo.innerHTML = `<strong>Suspect:</strong> ${report.contact}`;
                    card.appendChild(contactInfo);
                }

                const time = document.createElement("small");
                // Handle different timestamp formats if migrating data
                const dateVal = new Date(report.timestamp);
                time.textContent = isNaN(dateVal.getTime()) ? "Recently" : dateVal.toLocaleString();
                time.style.display = "block";
                time.style.marginTop = "1rem";
                time.style.color = "var(--text-secondary)";

                card.prepend(title, risk, status, analysis, desc);
                card.appendChild(time);
                grid.appendChild(card);
            });
            container.appendChild(grid);
        }
    } catch (e) {
        console.error("Failed to load alerts:", e);
        container.innerHTML = "<div class='error'>Failed to load alerts. Check your database configuration.</div>";
    }
}

loadAlerts();
