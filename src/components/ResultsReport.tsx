import { useState, useMemo } from "react";
import type { AxeResults } from "axe-core";
import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { SummaryDashboard } from "./SummaryDashboard";
import { ViolationCard } from "./ViolationCard";
import { generatePdfReport } from "@/lib/pdf-report";
import { extractWcagCriteria, extractWcagLevel } from "@/lib/wcag-mapping";
import { getSeverityOrder } from "@/lib/scanner";

interface ResultsReportProps {
  results: AxeResults;
  url: string;
}

type SeverityFilter = "all" | "critical" | "serious" | "moderate" | "minor";
type WcagFilter = "all" | "A" | "AA" | "AAA";
type GroupBy = "severity" | "wcag";

export function ResultsReport({ results, url }: ResultsReportProps) {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [wcagFilter, setWcagFilter] = useState<WcagFilter>("all");
  const [groupBy, setGroupBy] = useState<GroupBy>("severity");

  const filteredViolations = useMemo(() => {
    return results.violations
      .filter((v) => severityFilter === "all" || v.impact === severityFilter)
      .filter((v) => {
        if (wcagFilter === "all") return true;
        const level = extractWcagLevel(v.tags);
        return level === wcagFilter;
      })
      .sort((a, b) => getSeverityOrder(a.impact) - getSeverityOrder(b.impact));
  }, [results.violations, severityFilter, wcagFilter]);

  const groupedByWcag = useMemo(() => {
    if (groupBy !== "wcag") return null;
    const groups: Record<string, typeof filteredViolations> = {};
    filteredViolations.forEach((v) => {
      const criteria = extractWcagCriteria(v.tags);
      if (criteria.length === 0) {
        const key = "Other";
        (groups[key] ??= []).push(v);
      } else {
        criteria.forEach((c) => {
          const key = `${c.id} ${c.name}`;
          (groups[key] ??= []).push(v);
        });
      }
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredViolations, groupBy]);

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Scan Results</h2>
        <Button variant="outline" className="rounded-full" onClick={() => generatePdfReport(results, url)}>
          <Download className="mr-2 h-4 w-4" /> <span style={{ fontFamily: "'DM Sans', sans-serif" }}>Download PDF</span>
        </Button>
      </div>

      <SummaryDashboard results={results} />

      {/* Filters */}
      <div className="space-y-3 rounded-xl border bg-card p-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" /> Filters
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium text-muted-foreground self-center">Severity:</span>
          {(["all", "critical", "serious", "moderate", "minor"] as SeverityFilter[]).map((s) => (
            <Badge
              key={s}
              variant={severityFilter === s ? "default" : "outline"}
              className="cursor-pointer capitalize rounded-full"
              onClick={() => setSeverityFilter(s)}
            >
              {s}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium text-muted-foreground self-center">WCAG Level:</span>
          {(["all", "A", "AA", "AAA"] as WcagFilter[]).map((w) => (
            <Badge
              key={w}
              variant={wcagFilter === w ? "default" : "outline"}
              className="cursor-pointer rounded-full"
              onClick={() => setWcagFilter(w)}
            >
              {w === "all" ? "All" : `Level ${w}`}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium text-muted-foreground self-center">Group by:</span>
          {(["severity", "wcag"] as GroupBy[]).map((g) => (
            <Badge
              key={g}
              variant={groupBy === g ? "default" : "outline"}
              className="cursor-pointer capitalize rounded-full"
              onClick={() => setGroupBy(g)}
            >
              {g === "wcag" ? "WCAG Criterion" : g}
            </Badge>
          ))}
        </div>
      </div>

      {/* Violations */}
      {filteredViolations.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <p className="text-muted-foreground">
            {results.violations.length === 0
              ? "🎉 No violations found!"
              : "No violations match the current filters."}
          </p>
        </div>
      ) : groupBy === "wcag" && groupedByWcag ? (
        <div className="space-y-6">
          {groupedByWcag.map(([criterion, violations]) => (
            <div key={criterion}>
              <h3 className="mb-2 text-lg">{criterion}</h3>
              <Accordion type="multiple" className="space-y-2">
                {violations.map((v, i) => (
                  <ViolationCard key={`${criterion}-${v.id}-${i}`} violation={v} index={i} />
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {filteredViolations.map((v, i) => (
            <ViolationCard key={`${v.id}-${i}`} violation={v} index={i} />
          ))}
        </Accordion>
      )}
    </div>
  );
}
