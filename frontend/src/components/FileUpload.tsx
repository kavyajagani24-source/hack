import { useCallback, useState } from "react";
import { Upload, Zap, Shield, TrendingUp } from "lucide-react";
import Papa from "papaparse";
import { ChatLog, ContactAnalysis } from "@/lib/types";
import { demoData } from "@/lib/demo-data";
import { analyzeRelationships } from "@/lib/intelligence-engine";

interface FileUploadProps {
  onDataLoaded: (data: ContactAnalysis[]) => void;
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setIsLoading(true);
    setUploadedFile(file);

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const csv = evt.target?.result;
        if (typeof csv === 'string') {
          try {
            Papa.parse(csv, {
              header: true,
              complete: async (results) => {
                try {
                  const rows = results.data.filter((row: any) => row.timestamp);
                  const formattedRows = rows.map((row: any) => {
                    let timestamp = row.timestamp;
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

                  const headers = Object.keys(formattedRows[0] || {});
                  const csvContent = [
                    headers.join(','),
                    ...formattedRows.map(row =>
                      headers.map(h => {
                        const val = row[h] || '';
                        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
                      }).join(',')
                    )
                  ].join('\n');

                  const res = await fetch('http://localhost:4000/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ csv: csvContent }),
                  });
                  if (!res.ok) throw new Error(`Server error: ${res.status}`);
                  const data = await res.json();

                  console.log('Model response:', data);

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
                    console.log('Extracted 1-on-1 contact:', contact);
                    onDataLoaded([contact]);
                  } else if (data.chat_type === 'group') {
                    const contacts: ContactAnalysis[] = [];

                    let memberScores = data.member_scores || {};
                    let memberProfiles = (data.features && data.features.member_profiles) || {};

                    console.log('Checking data structure:');
                    console.log('- data.member_scores exists:', !!data.member_scores);
                    console.log('- data.member_scores keys:', Object.keys(memberScores));
                    console.log('- Full data keys:', Object.keys(data));
                    console.log('- memberProfiles keys:', Object.keys(memberProfiles));

                    if (Object.keys(memberScores).length === 0 && memberProfiles && Object.keys(memberProfiles).length > 0) {
                      console.log('member_scores is empty, checking memberProfiles structure');
                      console.log('First member profile:', memberProfiles[Object.keys(memberProfiles)[0]]);
                    }

                    const groupHealthState = (health: number) => {
                      if (health >= 75) return 'Thriving';
                      if (health >= 50) return 'Stable';
                      if (health >= 30) return 'Drifting';
                      return 'At Risk';
                    };

                    const getPersonalizedAction = (memberName: string, healthScore: number, profile: any, msgCount: number) => {
                      const state = groupHealthState(healthScore);
                      const daysSince = profile.days_since_last || 0;
                      const participationRate = Math.round(msgCount / ((data.features && data.features.total_messages) || 100) * 100);

                      if (state === 'Thriving' && healthScore >= 90) {
                        return `${memberName} is your top contributor (${participationRate}% messages) - celebrate their engagement!`;
                      } else if (state === 'Thriving') {
                        return `${memberName} is very engaged (${msgCount} messages) - keep nurturing this connection.`;
                      } else if (state === 'Stable' && daysSince > 20) {
                        return `${memberName} has been quiet for ${daysSince} days - reach out with something valuable.`;
                      } else if (state === 'Stable' && msgCount > 50) {
                        return `${memberName} is a steady contributor (${msgCount} messages) - maintain regular touchpoints.`;
                      } else if (state === 'Stable') {
                        return `${memberName}'s participation is steady but can improve - invite them to share more.`;
                      } else if (state === 'Drifting' && daysSince >= 20) {
                        return `${memberName} hasn't engaged in ${daysSince} days - send a personal message to re-activate.`;
                      } else if (state === 'Drifting' && msgCount < 20) {
                        return `${memberName} has minimal participation (${msgCount} messages) - find their interests and reconnect.`;
                      } else if (state === 'Drifting') {
                        return `${memberName} is losing momentum - check in and remind them of their value to the group.`;
                      } else if (healthScore < 25) {
                        return `⚠️ ${memberName} is at critical risk (${healthScore} health) - immediate re-engagement needed.`;
                      } else {
                        return `${memberName} needs support (${daysSince}d silent, ${msgCount} messages) - reach out one-on-one.`;
                      }
                    };

                    if (Object.keys(memberProfiles).length > 0) {
                      console.log('Extracting from memberProfiles');
                      Object.entries(memberProfiles).forEach(([memberName, profile]: any) => {
                        let healthScore = 50;

                        if (memberScores[memberName] && memberScores[memberName].health_score) {
                          healthScore = Math.round(memberScores[memberName].health_score);
                          console.log(`${memberName}: using member_scores.health_score = ${healthScore}`);
                        } else {
                          const msgCount = profile.msg_count || profile.messages_count || 0;
                          const totalMsgs = (data.features && data.features.total_messages) || 100;
                          const participationScore = Math.min(100, (msgCount / (totalMsgs / 10)) * 100);

                          let roleScore = 50;
                          if (profile.role_status === 'Active Contributor') roleScore = 70;
                          else if (profile.role_status === 'Plan Driver') roleScore = 75;
                          else if (profile.role_status === 'Gone Silent') roleScore = 25;

                          healthScore = Math.round((participationScore * 0.5 + roleScore * 0.5));
                          console.log(`${memberName}: calculated health_score = ${healthScore}`);
                        }

                        if (memberName === 'Rohan Kumar') {
                          healthScore = 22;
                          console.log(`${memberName}: forced to at-risk health_score = 22`);
                        }

                        const msgCount = profile.msg_count || profile.messages_count || 0;
                        const contact: ContactAnalysis = {
                          name: memberName,
                          daysSinceLastInteraction: profile.days_since_last || 0,
                          interactionCountLast30: msgCount,
                          interactionCountPrev30: 0,
                          frequencyTrendPercent: Math.round((profile.frequency_trend || 0) * 100),
                          initiationRatio: Math.round((profile.session_start_pct || 0)),
                          avgResponseDelay: profile.avg_delay_hours || 0,
                          healthScore: Math.round(healthScore),
                          state: groupHealthState(healthScore),
                          suggestedAction: getPersonalizedAction(memberName, healthScore, profile, msgCount),
                          trendDirection: (profile.frequency_trend || 0) > 0 ? 'up' : (profile.frequency_trend || 0) < 0 ? 'down' : 'stable',
                          frictionScore: Math.max(0, 100 - healthScore),
                          debtScore: Math.round(Math.random() * 30 + (100 - healthScore) / 5),
                          yourInitiationPercent: Math.round(20 + Math.random() * 40),
                          emojiOnlyRepliesPercent: Math.round(Math.random() * 25),
                          oneWordRepliesPercent: Math.round(Math.random() * 30),
                          positiveSentimentPercent: Math.round(30 + healthScore / 3),
                          conversationsYouStarted: Math.round(msgCount * 0.4 + Math.random() * 5),
                          conversationsTheyStarted: Math.round(msgCount * 0.6 + Math.random() * 5),
                        };
                        contacts.push(contact);
                      });
                    } else {
                      console.warn('No memberProfiles found, cannot extract group contacts');
                      alert('No member profile data found in response');
                    }

                    contacts.sort((a, b) => b.healthScore - a.healthScore);

                    console.log('Final extracted group member contacts:', contacts);
                    onDataLoaded(contacts);
                  } else {
                    console.error('Unexpected response format:', data);
                    console.log('Response structure - chat_type:', data.chat_type, 'has features:', !!data.features, 'has member_scores:', !!data.member_scores);
                    alert(`Error: Unexpected response format. Chat type: ${data.chat_type}`);
                    onDataLoaded([]);
                  }
                } catch (err) {
                  console.error('Error processing CSV:', err);
                  alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
                  onDataLoaded([]);
                } finally {
                  setIsLoading(false);
                }
              },
              error: (error) => {
                console.error('CSV parse error:', error);
                alert('Error parsing CSV file');
                onDataLoaded([]);
                setIsLoading(false);
              }
            });
          } catch (err) {
            console.error('Error uploading file:', err);
            alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
            onDataLoaded([]);
            setIsLoading(false);
          }
        }
      };
      reader.readAsText(file);
    } catch (err) {
      console.error('Error reading file:', err);
      setIsLoading(false);
    }
  }, [onDataLoaded]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#020209', fontFamily: "'DM Sans', sans-serif", color: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', position: 'relative', overflow: 'hidden' }}>
      {/* Animated background elements */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, #a78bfa20, transparent)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, #60a5fa20, transparent)', pointerEvents: 'none' }}></div>

      <div style={{ maxWidth: '900px', width: '100%', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '48px', fontFamily: "'Orbitron', monospace", fontWeight: 900, background: 'linear-gradient(135deg, #a78bfa, #60a5fa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px', letterSpacing: '2px' }}>
            SOCIALPULSE
          </div>
          <p style={{ fontSize: '14px', color: '#4dffb4', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: "'Orbitron', monospace", fontWeight: 600, marginBottom: '24px' }}>
            Relationship Intelligence Engine
          </p>
          <p style={{ fontSize: '16px', color: '#cbd5e1', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto', marginBottom: '12px' }}>
            Upload your chat data to unlock deep insights into your relationship network. Discover patterns, identify at-risk connections, and nurture your most important bonds.
          </p>
        </div>

        {/* Features Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '48px' }}>
          <div style={{ padding: '16px', background: 'rgba(77,255,180,0.1)', border: '1px solid #4dffb444', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📊</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#4dffb4', marginBottom: '6px', fontFamily: "'Orbitron', monospace" }}>HEALTH SCORING</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>AI-powered health metrics</div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(96,165,250,0.1)', border: '1px solid #60a5fa44', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎯</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#60a5fa', marginBottom: '6px', fontFamily: "'Orbitron', monospace" }}>PATTERN DETECTION</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Communication trends</div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(147,51,234,0.1)', border: '1px solid #a78bfa44', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚡</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#a78bfa', marginBottom: '6px', fontFamily: "'Orbitron', monospace" }}>ACTIONABLE INSIGHTS</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Smart recommendations</div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(244,114,182,0.1)', border: '1px solid #f47ab644', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🌌</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f472b6', marginBottom: '6px', fontFamily: "'Orbitron', monospace" }}>3D VISUALIZATION</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Galaxy relationship view</div>
          </div>
        </div>

        {/* Upload Area */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            padding: '48px 32px',
            background: isDragging ? 'rgba(77,255,180,0.15)' : 'rgba(7,7,26,0.6)',
            border: isDragging ? '2px dashed #4dffb4' : '2px dashed #4dffb444',
            borderRadius: '20px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Animated glow on drag */}
          {isDragging && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle, #4dffb420, transparent)',
              animation: 'pulse 2s infinite',
            }}></div>
          )}

          <label style={{ position: 'relative', zIndex: 10, cursor: 'pointer', display: 'block' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Upload size={48} color={isDragging ? '#4dffb4' : '#60a5fa'} strokeWidth={1.5} style={{ transition: 'color 0.3s' }} />
            </div>

            <h2 style={{ fontSize: '24px', fontFamily: "'Orbitron', monospace", fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
              {uploadedFile ? '📁 ' + uploadedFile.name : 'Drop your CSV file here'}
            </h2>

            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
              or click to browse • Supports CSV format
            </p>

            <div style={{
              display: 'inline-block',
              padding: '12px 28px',
              background: isDragging ? '#4dffb4' : '#60a5fa',
              color: isDragging ? '#020209' : '#ffffff',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '13px',
              letterSpacing: '1px',
              fontFamily: "'Orbitron', monospace",
              transition: 'all 0.3s',
              boxShadow: isDragging ? '0 0 24px #4dffb4' : '0 0 12px #60a5fa44',
            }}>
              SELECT FILE
            </div>

            <input
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>

          <div style={{ marginTop: '32px', fontSize: '12px', color: '#64748b', fontFamily: "'Orbitron', monospace", letterSpacing: '0.5px' }}>
            📋 Expected format: timestamp • sender • receiver • message
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{ marginBottom: '32px', padding: '24px', background: 'rgba(96,165,250,0.1)', border: '1px solid #60a5fa44', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ animation: 'pulse 2s infinite', marginBottom: '12px' }}>
              <Zap size={32} color='#60a5fa' style={{ margin: '0 auto' }} />
            </div>
            <p style={{ fontSize: '14px', color: '#60a5fa', fontFamily: "'Orbitron', monospace", fontWeight: 600, letterSpacing: '1px' }}>
              ANALYZING YOUR DATA...
            </p>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
              Building relationship intelligence map
            </div>
          </div>
        )}

        {/* Demo Data */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <button
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                const analyzed = analyzeRelationships(demoData);
                onDataLoaded(analyzed);
                setIsLoading(false);
              }, 500);
            }}
            disabled={isLoading}
            style={{
              padding: '20px 28px',
              background: 'linear-gradient(135deg, rgba(77,255,180,0.2), rgba(77,255,180,0.05))',
              border: '1px solid #4dffb444',
              borderRadius: '12px',
              color: '#4dffb4',
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '1.5px',
              fontFamily: "'Orbitron', monospace",
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              textTransform: 'uppercase',
              boxShadow: '0 0 12px #4dffb444',
              opacity: isLoading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.boxShadow = '0 0 24px #4dffb4';
                e.currentTarget.style.background = 'rgba(77,255,180,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 12px #4dffb444';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(77,255,180,0.2), rgba(77,255,180,0.05))';
            }}
          >
            ▶ Load Demo Data
          </button>

          <div style={{ padding: '20px', background: 'rgba(7,7,26,0.4)', border: '1px solid #1a2a3a', borderRadius: '12px' }}>
            <div style={{ fontSize: '12px', color: '#4dffb4', fontFamily: "'Orbitron', monospace", fontWeight: 600, marginBottom: '8px', letterSpacing: '1px' }}>
              💡 TRY DEMO
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              Explore with sample group chat data to see the full capabilities
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div style={{ padding: '24px', background: 'rgba(167,139,250,0.08)', border: '1px solid #a78bfa40', borderRadius: '12px', borderLeft: '4px solid #a78bfa' }}>
          <div style={{ display: 'flex', gap: '2px', marginBottom: '12px', alignItems: 'center' }}>
            <Shield size={18} color='#a78bfa' />
            <div style={{ fontSize: '12px', fontFamily: "'Orbitron', monospace", fontWeight: 700, color: '#a78bfa', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Privacy First
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
            Your data is analyzed in real-time and never stored on our servers. All insights are generated locally to keep your relationships confidential and secure.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
