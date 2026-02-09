import type { Result } from "axe-core";
import { ExternalLink } from "lucide-react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge, WcagLevelBadge } from "./SeverityBadge";
import { extractWcagCriteria, extractWcagLevel } from "@/lib/wcag-mapping";

interface ViolationCardProps {
  violation: Result;
  index: number;
}

export function ViolationCard({ violation, index }: ViolationCardProps) {
  const wcagCriteria = extractWcagCriteria(violation.tags);
  const wcagLevel = extractWcagLevel(violation.tags);

  return (
    <AccordionItem value={`violation-${index}`} className="rounded-lg border bg-card px-4">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex flex-1 flex-wrap items-center gap-2 text-left">
          <SeverityBadge impact={violation.impact} />
          {wcagLevel && <WcagLevelBadge level={wcagLevel} />}
          {wcagCriteria.slice(0, 2).map((c) => (
            <Badge key={c.id} variant="outline" className="text-xs font-mono">
              {c.id}
            </Badge>
          ))}
          <span className="font-medium">{violation.help}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {violation.nodes.length} element{violation.nodes.length !== 1 ? "s" : ""}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pb-2">
          {/* WCAG Criteria */}
          {wcagCriteria.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-muted-foreground">WCAG Success Criteria</h4>
              <div className="flex flex-wrap gap-2">
                {wcagCriteria.map((c) => (
                  <a
                    key={c.id}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent transition-colors"
                  >
                    <span className="font-mono font-bold">{c.id}</span>
                    <span>{c.name}</span>
                    <span className="text-muted-foreground">(Level {c.level})</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground">Description</h4>
            <p className="text-sm">{violation.description}</p>
          </div>

          {/* Remediation */}
          {violation.helpUrl && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground">How to Fix</h4>
              <a
                href={violation.helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                View remediation guidance <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Affected Elements */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground">
              Affected Elements ({violation.nodes.length})
            </h4>
            <div className="mt-1 max-h-48 space-y-2 overflow-y-auto">
              {violation.nodes.slice(0, 10).map((node, i) => (
                <div key={i} className="rounded bg-muted p-2">
                  <code className="block text-xs break-all">{node.target.join(" > ")}</code>
                  {node.failureSummary && (
                    <p className="mt-1 text-xs text-muted-foreground">{node.failureSummary}</p>
                  )}
                </div>
              ))}
              {violation.nodes.length > 10 && (
                <p className="text-xs text-muted-foreground">…and {violation.nodes.length - 10} more</p>
              )}
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
