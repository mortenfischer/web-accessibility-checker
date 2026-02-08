

# Accessibility Scanner App

## Overview
A tool where users paste a URL, the page is fetched and scanned for accessibility issues using axe-core, and results are displayed in a clean, readable report mapped to WCAG success criteria, with PDF download.

## How It Works
1. User enters a URL
2. Firecrawl fetches the full HTML of the page (server-side, bypassing CORS)
3. The HTML is loaded into a hidden sandboxed iframe
4. axe-core runs against the iframe DOM to detect accessibility violations
5. Results are displayed grouped and linked to WCAG success criteria
6. User can download the report as a PDF

## Pages & Features

### Scanner Page (Home)
- Clean, centered input field for the URL
- "Scan" button with loading state and progress indicator

### Results Report

- **Summary Dashboard**: Total violations, passes, and incomplete checks with color-coded severity counts

- **WCAG-Organized Violations**: Each violation card includes:
  - Issue name and severity badge (critical, serious, moderate, minor)
  - **WCAG Success Criterion** tag (e.g., "1.1.1 Non-text Content", "4.1.2 Name, Role, Value") — axe-core provides these as tags on each rule
  - **WCAG Level** badge (A, AA, AAA)
  - Description of the issue
  - Affected elements (CSS selectors shown in code blocks)
  - Remediation guidance from axe-core
  - Link to the official WCAG understanding document for that criterion

- **Filter & Group options**:
  - Filter by severity level
  - Filter by WCAG level (A / AA / AAA)
  - Group by WCAG success criterion (so all violations for the same criterion are together)

- **Download as PDF** button generating a formatted report including WCAG references

## Backend
- Firecrawl connector to fetch page HTML via Supabase Edge Function
- Lovable Cloud for hosting the edge function

## Design
- Clean, professional layout with clear visual hierarchy
- Color-coded severity badges (red = critical, orange = serious, yellow = moderate, blue = minor)
- WCAG level pills (e.g., green "A", blue "AA", purple "AAA")
- Expandable accordion cards to keep the report scannable
- Grouped view by WCAG criterion for compliance-focused review

