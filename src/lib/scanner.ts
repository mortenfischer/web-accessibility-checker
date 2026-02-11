import axe, { type AxeResults } from "axe-core";

const CORS_PROXY = "https://api.allorigins.win/raw?url=";

export interface FetchAttempt {
  url: string;
  error: string;
}

export interface FetchResult {
  html: string;
  attempts: FetchAttempt[];
  successUrl: string;
}

export class FetchError extends Error {
  attempts: FetchAttempt[];
  constructor(message: string, attempts: FetchAttempt[]) {
    super(message);
    this.name = "FetchError";
    this.attempts = attempts;
  }
}

export async function fetchHtml(url: string): Promise<FetchResult> {
  const urls = [url];

  const urlObj = new URL(url);
  if (!urlObj.hostname.startsWith("www.")) {
    const wwwUrl = `${urlObj.protocol}//www.${urlObj.hostname}${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
    urls.push(wwwUrl);
  }

  const attempts: FetchAttempt[] = [];

  for (const attempt of urls) {
    try {
      const response = await fetch(`${CORS_PROXY}${encodeURIComponent(attempt)}`);
      if (!response.ok) {
        attempts.push({ url: attempt, error: `HTTP ${response.status} ${response.statusText || "error"}` });
        continue;
      }
      const html = await response.text();
      if (!html || html.trim().length === 0) {
        attempts.push({ url: attempt, error: "Empty response body" });
        continue;
      }
      return { html, attempts, successUrl: attempt };
    } catch (err) {
      const msg = err instanceof TypeError
        ? "Network error — DNS resolution failed or site unreachable"
        : err instanceof Error
          ? err.message
          : "Unknown fetch error";
      attempts.push({ url: attempt, error: msg });
    }
  }

  throw new FetchError(
    `All ${attempts.length} fetch attempt(s) failed`,
    attempts,
  );
}

export async function runAxeScan(html: string): Promise<AxeResults> {
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;left:-9999px;width:1024px;height:768px;opacity:0;pointer-events:none;";
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const results = await axe.run(container, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag2aaa", "wcag21a", "wcag21aa", "best-practice"] },
      resultTypes: ["violations", "passes", "incomplete"],
    });
    return results;
  } finally {
    document.body.removeChild(container);
  }
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
