import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CheckSource } from "@/lib/scanner";

const sourceLabels: Record<CheckSource, string> = {
  axe: "axe-core",
  "custom-contrast": "Contrast Check",
  "custom-focus": "Focus Check",
};

const sourceStyles: Record<string, string> = {
  single: "bg-secondary text-secondary-foreground",
  both: "bg-primary text-primary-foreground",
};

export function SourceBadge({ sources }: { sources: CheckSource[] }) {
  const isBoth = sources.length > 1;

  if (isBoth) {
    return (
      <Badge className={cn("text-[10px] font-semibold rounded-full", sourceStyles.both)}>
        Both Scanners
      </Badge>
    );
  }

  return (
    <Badge className={cn("text-[10px] font-semibold rounded-full", sourceStyles.single)}>
      {sourceLabels[sources[0]] || sources[0]}
    </Badge>
  );
}
