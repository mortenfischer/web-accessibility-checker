// Maps axe-core tags to WCAG success criteria info
export interface WcagCriterion {
  id: string;       // e.g. "1.1.1"
  name: string;     // e.g. "Non-text Content"
  level: "A" | "AA" | "AAA";
  url: string;      // understanding doc URL
}

const wcagData: Record<string, WcagCriterion> = {
  "wcag111": { id: "1.1.1", name: "Non-text Content", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/non-text-content" },
  "wcag121": { id: "1.2.1", name: "Audio-only and Video-only", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/audio-only-and-video-only-prerecorded" },
  "wcag122": { id: "1.2.2", name: "Captions (Prerecorded)", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/captions-prerecorded" },
  "wcag123": { id: "1.2.3", name: "Audio Description or Media Alternative", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/audio-description-or-media-alternative-prerecorded" },
  "wcag124": { id: "1.2.4", name: "Captions (Live)", level: "AA", url: "https://www.w3.org/WAI/WCAG21/Understanding/captions-live" },
  "wcag125": { id: "1.2.5", name: "Audio Description", level: "AA", url: "https://www.w3.org/WAI/WCAG21/Understanding/audio-description-prerecorded" },
  "wcag131": { id: "1.3.1", name: "Info and Relationships", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships" },
  "wcag132": { id: "1.3.2", name: "Meaningful Sequence", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/meaningful-sequence" },
  "wcag133": { id: "1.3.3", name: "Sensory Characteristics", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/sensory-characteristics" },
  "wcag134": { id: "1.3.4", name: "Orientation", level: "AA", url: "https://www.w3.org/WAI/WCAG21/Understanding/orientation" },
  "wcag135": { id: "1.3.5", name: "Identify Input Purpose", level: "AA", url: "https://www.w3.org/WAI/WCAG21/Understanding/identify-input-purpose" },
  "wcag141": { id: "1.4.1", name: "Use of Color", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/use-of-color" },
  "wcag142": { id: "1.4.2", name: "Audio Control", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/audio-control" },
  "wcag143": { id: "1.4.3", name: "Contrast (Minimum)", level: "AA", url: "https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum" },
  "wcag144": { id: "1.4.4", name: "Resize Text", level: "AA", url: "https://www.w3.org/WAI/WCAG21/Understanding/resize-text" },
  "wcag145": { id: "1.4.5", name: "Images of Text", level: "AA", url: "https://www.w3.org/WAI/WCAG21/Understanding/images-of-text" },
  "wcag146": { id: "1.4.6", name: "Contrast (Enhanced)", level: "AAA", url: "https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced" },
  "wcag1410": { id: "1.4.10", name: "Reflow", level: "AA", url: "https://www.w3.org/WAI/WCAG21/Understanding/reflow" },
  "wcag1411": { id: "1.4.11", name: "Non-text Contrast", level: "AA", url: "https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast" },
  "wcag1412": { id: "1.4.12", name: "Text Spacing", level: "AA", url: "https://www.w3.org/WAI/WCAG21/Understanding/text-spacing" },
  "wcag1413": { id: "1.4.13", name: "Content on Hover or Focus", level: "AA", url: "https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus" },
  "wcag211": { id: "2.1.1", name: "Keyboard", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/keyboard" },
  "wcag212": { id: "2.1.2", name: "No Keyboard Trap", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/no-keyboard-trap" },
  "wcag241": { id: "2.4.1", name: "Bypass Blocks", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks" },
  "wcag242": { id: "2.4.2", name: "Page Titled", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/page-titled" },
  "wcag243": { id: "2.4.3", name: "Focus Order", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/focus-order" },
  "wcag244": { id: "2.4.4", name: "Link Purpose (In Context)", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context" },
  "wcag245": { id: "2.4.5", name: "Multiple Ways", level: "AA", url: "https://www.w3.org/WAI/WCAG21/Understanding/multiple-ways" },
  "wcag246": { id: "2.4.6", name: "Headings and Labels", level: "AA", url: "https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels" },
  "wcag247": { id: "2.4.7", name: "Focus Visible", level: "AA", url: "https://www.w3.org/WAI/WCAG21/Understanding/focus-visible" },
  "wcag251": { id: "2.5.1", name: "Pointer Gestures", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/pointer-gestures" },
  "wcag252": { id: "2.5.2", name: "Pointer Cancellation", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/pointer-cancellation" },
  "wcag253": { id: "2.5.3", name: "Label in Name", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/label-in-name" },
  "wcag311": { id: "3.1.1", name: "Language of Page", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/language-of-page" },
  "wcag312": { id: "3.1.2", name: "Language of Parts", level: "AA", url: "https://www.w3.org/WAI/WCAG21/Understanding/language-of-parts" },
  "wcag321": { id: "3.2.1", name: "On Focus", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/on-focus" },
  "wcag322": { id: "3.2.2", name: "On Input", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/on-input" },
  "wcag323": { id: "3.2.3", name: "Consistent Navigation", level: "AA", url: "https://www.w3.org/WAI/WCAG21/Understanding/consistent-navigation" },
  "wcag324": { id: "3.2.4", name: "Consistent Identification", level: "AA", url: "https://www.w3.org/WAI/WCAG21/Understanding/consistent-identification" },
  "wcag331": { id: "3.3.1", name: "Error Identification", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/error-identification" },
  "wcag332": { id: "3.3.2", name: "Labels or Instructions", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions" },
  "wcag333": { id: "3.3.3", name: "Error Suggestion", level: "AA", url: "https://www.w3.org/WAI/WCAG21/Understanding/error-suggestion" },
  "wcag411": { id: "4.1.1", name: "Parsing", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/parsing" },
  "wcag412": { id: "4.1.2", name: "Name, Role, Value", level: "A", url: "https://www.w3.org/WAI/WCAG21/Understanding/name-role-value" },
  "wcag413": { id: "4.1.3", name: "Status Messages", level: "AA", url: "https://www.w3.org/WAI/WCAG21/Understanding/status-messages" },
};

export function extractWcagCriteria(tags: string[]): WcagCriterion[] {
  const criteria: WcagCriterion[] = [];
  for (const tag of tags) {
    if (wcagData[tag]) {
      criteria.push(wcagData[tag]);
    }
  }
  return criteria;
}

export function extractWcagLevel(tags: string[]): "A" | "AA" | "AAA" | null {
  if (tags.includes("wcag2aaa")) return "AAA";
  if (tags.includes("wcag2aa")) return "AA";
  if (tags.includes("wcag2a") || tags.includes("wcag21a")) return "A";
  if (tags.includes("wcag21aa")) return "AA";
  return null;
}
