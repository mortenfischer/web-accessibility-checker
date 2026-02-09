import { jsPDF } from "jspdf";
import type { AxeResults, Result } from "axe-core";
import { extractWcagCriteria } from "./wcag-mapping";

export function generatePdfReport(results: AxeResults, url: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  const addPage = () => { doc.addPage(); y = 20; };
  const checkPage = (needed: number) => { if (y + needed > 270) addPage(); };

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Accessibility Scan Report", 14, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`URL: ${url}`, 14, y);
  y += 6;
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, y);
  y += 10;

  // Summary
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Violations: ${results.violations.length}`, 14, y); y += 5;
  doc.text(`Passes: ${results.passes.length}`, 14, y); y += 5;
  doc.text(`Incomplete: ${results.incomplete.length}`, 14, y); y += 10;

  // Severity breakdown
  const severityCounts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  results.violations.forEach(v => {
    const impact = (v.impact || "minor") as keyof typeof severityCounts;
    if (impact in severityCounts) severityCounts[impact]++;
  });

  doc.text(`Critical: ${severityCounts.critical} | Serious: ${severityCounts.serious} | Moderate: ${severityCounts.moderate} | Minor: ${severityCounts.minor}`, 14, y);
  y += 12;

  // Violations detail
  if (results.violations.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Violations", 14, y);
    y += 8;

    results.violations.forEach((violation: Result, index: number) => {
      checkPage(40);

      const wcagCriteria = extractWcagCriteria(violation.tags);
      const wcagText = wcagCriteria.map(c => `${c.id} ${c.name} (Level ${c.level})`).join(", ");

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const title = `${index + 1}. ${violation.help}`;
      const titleLines = doc.splitTextToSize(title, pageWidth - 28);
      doc.text(titleLines, 14, y);
      y += titleLines.length * 5 + 2;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      doc.text(`Severity: ${violation.impact || "unknown"}`, 14, y); y += 4;

      if (wcagText) {
        checkPage(10);
        const wcagLines = doc.splitTextToSize(`WCAG: ${wcagText}`, pageWidth - 28);
        doc.text(wcagLines, 14, y);
        y += wcagLines.length * 4 + 2;
      }

      checkPage(10);
      const descLines = doc.splitTextToSize(violation.description, pageWidth - 28);
      doc.text(descLines, 14, y);
      y += descLines.length * 4 + 2;

      if (violation.helpUrl) {
        checkPage(6);
        doc.text(`More info: ${violation.helpUrl}`, 14, y);
        y += 4;
      }

      // Affected elements (max 3)
      const nodes = violation.nodes.slice(0, 3);
      if (nodes.length > 0) {
        checkPage(8);
        doc.text(`Affected elements (${violation.nodes.length} total):`, 14, y); y += 4;
        nodes.forEach(node => {
          checkPage(6);
          const selector = doc.splitTextToSize(`  • ${node.target.join(", ")}`, pageWidth - 32);
          doc.text(selector, 18, y);
          y += selector.length * 4;
        });
      }

      y += 6;
    });
  }

  doc.save(`accessibility-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
