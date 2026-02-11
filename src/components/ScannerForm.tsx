import { useState } from "react";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FetchAttempt } from "@/lib/scanner";

interface ScannerFormProps {
  onScan: (url: string) => void;
  isLoading: boolean;
  fetchError?: { message: string; attempts: FetchAttempt[] } | null;
}

export function ScannerForm({ onScan, isLoading, fetchError }: ScannerFormProps) {
  const [url, setUrl] = useState("");
  const [protocol, setProtocol] = useState("https://");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = url.trim();
    if (raw) onScan(`${protocol}${raw}`);
  };

  const handleUrlChange = (value: string) => {
    const stripped = value.replace(/^https?:\/\//, "");
    setUrl(stripped);
  };

  return (
    <div className="w-full max-w-2xl space-y-3">
      <form onSubmit={handleSubmit} className="flex w-full gap-3">
        <div className="flex flex-1 overflow-hidden rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
          <Select value={protocol} onValueChange={setProtocol} disabled={isLoading}>
            <SelectTrigger className="h-12 w-[110px] shrink-0 rounded-none border-0 border-r border-input focus:ring-0 focus:ring-offset-0 text-sm text-muted-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="https://">https://</SelectItem>
              <SelectItem value="http://">http://</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="text"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="example.com"
            className="h-12 flex-1 rounded-none border-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isLoading}
          />
        </div>
        <Button type="submit" size="lg" disabled={isLoading || !url.trim()} className="h-12 px-6">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
          <span className="ml-2">{isLoading ? "Scanning…" : "Scan"}</span>
        </Button>
      </form>

      {fetchError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 space-y-2">
          <div className="flex items-center gap-2 text-destructive font-medium text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {fetchError.message}
          </div>
          {fetchError.attempts.length > 0 && (
            <div className="space-y-1 pl-6">
              <p className="text-xs text-muted-foreground font-medium">
                {fetchError.attempts.length} attempt{fetchError.attempts.length !== 1 ? "s" : ""} made:
              </p>
              {fetchError.attempts.map((attempt, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="font-mono shrink-0">#{i + 1}</span>
                  <span className="font-mono break-all">{attempt.url}</span>
                  <span className="shrink-0">→</span>
                  <span className="text-destructive/80">{attempt.error}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
