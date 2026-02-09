import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ScannerFormProps {
  onScan: (url: string) => void;
  isLoading: boolean;
}

export function ScannerForm({ onScan, isLoading }: ScannerFormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onScan(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl gap-3">
      <Input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter a URL to scan (e.g. example.com)"
        className="h-12 text-base"
        disabled={isLoading}
      />
      <Button type="submit" size="lg" disabled={isLoading || !url.trim()} className="h-12 px-6">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Search className="h-5 w-5" />
        )}
        <span className="ml-2">{isLoading ? "Scanning…" : "Scan"}</span>
      </Button>
    </form>
  );
}
