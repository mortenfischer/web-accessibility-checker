import { useState } from "react";
import type { AxeResults } from "axe-core";
import { ScannerForm } from "@/components/ScannerForm";
import { ResultsReport } from "@/components/ResultsReport";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { fetchHtml, runFullScan, FetchError, type FetchAttempt, type CombinedResults } from "@/lib/scanner";
import { Shield, CheckCircle2, AlertTriangle, Info } from "lucide-react";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [combinedResults, setCombinedResults] = useState<CombinedResults | null>(null);
  const [scannedUrl, setScannedUrl] = useState("");
  const [fetchError, setFetchError] = useState<{ message: string; attempts: FetchAttempt[] } | null>(null);
  const { toast } = useToast();

  const handleScan = async (url: string) => {
    setIsLoading(true);
    setProgress(10);
    setCombinedResults(null);
    setScannedUrl(url);
    setFetchError(null);

    try {
      setProgress(30);
      const fetchResult = await fetchHtml(url);

      setProgress(60);
      const results = await runFullScan(fetchResult.html);

      setProgress(100);
      setCombinedResults(results);

      const totalViolations = results.taggedViolations.length;
      toast({
        title: "Scan complete",
        description: `Found ${totalViolations} violation${totalViolations !== 1 ? "s" : ""} (${results.axeResults.violations.length} axe + ${results.customViolations.length} custom checks) and ${results.axeResults.passes.length} passes.`,
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
    <main className="flex min-h-screen flex-col items-center bg-background">
      {/* Hero Section */}
      <div className="w-full bg-accent/40 px-4 pb-16 pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-5xl font-normal tracking-tight text-foreground sm:text-6xl">
            Accessibility Scanner
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Scan any webpage for WCAG accessibility issues — instantly.
          </p>
          <div className="mt-8">
            <ScannerForm onScan={handleScan} isLoading={isLoading} fetchError={fetchError} />
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="mt-10 w-full max-w-2xl space-y-2 px-4">
          <Progress value={progress} className="h-1.5" />
          <p className="text-center text-sm text-muted-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {progress < 30
              ? "Fetching page…"
              : progress < 60
                ? "Loading content…"
                : "Running accessibility analysis (axe-core + custom checks)…"}
          </p>
        </div>
      )}

      {/* Info Section */}
      {!combinedResults && !isLoading && (
        <section className="w-full px-4 py-16">
          <div className="mx-auto max-w-4xl space-y-12">
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  title: "WCAG 2.1 Coverage",
                  desc: "Checks against Level A, AA, and AAA success criteria plus best-practice rules powered by axe-core.",
                },
                {
                  title: "Contrast & Focus Checks",
                  desc: "Custom color contrast analysis and focus indicator detection supplement axe-core for broader coverage.",
                },
                {
                  title: "Cross-Referenced Results",
                  desc: "Findings are tagged by source engine so you can see what both scanners found vs. unique findings.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-border/60 bg-card p-6 transition-shadow hover:shadow-md"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <h3 className="text-lg font-normal text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/40 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-5">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-lg font-normal text-foreground">Good to know</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {[
                  { title: "Static HTML only", desc: "SPA content rendered via JavaScript won't be analyzed — only the initial server-rendered HTML." },
                  { title: "No login-protected pages", desc: "Pages behind authentication can't be scanned since the fetcher has no access to your session." },
                  { title: "CORS proxy", desc: "HTML is fetched through a public proxy. Some sites may block requests or return different content." },
                  { title: "Single page scan", desc: "Only the specific URL you enter is scanned. It does not crawl or scan multiple pages." },
                  { title: "Automated checks only", desc: "Automated tools catch roughly 30–40% of WCAG issues. Manual testing remains essential." },
                  { title: "Open source engine", desc: "Powered by axe-core plus custom contrast/focus checks for broader WCAG coverage." },
                ].map((c) => (
                  <div key={c.title} className="flex items-start gap-3">
                    <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium text-foreground">{c.title}</span>
                      <p className="text-xs leading-relaxed text-muted-foreground mt-0.5">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      {combinedResults && (
        <div className="w-full px-4 py-10">
          <div className="mx-auto flex max-w-4xl justify-center">
            <ResultsReport combinedResults={combinedResults} url={scannedUrl} />
          </div>
        </div>
      )}
    </main>
  );
};

export default Index;
