import axe, { type AxeResults } from "axe-core";

const CORS_PROXY = "https://api.allorigins.win/raw?url=";

export async function fetchHtml(url: string): Promise<string> {
  let formatted = url.trim();
  if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
    formatted = `https://${formatted}`;
  }
  const response = await fetch(`${CORS_PROXY}${encodeURIComponent(formatted)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch page (${response.status})`);
  }
  return response.text();
}

export async function runAxeScan(html: string): Promise<AxeResults> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-same-origin");
    iframe.style.cssText = "position:fixed;left:-9999px;width:1024px;height:768px;opacity:0;pointer-events:none;";
    document.body.appendChild(iframe);

    iframe.onload = async () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) throw new Error("Cannot access iframe document");

        const results = await axe.run(doc.documentElement, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag2aaa", "wcag21a", "wcag21aa", "best-practice"] },
          resultTypes: ["violations", "passes", "incomplete"],
        });
        resolve(results);
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(iframe);
      }
    };

    iframe.onerror = () => {
      document.body.removeChild(iframe);
      reject(new Error("Failed to load content in iframe"));
    };

    iframe.srcdoc = html;
  });
}

export type SeverityLevel = "critical" | "serious" | "moderate" | "minor";

export function getSeverityOrder(impact: string | undefined): number {
  switch (impact) {
    case "critical": return 0;
    case "serious": return 1;
    case "moderate": return 2;
    case "minor": return 3;
    default: return 4;
  }
}
