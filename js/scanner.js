// Enhanced Scam Keywords with weights and categories
export const SCAM_SIGNATURES = {
    "Financial Urgency": { keywords: ["urgent", "immediately", "suspended", "verify account", "unauthorized", "act now", "action required", "risk indicator"], weight: 0.95 },
    "Job Scam": { keywords: ["hiring", "work from home", "easy money", "no experience", "recruit", "daily payment", "part time", "security deposit"], weight: 0.8 },
    "Phishing": { keywords: ["password", "login link", "verify identity", "bank details", "update your", "kyc", "pan card"], weight: 0.85 },
    "Prize/Lottery": { keywords: ["winner", "lottery", "prize", "jackpot", "claim your", "lucky draw"], weight: 0.7 },
    "Crypto/Investment": { keywords: ["bitcoin", "crypto", "double your", "investment", "guaranteed return", "nvidia", "apple", "get rich"], weight: 0.9 },
    "Supply Chain/Logistics": { keywords: ["delivery attempt", "package pending", "customs fee", "warehouse", "delivery failed", "address incomplete"], weight: 0.75 },
    "Deepfake/Impersonation": { keywords: ["voice note", "video call", "emergency help", "hospital", "jail", "accident"], weight: 0.85 }
};

export function analyzeScam(text) {
    const lower = text.toLowerCase();
    const matches = [];
    let totalScore = 0;
    const signaturesDetected = new Set();

    // 1. Keyword Analysis
    for (const [type, data] of Object.entries(SCAM_SIGNATURES)) {
        data.keywords.forEach(word => {
            if (lower.includes(word)) {
                matches.push({ word, type, weight: data.weight });
                totalScore += data.weight;
                signaturesDetected.add(type);
            }
        });
    }

    // 2. Tone/Urgency Analysis (Simple Heuristic: ALL CAPS, Exclamation Marks)
    const upperCaseCount = (text.match(/[A-Z]/g) || []).length;
    const totalChars = text.length; // Avoid div/0
    const upperCaseRatio = totalChars > 0 ? upperCaseCount / totalChars : 0;

    if (upperCaseRatio > 0.4 && totalChars > 10) {
        totalScore += 0.5;
        matches.push({ word: "EXCESSIVE CAPS", type: "Aggressive Tone", weight: 0.5 });
    }

    if ((text.match(/!{2,}/g) || []).length > 0) {
        totalScore += 0.3;
        matches.push({ word: "!!", type: "Artificial Urgency", weight: 0.3 });
    }

    // Normalized logic for risk
    let risk = "LOW";
    // Adjusted thresholds for stricter detection
    if (totalScore >= 1.2) risk = "HIGH";
    else if (totalScore >= 0.5) risk = "MEDIUM";

    return {
        risk,
        score: Math.min(totalScore * 10, 100).toFixed(0), // Scale to 0-100 roughly
        categories: Array.from(signaturesDetected),
        matches: matches,
        explanation: generateExplanation(matches, risk)
    };
}

function generateExplanation(matches, risk) {
    if (matches.length === 0) return "No specific scam patterns detected, but always stay vigilant.";

    const topFactors = matches.map(m => `"${m.word}" (${m.type})`).join(", ");
    return `Flagged as ${risk} Risk due to detection of: ${topFactors}. These patterns are commonly associated with fraud.`;
}

// Pattern Correlation Engine
export class CorrelationEngine {
    static analyzePatterns(reports) {
        if (!reports || reports.length === 0) return null;

        const clusters = {};
        let trendingType = null;
        let maxCount = 0;

        // Correlate by Scam Type and specific keywords
        reports.forEach(r => {
            // Count types
            clusters[r.type] = (clusters[r.type] || 0) + 1;
            if (clusters[r.type] > maxCount) {
                maxCount = clusters[r.type];
                trendingType = r.type;
            }
        });

        // Time-based correlation (High density of reports in last 24h)
        const recentReports = reports.filter(r => {
            const timeDiff = Date.now() - new Date(r.timestamp).getTime();
            return timeDiff < 24 * 60 * 60 * 1000;
        });

        return {
            totalReports: reports.length,
            trendingScam: trendingType,
            recentSpike: recentReports.length > 5, // Alert if >5 reports in 24h
            insights: `Trend Alert: ${trendingType} is the most reported threat (${maxCount} reports).`
        };
    }
}

// Wrapper for backward compatibility if needed, though we should update calls
export function detectScamTypes(text) {
    const analysis = analyzeScam(text);
    return analysis.categories;
}

export function calculateRiskLevel(types) {
    // This is now redundant but kept for any legacy calls not yet updated
    // The analyzeScam function handles risk calculation better
    if (types.length >= 3) return "HIGH";
    if (types.length >= 1) return "MEDIUM";
    return "LOW";
}