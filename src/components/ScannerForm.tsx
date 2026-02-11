import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScannerFormProps {
  onScan: (url: string) => void;
  isLoading: boolean;
}

export function ScannerForm({ onScan, isLoading }: ScannerFormProps) {
  const [url, setUrl] = useState("");
  const [protocol, setProtocol] = useState("https://");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = url.trim();
    if (raw) onScan(`${protocol}${raw}`);
  };

  const handleUrlChange = (value: string) => {
    // Strip protocol if user pastes a full URL
    const stripped = value.replace(/^https?:\/\//, "");
    setUrl(stripped);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl gap-3">
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
  );
}
