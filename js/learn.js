import { detectScamTypes, calculateRiskLevel } from "./scanner.js";

const container = document.getElementById("articlesContainer");
const API_KEY = "pub_20a8f3dc96a64a59b65820e7dd08c264";
// Updated query to include specific高-priority trends
const url = "https://newsdata.io/api/1/news?apikey=" + API_KEY + "&q=cybercrime%20OR%20job%20scam%20OR%20UPI%20fraud%20OR%20crypto%20scam&language=en&category=technology&size=10";

async function fetchNews() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        renderArticles(data.results);
    } catch (error) {
        console.error('Error fetching news:', error);
        showError("Error loading news. Please try again later.");
    }
}

function renderArticles(articles) {
    container.innerHTML = "";

    if (!articles || articles.length === 0) {
        showError("No articles found.");
        return;
    }

    // High Priority Keywords for sorting/highlighting
    const priorityKeywords = ["job", "upi", "payment", "crypto", "investment", "supply chain", "amazon", "delivery"];

    // Sort: Priority items first
    articles.sort((a, b) => {
        const aText = (a.title + a.description).toLowerCase();
        const bText = (b.title + b.description).toLowerCase();
        const aHasPriority = priorityKeywords.some(k => aText.includes(k));
        const bHasPriority = priorityKeywords.some(k => bText.includes(k));
        return bHasPriority - aHasPriority;
    });

    articles.forEach(article => {
        const combinedText = `${article.title} ${article.description || ""}`;

        const scamTypes = detectScamTypes(combinedText);
        let riskLevel = calculateRiskLevel(scamTypes);

        // Boost risk level for priority topics
        const isPriority = priorityKeywords.some(k => combinedText.toLowerCase().includes(k));
        if (isPriority && riskLevel === "LOW") riskLevel = "MEDIUM";

        const card = document.createElement("article");
        const riskClass = riskLevel ? riskLevel.toLowerCase() : 'low';
        card.className = `scam-card risk-${riskClass}`;
        if (isPriority) {
            card.style.borderColor = "var(--accent-secondary)";
            card.style.boxShadow = "0 0 15px rgba(188, 19, 254, 0.1)";
        }

        const title = document.createElement("h3");
        title.textContent = article.title || "No title";

        const desc = document.createElement("p");
        desc.textContent = article.description || "No description available.";

        const tag = document.createElement("span");
        tag.className = "scam-tag";
        tag.textContent = scamTypes.length
            ? scamTypes.join(", ")
            : (isPriority ? "Emerging Threat" : "General Cyber Alert");

        const badge = document.createElement("span");
        badge.className = `risk-badge ${riskClass}`;
        badge.textContent = riskLevel || 'LOW';

        const meta = document.createElement("small");
        const sourceName = article.source_id || (article.source ? article.source.name : 'Unknown');
        meta.textContent = `Source: ${sourceName} | ${formatDate(article.pubDate)}`;

        const link = document.createElement("a");
        link.href = article.link || article.url;
        link.textContent = "Read Full Article";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.style.display = "block";
        link.style.marginTop = "auto";

        card.append(badge, title, tag, desc, meta, link);
        container.appendChild(card);
    });
}

function formatDate(dateString) {
    if (!dateString) return 'Recent';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    } catch (e) {
        return dateString;
    }
}

function showError(message) {
    container.innerHTML = "";
    const errorMsg = document.createElement("p");
    errorMsg.className = "error";
    errorMsg.textContent = message;
    container.appendChild(errorMsg);
}


if (container) {
    fetchNews();
}