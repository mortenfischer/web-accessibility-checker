import { useState, useMemo } from "react";
import type { AxeResults } from "axe-core";
import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { SummaryDashboard } from "./SummaryDashboard";
import { ViolationCard } from "./ViolationCard";
import { generatePdfReport } from "@/lib/pdf-report";
import { extractWcagLevel } from "@/lib/wcag-mapping";
import { getSeverityOrder, type CombinedResults, type TaggedViolation } from "@/lib/scanner";

interface ResultsReportProps {
  combinedResults: CombinedResults;
  url: string;
}

type SeverityFilter = "all" | "critical" | "serious" | "moderate" | "minor";
type WcagFilter = "all" | "A" | "AA" | "AAA";
type SourceFilter = "all" | "axe" | "custom" | "both";

export function ResultsReport({ combinedResults, url }: ResultsReportProps) {
  const { axeResults, taggedViolations } = combinedResults;
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [wcagFilter, setWcagFilter] = useState<WcagFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  const filteredViolations = useMemo(() => {
    return taggedViolations
      .filter((v) => severityFilter === "all" || v.impact === severityFilter)
      .filter((v) => {
        if (wcagFilter === "all") return true;
        const level = extractWcagLevel(v.tags);
        return level === wcagFilter;
      })
      .filter((v) => {
        if (sourceFilter === "all") return true;
        if (sourceFilter === "both") return v.source.length > 1;
        if (sourceFilter === "axe") return v.source.includes("axe") && v.source.length === 1;
        if (sourceFilter === "custom") return !v.source.includes("axe");
        return true;
      })
      .sort((a, b) => getSeverityOrder(a.impact) - getSeverityOrder(b.impact));
  }, [taggedViolations, severityFilter, wcagFilter, sourceFilter]);

  const bothCount = taggedViolations.filter(v => v.source.length > 1).length;
  const axeOnlyCount = taggedViolations.filter(v => v.source.includes("axe") && v.source.length === 1).length;
  const customOnlyCount = taggedViolations.filter(v => !v.source.includes("axe")).length;

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Scan Results</h2>
        <Button variant="outline" className="rounded-full" onClick={() => generatePdfReport(axeResults, url)}>
          <Download className="mr-2 h-4 w-4" /> <span style={{ fontFamily: "'DM Sans', sans-serif" }}>Download PDF</span>
        </Button>
      </div>

      <SummaryDashboard results={axeResults} customViolationCount={combinedResults.customViolations.length} overlapCount={bothCount} />

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
          <span className="text-xs font-medium text-muted-foreground self-center">Source:</span>
          {([
            { key: "all" as SourceFilter, label: "All", count: taggedViolations.length },
            { key: "axe" as SourceFilter, label: "axe-core only", count: axeOnlyCount },
            { key: "custom" as SourceFilter, label: "Custom only", count: customOnlyCount },
            { key: "both" as SourceFilter, label: "Both scanners", count: bothCount },
          ]).map(({ key, label, count }) => (
            <Badge
              key={key}
              variant={sourceFilter === key ? "default" : "outline"}
              className="cursor-pointer rounded-full"
              onClick={() => setSourceFilter(key)}
            >
              {label} ({count})
            </Badge>
          ))}
        </div>
      </div>

      {/* Violations */}
      {filteredViolations.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <p className="text-muted-foreground">
            {taggedViolations.length === 0
              ? "🎉 No violations found!"
              : "No violations match the current filters."}
          </p>
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
