import { useCallback } from "react";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import { ChatLog } from "@/lib/types";
import { demoData } from "@/lib/demo-data";

interface FileUploadProps {
  onDataLoaded: (data: ChatLog[]) => void;
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const csv = evt.target?.result;
      if (typeof csv === 'string') {
        // Send CSV to backend
        const res = await fetch('http://localhost:4000/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csv }),
        });
        const data = await res.json();
        onDataLoaded(data.contacts || []);
      }
    };
    reader.readAsText(file);
  }, [onDataLoaded]);

  return (
    <div className="flex flex-col items-center gap-8 py-20 px-6">
      <div className="text-center space-y-4 max-w-lg">
        <h1 className="text-4xl font-bold tracking-tight">
          Social <span className="text-primary">Autopilot</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          AR Relationship Intelligence System
        </p>
        <p className="text-sm text-muted-foreground/70">
          Upload your chat logs or explore the demo dataset to visualize relationship health.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <label className="cursor-pointer group">
          <div className="flex items-center gap-3 px-6 py-3 rounded-lg border border-border bg-secondary hover:bg-secondary/80 transition-all hover:glow-primary">
            <Upload className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-secondary-foreground">Upload CSV</span>
          </div>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFile}
          />
        </label>

        <button
          onClick={() => onDataLoaded(demoData)}
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all glow-primary"
        >
          Load Demo Data
        </button>
      </div>

      <div className="mt-8 text-xs text-muted-foreground/50 font-mono-display">
        Expected format: timestamp, sender, receiver, message
      </div>
    </div>
  );
}
