import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const severityStyles: Record<string, string> = {
  critical: "bg-severity-critical text-severity-critical-foreground",
  serious: "bg-severity-serious text-severity-serious-foreground",
  moderate: "bg-severity-moderate text-severity-moderate-foreground",
  minor: "bg-severity-minor text-severity-minor-foreground",
};

export function SeverityBadge({ impact }: { impact: string | undefined }) {
  const level = impact || "minor";
  return (
    <Badge className={cn("text-xs font-semibold uppercase rounded-full", severityStyles[level] || severityStyles.minor)}>
      {level}
    </Badge>
  );
}

const wcagLevelStyles: Record<string, string> = {
  A: "bg-wcag-a text-white",
  AA: "bg-wcag-aa text-white",
  AAA: "bg-wcag-aaa text-white",
};

export function WcagLevelBadge({ level }: { level: "A" | "AA" | "AAA" }) {
  return (
    <Badge className={cn("text-xs font-bold rounded-full", wcagLevelStyles[level])}>
      Level {level}
    </Badge>
  );
}
