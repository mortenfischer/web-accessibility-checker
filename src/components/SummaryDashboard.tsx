import type { AxeResults } from "axe-core";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, HelpCircle, XCircle, AlertCircle, Info } from "lucide-react";

interface SummaryDashboardProps {
  results: AxeResults;
}

export function SummaryDashboard({ results }: SummaryDashboardProps) {
  const severityCounts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  results.violations.forEach((v) => {
    const impact = (v.impact || "minor") as keyof typeof severityCounts;
    if (impact in severityCounts) severityCounts[impact]++;
  });

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <SummaryCard
        label="Violations"
        count={results.violations.length}
        icon={<AlertTriangle className="h-5 w-5" />}
        className="bg-destructive/10 text-destructive border-destructive/20"
      />
      <SummaryCard
        label="Passes"
        count={results.passes.length}
        icon={<CheckCircle2 className="h-5 w-5" />}
        className="bg-success/10 text-success border-success/20"
      />
      <SummaryCard
        label="Critical"
        count={severityCounts.critical}
        icon={<XCircle className="h-5 w-5" />}
        className="bg-severity-critical/10 text-severity-critical border-severity-critical/20"
      />
      <SummaryCard
        label="Serious"
        count={severityCounts.serious}
        icon={<AlertCircle className="h-5 w-5" />}
        className="bg-severity-serious/10 text-severity-serious border-severity-serious/20"
      />
      <SummaryCard
        label="Moderate"
        count={severityCounts.moderate}
        icon={<Info className="h-5 w-5" />}
        className="bg-severity-moderate/10 text-severity-moderate border-severity-moderate/20"
      />
      <SummaryCard
        label="Minor"
        count={severityCounts.minor}
        icon={<HelpCircle className="h-5 w-5" />}
        className="bg-severity-minor/10 text-severity-minor border-severity-minor/20"
      />
    </div>
  );
}

function SummaryCard({ label, count, icon, className }: { label: string; count: number; icon: React.ReactNode; className: string }) {
  return (
    <Card className={`border ${className}`}>
      <CardContent className="flex flex-col items-center gap-1 p-4">
        {icon}
        <span className="text-2xl font-bold">{count}</span>
        <span className="text-xs font-medium">{label}</span>
      </CardContent>
    </Card>
  );
}
