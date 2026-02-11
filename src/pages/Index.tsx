import { useState } from "react";
import type { AxeResults } from "axe-core";
import { ScannerForm } from "@/components/ScannerForm";
import { ResultsReport } from "@/components/ResultsReport";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { fetchHtml, runAxeScan, FetchError, type FetchAttempt } from "@/lib/scanner";
import { Shield } from "lucide-react";

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

      {results && (
        <div className="mt-10 w-full flex justify-center">
          <ResultsReport results={results} url={scannedUrl} />
        </div>
      )}
    </main>
  );
};

export default Index;
