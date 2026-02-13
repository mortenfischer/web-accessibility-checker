import type { AxeResults } from "axe-core";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, HelpCircle, XCircle, AlertCircle, Info, Eye, Focus } from "lucide-react";

interface SummaryDashboardProps {
  results: AxeResults;
  customViolationCount: number;
  overlapCount: number;
}

export function SummaryDashboard({ results, customViolationCount, overlapCount }: SummaryDashboardProps) {
  const severityCounts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  results.violations.forEach((v) => {
    const impact = (v.impact || "minor") as keyof typeof severityCounts;
    if (impact in severityCounts) severityCounts[impact]++;
  });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryCard
          label="Violations"
          count={results.violations.length + customViolationCount}
          icon={<AlertTriangle className="h-5 w-5" />}
          className="bg-destructive/8 text-destructive border-destructive/15"
        />
        <SummaryCard
          label="Passes"
          count={results.passes.length}
          icon={<CheckCircle2 className="h-5 w-5" />}
          className="bg-success/8 text-success border-success/15"
        />
        <SummaryCard
          label="Critical"
          count={severityCounts.critical}
          icon={<XCircle className="h-5 w-5" />}
          className="bg-severity-critical/8 text-severity-critical border-severity-critical/15"
        />
        <SummaryCard
          label="Serious"
          count={severityCounts.serious}
          icon={<AlertCircle className="h-5 w-5" />}
          className="bg-severity-serious/8 text-severity-serious border-severity-serious/15"
        />
        <SummaryCard
          label="Custom Checks"
          count={customViolationCount}
          icon={<Eye className="h-5 w-5" />}
          className="bg-accent/30 text-accent-foreground border-accent/30"
        />
        <SummaryCard
          label="Overlap"
          count={overlapCount}
          icon={<Focus className="h-5 w-5" />}
          className="bg-primary/8 text-primary border-primary/15"
        />
      </div>
    </div>
  );
}

function SummaryCard({ label, count, icon, className }: { label: string; count: number; icon: React.ReactNode; className: string }) {
  return (
    <Card className={`border rounded-xl ${className}`}>
      <CardContent className="flex flex-col items-center gap-1 p-4">
        {icon}
        <span className="text-2xl font-bold" style={{ fontFamily: "'DM Serif Display', serif" }}>{count}</span>
        <span className="text-xs font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
      </CardContent>
    </Card>
  );
}
