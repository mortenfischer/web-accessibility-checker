/**
 * Custom accessibility checks for color contrast and focus indicators.
 * These supplement axe-core findings.
 */

export type CheckSource = "axe" | "custom-contrast" | "custom-focus";

export interface CustomViolation {
  id: string;
  source: CheckSource;
  impact: "critical" | "serious" | "moderate" | "minor";
  help: string;
  description: string;
  helpUrl: string;
  tags: string[];
  nodes: {
    target: string[];
    failureSummary: string;
  }[];
}

// ── Color helpers ────────────────────────────────────────────────

function parseColor(raw: string): { r: number; g: number; b: number; a: number } | null {
  const rgba = raw.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (rgba) {
    return { r: +rgba[1], g: +rgba[2], b: +rgba[3], a: rgba[4] !== undefined ? +rgba[4] : 1 };
  }
  // Hex
  const hex = raw.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    if (h.length === 6) h += "ff";
    return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16), a: parseInt(h.slice(6,8),16)/255 };
  }
  return null;
}

function sRGBtoLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * sRGBtoLinear(r) + 0.7152 * sRGBtoLinear(g) + 0.0722 * sRGBtoLinear(b);
}

function contrastRatio(fg: { r: number; g: number; b: number }, bg: { r: number; g: number; b: number }): number {
  const l1 = relativeLuminance(fg.r, fg.g, fg.b);
  const l2 = relativeLuminance(bg.r, bg.g, bg.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function blendAlpha(fg: { r: number; g: number; b: number; a: number }, bg: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
  return {
    r: Math.round(fg.r * fg.a + bg.r * (1 - fg.a)),
    g: Math.round(fg.g * fg.a + bg.g * (1 - fg.a)),
    b: Math.round(fg.b * fg.a + bg.b * (1 - fg.a)),
  };
}

function getEffectiveBg(el: Element): { r: number; g: number; b: number } {
  let current: Element | null = el;
  const layers: { r: number; g: number; b: number; a: number }[] = [];

  while (current && current instanceof HTMLElement) {
    const style = getComputedStyle(current);
    const parsed = parseColor(style.backgroundColor);
    if (parsed) {
      layers.unshift(parsed); // stack bottom-up
      if (parsed.a === 1) break; // opaque — no need to go further
    }
    current = current.parentElement;
  }

  // Start with white as the page default
  let result = { r: 255, g: 255, b: 255 };
  for (const layer of layers) {
    result = blendAlpha(layer, result);
  }
  return result;
}

function getCssSelector(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const classes = el.className && typeof el.className === "string"
    ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".")
    : "";
  return `${tag}${id}${classes}`;
}

// ── Contrast check ───────────────────────────────────────────────

export function runContrastCheck(container: HTMLElement): CustomViolation[] {
  const textElements = container.querySelectorAll("*");
  const failingNodes: CustomViolation["nodes"][0][] = [];

  const checked = new Set<string>();

  textElements.forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const text = el.textContent?.trim();
    if (!text || text.length === 0) return;
    // Only check leaf-ish text nodes
    if (el.children.length > 3) return;

    const style = getComputedStyle(el);
    const fgParsed = parseColor(style.color);
    if (!fgParsed) return;

    const bg = getEffectiveBg(el);
    const fg = blendAlpha(fgParsed, bg);
    const ratio = contrastRatio(fg, bg);

    const fontSize = parseFloat(style.fontSize);
    const fontWeight = parseInt(style.fontWeight) || 400;
    const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);

    const minRatio = isLargeText ? 3 : 4.5;
    const selector = getCssSelector(el);

    if (ratio < minRatio && !checked.has(selector)) {
      checked.add(selector);
      failingNodes.push({
        target: [selector],
        failureSummary: `Contrast ratio ${ratio.toFixed(2)}:1 (requires ${minRatio}:1). FG: rgb(${fg.r},${fg.g},${fg.b}), BG: rgb(${bg.r},${bg.g},${bg.b})`,
      });
    }
  });

  if (failingNodes.length === 0) return [];

  return [{
    id: "custom-color-contrast",
    source: "custom-contrast",
    impact: failingNodes.some(n => {
      const ratio = parseFloat(n.failureSummary.match(/ratio ([\d.]+)/)?.[1] || "4.5");
      return ratio < 2;
    }) ? "critical" : "serious",
    help: "Elements must have sufficient color contrast",
    description: "Text elements were found with foreground/background color combinations that do not meet WCAG 2.1 Level AA minimum contrast ratios (4.5:1 for normal text, 3:1 for large text).",
    helpUrl: "https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum",
    tags: ["wcag143", "wcag2aa"],
    nodes: failingNodes,
  }];
}

