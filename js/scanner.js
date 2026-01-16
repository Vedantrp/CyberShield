// ===============================
// Enhanced Scam Signature Engine
// ===============================

export const SCAM_SIGNATURES = {
    "Financial Urgency": {
        keywords: ["urgent", "immediately", "suspended", "verify account", "unauthorized", "act now", "action required"],
        weight: 0.9
    },
    "Job Scam": {
        keywords: ["hiring", "work from home", "easy money", "no experience", "daily payment", "security deposit"],
        weight: 0.8
    },
    "Phishing": {
        keywords: ["password", "login link", "verify identity", "bank details", "kyc", "pan card"],
        weight: 0.85
    },
    "Prize / Lottery": {
        keywords: ["winner", "lottery", "prize", "jackpot", "claim your"],
        weight: 0.7
    },
    "Crypto / Investment": {
        keywords: ["bitcoin", "crypto", "investment", "guaranteed return", "double your", "get rich"],
        weight: 0.9
    },
    "Logistics Scam": {
        keywords: ["delivery failed", "package pending", "customs fee", "address incomplete"],
        weight: 0.75
    },
    "Deepfake / Impersonation": {
        keywords: ["voice note", "video call", "emergency help", "hospital", "accident"],
        weight: 0.85
    }
};

// ===============================
// Core Analysis Function
// ===============================

export function analyzeScam(text) {
    const lower = text.toLowerCase();
    let totalScore = 0;
    const matches = [];
    const detectedCategories = new Set();

    // 1️⃣ Keyword-based detection (one hit per category)
    for (const [category, data] of Object.entries(SCAM_SIGNATURES)) {
        for (const keyword of data.keywords) {
            if (lower.includes(keyword)) {
                detectedCategories.add(category);
                totalScore += data.weight;
                matches.push({ keyword, category, weight: data.weight });
                break; // prevent score inflation per category
            }
        }
    }

    // 2️⃣ Urgency / Tone Heuristics
    const upperRatio = (text.match(/[A-Z]/g) || []).length / Math.max(text.length, 1);

    if (upperRatio > 0.4 && text.length > 12) {
        totalScore += 0.4;
        matches.push({ keyword: "EXCESSIVE CAPS", category: "Aggressive Tone", weight: 0.4 });
    }

    if (/!{2,}/.test(text)) {
        totalScore += 0.3;
        matches.push({ keyword: "!!", category: "Artificial Urgency", weight: 0.3 });
    }

    // 3️⃣ Risk Classification
    let risk = "LOW";
    if (totalScore >= 1.2) risk = "HIGH";
    else if (totalScore >= 0.6) risk = "MEDIUM";

    // 4️⃣ Safety fallback
    if (detectedCategories.size === 0 && totalScore > 0) {
        detectedCategories.add("Suspicious Behavior");
    }

    return {
        risk,
        score: Math.min(Math.round(totalScore * 100), 100),
        categories: Array.from(detectedCategories),
        matches,
        explanation: generateExplanation(matches, risk)
    };
}

// ===============================
// Explainable AI Output
// ===============================

function generateExplanation(matches, risk) {
    if (matches.length === 0) {
        return "No explicit scam indicators were detected, but users are advised to remain cautious.";
    }

    const reasons = matches
        .map(m => `"${m.keyword}" (${m.category})`)
        .join(", ");

    return `Classified as ${risk} risk due to detected indicators: ${reasons}. These patterns are commonly associated with fraudulent activity.`;
}

// ===============================
// Community Correlation Engine
// ===============================

export class CorrelationEngine {
    static analyzePatterns(reports = []) {
        if (reports.length === 0) return null;

        const countByType = {};
        let dominantType = null;
        let max = 0;

        reports.forEach(r => {
            countByType[r.type] = (countByType[r.type] || 0) + 1;
            if (countByType[r.type] > max) {
                max = countByType[r.type];
                dominantType = r.type;
            }
        });

        const recentReports = reports.filter(r =>
            Date.now() - new Date(r.timestamp).getTime() < 24 * 60 * 60 * 1000
        );

        return {
            totalReports: reports.length,
            trendingScam: dominantType,
            recentSpike: recentReports.length >= 5,
            insights: `High activity detected for ${dominantType} scams (${max} reports).`
        };
    }
}
