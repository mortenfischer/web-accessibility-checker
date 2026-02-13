import axe, { type AxeResults } from "axe-core";
import { runCustomChecks, type CustomViolation, type CheckSource } from "./custom-checks";

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

/** Tagged violation that tracks which scanner found it */
export interface TaggedViolation {
  id: string;
  source: CheckSource[];
  impact: string | undefined;
  help: string;
  description: string;
  helpUrl: string;
  tags: string[];
  nodes: { target: string[]; failureSummary?: string }[];
}

/** Combined results from axe-core + custom checks */
export interface CombinedResults {
  axeResults: AxeResults;
  customViolations: CustomViolation[];
  taggedViolations: TaggedViolation[];
}

function mergeViolations(axeViolations: AxeResults["violations"], customViolations: CustomViolation[]): TaggedViolation[] {
  const tagged: TaggedViolation[] = [];

  // Track which custom violations overlap with axe
  const customOverlap = new Set<string>();

  // Add axe violations, checking for overlap with custom
  for (const v of axeViolations) {
    const sources: CheckSource[] = ["axe"];

    // Check overlap: if axe found contrast issues and custom also did
    if (v.id === "color-contrast") {
      const customContrast = customViolations.find(c => c.id === "custom-color-contrast");
      if (customContrast) {
        sources.push("custom-contrast");
        customOverlap.add("custom-color-contrast");
      }
    }

    tagged.push({
      id: v.id,
      source: sources,
      impact: v.impact,
      help: v.help,
      description: v.description,
      helpUrl: v.helpUrl,
      tags: v.tags,
      nodes: v.nodes.map(n => ({ target: n.target.map(String), failureSummary: n.failureSummary })),
    });
  }

  // Add custom violations that weren't overlapping
  for (const cv of customViolations) {
    if (customOverlap.has(cv.id)) continue;
    tagged.push({
      id: cv.id,
      source: [cv.source],
      impact: cv.impact,
      help: cv.help,
      description: cv.description,
      helpUrl: cv.helpUrl,
      tags: cv.tags,
      nodes: cv.nodes,
    });
  }

  return tagged;
}

export async function runFullScan(html: string): Promise<CombinedResults> {
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;left:-9999px;width:1024px;height:768px;opacity:0;pointer-events:none;";
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const axeResults = await axe.run(container, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag2aaa", "wcag21a", "wcag21aa", "best-practice"] },
      resultTypes: ["violations", "passes", "incomplete"],
    });

    const customViolations = runCustomChecks(container);
    const taggedViolations = mergeViolations(axeResults.violations, customViolations);

    return { axeResults, customViolations, taggedViolations };
  } finally {
    document.body.removeChild(container);
  }
}

// Keep for backward compat
export async function runAxeScan(html: string): Promise<AxeResults> {
  const result = await runFullScan(html);
  return result.axeResults;
}

export type { CheckSource, CustomViolation };

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
