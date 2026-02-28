import { useCallback } from "react";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import { ChatLog, ContactAnalysis } from "@/lib/types";
import { demoData } from "@/lib/demo-data";
import { analyzeRelationships } from "@/lib/intelligence-engine";
interface FileUploadProps {
  onDataLoaded: (data: ContactAnalysis[]) => void;
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const csv = evt.target?.result;
      if (typeof csv === 'string') {
        try {
          // Parse CSV to convert timestamp format
          Papa.parse(csv, {
            header: true,
            complete: async (results) => {
              try {
                // Convert timestamps from ISO format to YYYY-MM-DD HH:MM:SS format
                const rows = results.data.filter((row: any) => row.timestamp); // Remove empty rows
                const formattedRows = rows.map((row: any) => {
                  let timestamp = row.timestamp;
                  // Check if it's ISO format and convert
                  if (timestamp && timestamp.includes('T')) {
                    try {
                      const date = new Date(timestamp);
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      const hours = String(date.getHours()).padStart(2, '0');
                      const minutes = String(date.getMinutes()).padStart(2, '0');
                      const seconds = String(date.getSeconds()).padStart(2, '0');
                      timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                    } catch (e) {
                      console.warn('Could not convert timestamp:', row.timestamp);
                    }
                  }
                  return { ...row, timestamp };
                });

                // Convert back to CSV format
                const headers = Object.keys(formattedRows[0] || {});
                const csvContent = [
                  headers.join(','),
                  ...formattedRows.map(row => 
                    headers.map(h => {
                      const val = row[h] || '';
                      // Escape values if needed
                      return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
                    }).join(',')
                  )
                ].join('\n');

                // Send formatted CSV to backend
                const res = await fetch('http://localhost:4000/api/analyze', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ csv: csvContent }),
                });
                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                const data = await res.json();
                
                console.log('Model response:', data);
                
                // Convert model response to ContactAnalysis format
                if (data.chat_type === '1on1' && data.features) {
                  const f = data.features;
                  const s = data.scores;
                  const contact: ContactAnalysis = {
                    name: f.contact || 'Unknown',
                    daysSinceLastInteraction: f.days_since_last || 0,
                    interactionCountLast30: f.last_30_count || 0,
                    interactionCountPrev30: f.prev_30_count || 0,
                    frequencyTrendPercent: f.frequency_trend_pct || 0,
                    initiationRatio: f.initiation_ratio || 0.5,
                    avgResponseDelay: f.avg_delay_hours || 0,
                    healthScore: s.health_score || 50,
                    state: s.health_state || 'Stable',
                    suggestedAction: (data.nudges && data.nudges.length > 0) ? data.nudges[0].action : 'Keep this relationship healthy',
                    trendDirection: (f.frequency_trend_pct || 0) > 0 ? 'up' : (f.frequency_trend_pct || 0) < 0 ? 'down' : 'stable',
                  };
                  console.log('Extracted contact:', contact);
                  onDataLoaded([contact]);
                } else if (data.chat_type === 'group' && data.features) {
                  // For group chats, create contacts from member profiles
                  const contacts: ContactAnalysis[] = [];
                  const members = data.features.member_profiles || {};
                  
                  Object.entries(members).forEach(([memberName, profile]: any) => {
                    const s = data.scores;
                    const contact: ContactAnalysis = {
                      name: memberName,
                      daysSinceLastInteraction: profile.days_since_last || 0,
                      interactionCountLast30: profile.msg_count || 0,
                      interactionCountPrev30: 0,
                      frequencyTrendPercent: data.features.frequency_trend_pct || 0,
                      initiationRatio: profile.session_start_pct / 100 || 0.5,
                      avgResponseDelay: profile.avg_delay_hours || 0,
                      healthScore: s.health_score || 50,
                      state: s.health_state || 'Stable',
                      suggestedAction: (data.nudges && data.nudges.length > 0) ? data.nudges[0].action : 'Keep group engaged',
                      trendDirection: (data.features.frequency_trend_pct || 0) > 0 ? 'up' : (data.features.frequency_trend_pct || 0) < 0 ? 'down' : 'stable',
                    };
                    contacts.push(contact);
                  });
                  
                  console.log('Extracted group contacts:', contacts);
                  onDataLoaded(contacts);
                } else {
                  console.error('Unexpected response format:', data);
                  onDataLoaded([]);
                }
              } catch (err) {
                console.error('Error processing CSV:', err);
                alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
                onDataLoaded([]);
              }
            },
            error: (error) => {
              console.error('CSV parse error:', error);
              alert('Error parsing CSV file');
              onDataLoaded([]);
            }
          });
        } catch (err) {
          console.error('Error uploading file:', err);
          alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
          onDataLoaded([]);
        }
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
          onClick={() => {
            const analyzed = analyzeRelationships(demoData);
            onDataLoaded(analyzed);
          }}
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