// ── Focus indicator check ────────────────────────────────────────

const FOCUSABLE_SELECTOR = 'a[href], button, input, select, textarea, [tabindex], [role="button"], [role="link"], [role="checkbox"], [role="radio"], [role="tab"]';

export function runFocusIndicatorCheck(container: HTMLElement): CustomViolation[] {
  const focusable = container.querySelectorAll(FOCUSABLE_SELECTOR);
  const failingNodes: CustomViolation["nodes"][0][] = [];
  const checked = new Set<string>();

  focusable.forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const selector = getCssSelector(el);
    if (checked.has(selector)) return;
    checked.add(selector);

    // Check inline styles and style attributes for focus-suppressing patterns
    const inlineStyle = el.getAttribute("style") || "";
    const suppressesOutline = /outline\s*:\s*(none|0)\b/i.test(inlineStyle);

    if (suppressesOutline) {
      // Check if there's a compensating border/box-shadow
      const hasBorderCompensation = /border.*:.*\d/i.test(inlineStyle);
      const hasBoxShadow = /box-shadow\s*:(?!.*none)/i.test(inlineStyle);

      if (!hasBorderCompensation && !hasBoxShadow) {
        failingNodes.push({
          target: [selector],
          failureSummary: `Element has "outline: none/0" in inline styles without a visible alternative focus indicator (border or box-shadow).`,
        });
      }
    }
  });

  // Also check <style> blocks for global focus suppression
  const styleBlocks = container.querySelectorAll("style");
  const globalSuppressions: string[] = [];
  styleBlocks.forEach((styleEl) => {
    const css = styleEl.textContent || "";
    // Look for :focus { outline: none } or *:focus { outline: 0 }
    const focusRules = css.match(/[^{}]*:focus[^{]*\{[^}]*outline\s*:\s*(none|0)[^}]*\}/gi);
    if (focusRules) {
      focusRules.forEach((rule) => {
        // Check if same rule has compensating box-shadow or border
        const hasCompensation = /box-shadow\s*:(?!.*none)/i.test(rule) || /border.*:\s*\d/i.test(rule);
        if (!hasCompensation) {
          const selectorMatch = rule.match(/^([^{]+)/);
          globalSuppressions.push(selectorMatch?.[1]?.trim() || "unknown selector");
        }
      });
    }
  });

  if (globalSuppressions.length > 0) {
    globalSuppressions.forEach((sel) => {
      failingNodes.push({
        target: [sel],
        failureSummary: `CSS rule suppresses focus outline via "outline: none/0" without visible alternative. Keyboard users may not see focus location.`,
      });
    });
  }

  if (failingNodes.length === 0) return [];

  return [{
    id: "custom-focus-indicator",
    source: "custom-focus",
    impact: "serious",
    help: "Interactive elements must have visible focus indicators",
    description: "Focusable elements were found with suppressed outline styles (:focus { outline: none }) and no visible alternative focus indicator. This violates WCAG 2.4.7 Focus Visible.",
    helpUrl: "https://www.w3.org/WAI/WCAG21/Understanding/focus-visible",
    tags: ["wcag247", "wcag2aa"],
    nodes: failingNodes,
  }];
}

// ── Run all custom checks ────────────────────────────────────────

export function runCustomChecks(container: HTMLElement): CustomViolation[] {
  return [
    ...runContrastCheck(container),
    ...runFocusIndicatorCheck(container),
  ];
}
