import { useState } from "react";
import type { AxeResults } from "axe-core";
import { ScannerForm } from "@/components/ScannerForm";
import { ResultsReport } from "@/components/ResultsReport";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { fetchHtml, runAxeScan, FetchError, type FetchAttempt } from "@/lib/scanner";
import { Shield, CheckCircle2, AlertTriangle, Info } from "lucide-react";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<AxeResults | null>(null);
  const [scannedUrl, setScannedUrl] = useState("");
  const [fetchError, setFetchError] = useState<{ message: string; attempts: FetchAttempt[] } | null>(null);
  const { toast } = useToast();

  const handleScan = async (url: string) => {
    setIsLoading(true);
    setProgress(10);
    setResults(null);
    setScannedUrl(url);
    setFetchError(null);

    try {
      setProgress(30);
      const fetchResult = await fetchHtml(url);

      setProgress(60);
      const axeResults = await runAxeScan(fetchResult.html);

      setProgress(100);
      setResults(axeResults);

      toast({
        title: "Scan complete",
        description: `Found ${axeResults.violations.length} violation${axeResults.violations.length !== 1 ? "s" : ""} and ${axeResults.passes.length} passes.`,
      });
    } catch (err) {
      console.error("Scan failed:", err);
      if (err instanceof FetchError) {
        setFetchError({ message: err.message, attempts: err.attempts });
      } else {
        setFetchError({
          message: err instanceof Error ? err.message : "An unknown error occurred",
          attempts: [],
        });
      }
      toast({
        title: "Scan failed",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-background px-4 py-12">
      <header className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Accessibility Scanner</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Scan any webpage for WCAG accessibility issues
        </p>
      </header>

      <ScannerForm onScan={handleScan} isLoading={isLoading} fetchError={fetchError} />

      {isLoading && (
        <div className="mt-8 w-full max-w-2xl space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-sm text-muted-foreground">
            {progress < 30
              ? "Fetching page…"
              : progress < 60
                ? "Loading content…"
                : "Running accessibility analysis…"}
          </p>
        </div>
      )}

      {!results && !isLoading && (
        <section className="mt-12 w-full max-w-3xl space-y-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-card p-5 space-y-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">WCAG 2.1 Coverage</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Checks against WCAG 2.1 Level A, AA, and AAA success criteria plus best-practice rules powered by axe-core.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-5 space-y-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">Detailed Reports</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Results are grouped by WCAG criterion with severity badges, affected selectors, remediation guidance, and PDF export.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-5 space-y-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">Automatic Retries</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If a URL fails to load, the scanner automatically retries with the www. prefix and shows detailed error info.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/30 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Good to know</h3>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-2">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span><strong>Static HTML only</strong> — The scanner fetches the server-rendered HTML. Single-page apps (React, Vue, Angular) that render content via JavaScript will only have their initial HTML shell analyzed, not the fully rendered page.</span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span><strong>No login-protected pages</strong> — Pages behind authentication cannot be scanned since the fetcher has no access to your session or cookies.</span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span><strong>CORS proxy</strong> — HTML is fetched through a public CORS proxy. Some sites may block proxy requests or return different content than what a browser sees.</span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span><strong>Single page scan</strong> — Only the specific URL you enter is scanned. It does not crawl links or scan multiple pages automatically.</span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span><strong>Automated checks only</strong> — Automated tools can catch roughly 30–40% of WCAG issues. Manual testing (keyboard navigation, screen reader usage, cognitive review) is still essential for full compliance.</span>
              </li>
            </ul>
          </div>
        </section>
      )}

      {results && (
        <div className="mt-10 w-full flex justify-center">
          <ResultsReport results={results} url={scannedUrl} />
        </div>
      )}
    </main>
  );
};

export default Index;
