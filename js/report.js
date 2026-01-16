import { analyzeScam } from "./scanner.js";

/* ===== FORM HANDLER ===== */

const form = document.getElementById("report-form");

form.addEventListener("submit", e => {
  e.preventDefault();

  const type = document.getElementById("scam-type").value;
  const description = document.getElementById("description").value.trim();
  const contact = document.getElementById("contact").value.trim();

  if (!description) {
    alert("Description is required");
    return;
  }

  const safeContact = privacyFilter(contact);
  const combinedText = `${type} ${description} ${safeContact}`;

  // Always return analysis
  const analysis = analyzeScam(combinedText) || {
    categories: ["Unknown"],
    risk: "MEDIUM",
    explanation: "Suspicious activity detected based on user report."
  };

  const report = {
    id: Date.now(),
    type,
    description,
    contact: safeContact,
    risk: analysis.risk,
    explanation: analysis.explanation
  };

  showCaseFile(report);
});

/* ===== UI HANDOFF ===== */

function showCaseFile(report) {
  document.getElementById("report-container").style.display = "none";
  document.getElementById("case-file").style.display = "block";

  document.getElementById("case-ref").innerText =
    "CYB-" + report.id.toString().slice(-6);

  document.getElementById("case-risk").innerText = report.risk;

  document.getElementById("case-reports").innerText =
    Math.floor(Math.random() * 200) + " similar reports";

  document.getElementById("case-analysis").innerText =
    report.explanation;
}

/* ===== PRIVACY FILTER ===== */

function privacyFilter(text) {
  return text
    .replace(/(\w{3})[\w.-]+@([\w.]+)/g, "$1***@$2")
    .replace(/(\d{3})\d+(\d{2})/g, "$1******$2");
}            <ul>
                <li><strong>Complainant:</strong> <span class="draft-field" contenteditable="true">[Your Name]</span></li>
                <li><strong>Suspect Contact/Link:</strong> ${report.contact}</li>
                <li><strong>Medium:</strong> ${report.type === 'impersonation' ? 'Social Media/WhatsApp' : 'Internet/Call'}</li>
            </ul>
            <p><strong>Description of Offence:</strong><br>
            <span class="draft-field" contenteditable="true" style="width:100%; display:block;">${report.description}</span></p>
            <br>
            <p>I request you to take necessary legal action against the perpetrator and assist in removing the malicious content/recovering damages.</p>
            <br>
            <p>Yours Faithfully,<br><span class="draft-field" contenteditable="true">[Your Name]</span><br><span class="draft-field" contenteditable="true">[Your Phone Number]</span></p>
        `;
    }

    draftView.innerHTML = draftHTML;
}

function showCaseFile(report, analysis, isOffline = false) {
    document.getElementById("report-container").style.display = "none";
    const caseFile = document.getElementById("case-file");
    caseFile.style.display = "block";

    // Populate Data
    document.getElementById("case-ref").innerText = `CYB-${report.id.toString().substr(-6)}`;
    document.getElementById("case-risk").innerText = report.risk;

    // Mock Community Data relative to risk
    const communityCount = report.risk === "HIGH" ? Math.floor(Math.random() * 500) + 50 : Math.floor(Math.random() * 50);
    document.getElementById("case-reports").innerText = communityCount + " Matches";

    // Reveal Badge Reward
    const badge = document.getElementById("badge-container");
    if (badge) {
        badge.style.display = "block";
        // Simple confetti effect could go here
    }

    document.getElementById("case-analysis").innerHTML =
        `${report.explanation} <br><br> <strong>Recommended Action:</strong> Immediate escalation to ${report.type === 'financial' ? 'Bank & ' : ''}Cybercrime authorities.`;

    // Highlight relevant channels
    if (report.type === 'financial') {
        document.getElementById("channel-bank").style.border = "2px solid var(--accent-primary)";
    }

    // Attach data for PDF generation & Auto-Fill
    // Note: We changed 'download-pdf-btn' to 'open-draft-btn' in HTML, but we might still use the hidden btn or dataset on a common element.
    // Let's attach to the new button if it exists, or fall back to a common store.
    const btn = document.getElementById("open-draft-btn") || document.getElementById("download-pdf-btn");
    if (btn) {
        btn.dataset.report = JSON.stringify(report);
        // Also ensure download-pdf-btn has it for the finalize step
        const hiddenStore = document.getElementById("download-pdf-btn");
        if (hiddenStore && hiddenStore !== btn) hiddenStore.dataset.report = JSON.stringify(report);
    }

    window.scrollTo(0, 0);
}

function generatePDF(report) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(220, 0, 0);
    doc.text("OFFICIAL CYBERCRIME EVIDENCE FILE", 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated by Cybershield Platform | ${new Date().toLocaleString()}`, 20, 30);
    doc.line(20, 32, 190, 32);

    // Case Details
    doc.setFontSize(16);
    doc.text("1. Incident Summary", 20, 45);

    doc.setFontSize(12);
    doc.text(`Case Reference: CYB-${report.id.toString().substr(-6)}`, 20, 55);
    doc.text(`Risk Level: ${report.risk}`, 20, 62);
    doc.text(`Scam Type: ${report.type.toUpperCase()}`, 20, 69);
    doc.text(`Status: Verified by Intelligence System`, 20, 76);

    // Analysis
    doc.setFontSize(16);
    doc.text("2. Intelligence Analysis", 20, 90);
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(report.explanation, 170);
    doc.text(splitText, 20, 100);

    // Evidence
    let currentY = 100 + (splitText.length * 5) + 15;
    doc.setFontSize(16);
    doc.text("3. Suspect Identifiers (Evidence)", 20, currentY);

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Reported Identifier: ${report.contact}`, 20, currentY + 10);
    doc.text(`User Description:`, 20, currentY + 20);

    doc.setFontSize(10);
    const descText = doc.splitTextToSize(report.description, 170);
    doc.text(descText, 20, currentY + 30);

    // Disclaimer
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("This document is a preliminary evidence file generated by user report and automated analysis.", 20, 280);
    doc.text("Submit this file to police cyber cells or bank fraud departments.", 20, 285);

    doc.save(`Cybershield_Evidence_${report.id}.pdf`);
}

function privacyFilter(text) {
    // Basic PII Redaction for Privacy First Design
    // Hides email/phone partially
    return text.replace(/(\w{3})[\w.-]+@([\w.]+\w)/g, "$1***@$2")
        .replace(/(\d{3})\d+(\d{2})/g, "$1******$2");
}

function saveOfflineReport(report) {
    const queue = JSON.parse(localStorage.getItem("offlineReports")) || [];
    queue.push(report);
    localStorage.setItem("offlineReports", JSON.stringify(queue));

    // Attempt background sync registration if available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then(reg => {
            return reg.sync.register('sync-reports');
        }).catch(() => console.log("Background sync not supported"));
    }

}
