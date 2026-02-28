import { useState } from "react";
import { ContactAnalysis } from "@/lib/types";
import { Galaxy3DView } from "@/components/Galaxy3DView";

const getHealthColor = (s: number) => {
  if (s >= 75) return "#4dffb4";
  if (s >= 45) return "#b482ff";
  return "#ff4d6d";
};

export default function HomeDashboard({
  contacts,
  onSelectContact
}: {
  contacts: ContactAnalysis[];
  onSelectContact: (contact: ContactAnalysis) => void;
}) {
  const [viewMode, setViewMode] = useState<'galaxy' | 'table'>('galaxy');
  // User menu dropdown state
  const [showUserMenu, setShowUserMenu] = useState(false);
  // Mock authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Set to true for demo

  // Avatars mapping as close as possible
  const getAvatar = (name: string) => {
    switch (name) {
      case "Amit": return "🎵";
      case "Priya": return "📚";
      case "Riya": return "👩🎨";
      case "Vikram": return "🏋️";
      case "Sneha": return "🌸";
      default: return "👤";
    }
  };

  const pendingIssues = contacts.filter(c => c.state === 'At Risk').length;
  const memoryTriggers = 7; // Mock
  const pendingActions = 12; // Mock

  return (
    <div style={{ minHeight: '100vh', background: '#020209', fontFamily: "'DM Sans', sans-serif", color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>

      {/* SHARED NAV */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: 'rgba(2,2,9,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #0d1a2e' }}>
        <div>
          <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '13px', background: 'linear-gradient(135deg, #a78bfa, #60a5fa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '1px' }}>SOCIAL AUTOPILOT</div>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '7px', color: '#1a2a3a', letterSpacing: '3px', marginTop: '2px' }}>RELATIONSHIP INTELLIGENCE ENGINE</div>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setViewMode('galaxy')}
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '11px',
              letterSpacing: '1.5px',
              padding: '8px 20px',
              borderRadius: '10px',
              cursor: 'pointer',
              border: 'none',
              background: viewMode === 'galaxy' ? '#4dffb4' : '#07071a',
              color: viewMode === 'galaxy' ? '#020209' : '#f8fafc',
              fontWeight: 900,
              boxShadow: viewMode === 'galaxy' ? '0 2px 12px #4dffb488' : 'none',
              transition: 'all 0.2s',
              textShadow: viewMode === 'galaxy' ? '0 1px 8px #fff' : 'none',
            }}
          >
            🌌 Galaxy Dashboard
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '11px',
              letterSpacing: '1.5px',
              padding: '8px 20px',
              borderRadius: '10px',
              cursor: 'pointer',
              border: 'none',
              background: viewMode === 'table' ? '#60a5fa' : '#07071a',
              color: viewMode === 'table' ? '#fff' : '#f8fafc',
              fontWeight: 900,
              boxShadow: viewMode === 'table' ? '0 2px 12px #60a5fa88' : 'none',
              transition: 'all 0.2s',
              textShadow: viewMode === 'table' ? '0 1px 8px #fff' : 'none',
            }}
          >
            🧭 Explore Relationships
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '8px', color: '#1a2a3a', letterSpacing: '2px' }}>7 CONTACTS · 3 AT RISK</div>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4dffb4', boxShadow: '0 0 8px #4dffb4', animation: 'pulse 2s infinite' }}></div>
          {/* User Icon with Dropdown */}
          <div style={{ position: 'relative', marginLeft: '16px' }}>
            <button
              style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#07071a', border: '2px solid #4dffb4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem', cursor: 'pointer' }}
              onClick={() => setShowUserMenu((v) => !v)}
              id="user-icon-btn"
            >
              👤
            </button>
            {showUserMenu && (
              <div style={{ position: 'absolute', top: '44px', right: 0, background: '#07071a', border: '1px solid #4dffb4', borderRadius: '10px', boxShadow: '0 4px 16px #1a2a3a', minWidth: '140px', zIndex: 999 }}>
                {isLoggedIn ? (
                  <button style={{ width: '100%', padding: '10px', background: 'none', color: '#f472b6', border: 'none', fontFamily: "'Orbitron', monospace", fontSize: '12px', cursor: 'pointer', textAlign: 'left' }} onClick={() => {
                    setIsLoggedIn(false); // mock signout
                    window.location.href = '/login';
                  }}>
                    Signout
                  </button>
                ) : (
                  <button style={{ width: '100%', padding: '10px', background: 'none', color: '#a78bfa', border: 'none', fontFamily: "'Orbitron', monospace", fontSize: '12px', cursor: 'pointer', textAlign: 'left' }} onClick={() => window.location.href = '/login'}>
                    Login / Signup
                  </button>
                )}
              </div>
            )}
          </div>


        </div>
      </div>

      {viewMode === 'galaxy' ? (
        <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>

          <Galaxy3DView
            contacts={contacts}
            onContactClick={(index) => onSelectContact(contacts[index])}
          />

          {/* Metrics */}
          <div style={{ position: 'absolute', top: '70px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '24px', padding: '0 24px', pointerEvents: 'none', zIndex: 10 }}>
            {/* Avg Pulse */}
            <div style={{ background: '#4dffb4', border: 'none', borderRadius: '12px', padding: '12px 24px', textAlign: 'center', boxShadow: '0 2px 16px #4dffb488' }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '26px', fontWeight: 900, color: '#020209', textShadow: '0 1px 8px #fff' }}>68</div>
              <div style={{ fontSize: '11px', color: '#020209', letterSpacing: '2px', marginTop: '4px', fontWeight: 700 }}>AVG PULSE</div>
            </div>
            {/* At Risk */}
            <div style={{ background: '#ff4d6d', border: 'none', borderRadius: '12px', padding: '12px 24px', textAlign: 'center', boxShadow: '0 2px 16px #ff4d6d88' }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '26px', fontWeight: 900, color: '#fff', textShadow: '0 1px 8px #fff' }}>{pendingIssues}</div>
              <div style={{ fontSize: '11px', color: '#fff', letterSpacing: '2px', marginTop: '4px', fontWeight: 700 }}>AT RISK</div>
            </div>
            {/* Memory Triggers */}
            <div style={{ background: '#b482ff', border: 'none', borderRadius: '12px', padding: '12px 24px', textAlign: 'center', boxShadow: '0 2px 16px #b482ff88' }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '26px', fontWeight: 900, color: '#fff', textShadow: '0 1px 8px #fff' }}>{memoryTriggers}</div>
              <div style={{ fontSize: '11px', color: '#fff', letterSpacing: '2px', marginTop: '4px', fontWeight: 700 }}>MEMORY TRIGGERS</div>
            </div>
            {/* Pending Actions */}
            <div style={{ background: '#f59e0b', border: 'none', borderRadius: '12px', padding: '12px 24px', textAlign: 'center', boxShadow: '0 2px 16px #f59e0b88' }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '26px', fontWeight: 900, color: '#fff', textShadow: '0 1px 8px #fff' }}>{pendingActions}</div>
              <div style={{ fontSize: '11px', color: '#fff', letterSpacing: '2px', marginTop: '4px', fontWeight: 700 }}>PENDING ACTIONS</div>
            </div>
            {/* Top Bond */}
            <div style={{ background: '#60a5fa', border: 'none', borderRadius: '12px', padding: '12px 24px', textAlign: 'center', boxShadow: '0 2px 16px #60a5fa88' }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '26px', fontWeight: 900, color: '#fff', textShadow: '0 1px 8px #fff' }}>87%</div>
              <div style={{ fontSize: '11px', color: '#fff', letterSpacing: '2px', marginTop: '4px', fontWeight: 700 }}>TOP BOND</div>
            </div>
          </div>

          {/* Priority Strip */}
          <div style={{ position: 'absolute', bottom: '80px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '12px', pointerEvents: 'all', zIndex: 10 }}>
            {contacts.slice(0, 4).map((c, i) => {
              const col = getHealthColor(c.healthScore);
              return (
                <div
                  key={i}
                  onClick={() => onSelectContact(c)}
                  style={{ background: 'rgba(2,2,9,0.85)', border: '1px solid #1a2a3a', borderRadius: '12px', padding: '16px', cursor: 'pointer', minWidth: '160px', backdropFilter: 'blur(10px)', transition: 'all 0.2s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{getAvatar(c.name)}</span>
                    <span style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: '18px', color: col }}>{c.healthScore}</span>
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>{c.name}</div>
                  <div style={{ fontSize: '10px', color: '#4a5568' }}>
                    {c.state}
                  </div>
                  <div style={{ marginTop: '12px', height: '2px', background: '#1a2a3a', borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: `${c.healthScore}%`, background: col, borderRadius: '2px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View All Button */}
          <button
            onClick={() => setViewMode('table')}
            style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', fontFamily: "'Orbitron', monospace", fontSize: '10px', letterSpacing: '3px', padding: '11px 32px', background: 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(96,165,250,0.1))', border: '1px solid #a78bfa55', color: '#a78bfa', borderRadius: '12px', cursor: 'pointer', zIndex: 10 }}
          >
            🧭 VIEW ALL CONTACTS — EXPLORE RELATIONSHIPS →
          </button>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', width: '100%', paddingTop: '80px', position: 'relative', zIndex: 10, paddingLeft: '24px', paddingRight: '24px' }}>
          <div className="max-w-7xl mx-auto">
            {/* Contact Cards Grid (Reusing basic tabular view logic but applying theme colors) */}
            <div className="flex gap-8 mb-8 mt-12">
              <div className="flex-1 bg-[#07071a] rounded-xl px-6 py-6 text-center border border-[#1a2a3a] shadow-lg">
                <div className="text-4xl font-bold text-[#4dffb4]" style={{ fontFamily: "'Orbitron', monospace" }}>69</div>
                <div className="text-[9px] text-[#4a5568] mt-2 tracking-widest uppercase font-mono-display">Avg Health</div>
              </div>
              <div className="flex-1 bg-[#07071a] rounded-xl px-6 py-6 text-center border border-[#1a2a3a] shadow-lg">
                <div className="text-4xl font-bold text-[#4dffb4]" style={{ fontFamily: "'Orbitron', monospace" }}>6</div>
                <div className="text-[9px] text-[#4a5568] mt-2 tracking-widest uppercase font-mono-display">Thriving</div>
              </div>
              <div className="flex-1 bg-[#07071a] rounded-xl px-6 py-6 text-center border border-[#1a2a3a] shadow-lg">
                <div className="text-4xl font-bold text-[#b482ff]" style={{ fontFamily: "'Orbitron', monospace" }}>2</div>
                <div className="text-[9px] text-[#4a5568] mt-2 tracking-widest uppercase font-mono-display">Drifting</div>
              </div>
              <div className="flex-1 bg-[#07071a] rounded-xl px-6 py-6 text-center border border-[#1a2a3a] shadow-lg">
                <div className="text-4xl font-bold text-[#ff4d6d]" style={{ fontFamily: "'Orbitron', monospace" }}>3</div>
                <div className="text-[9px] text-[#4a5568] mt-2 tracking-widest uppercase font-mono-display">At Risk</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 pb-8">
              {contacts.map((c, i) => {
                const col = getHealthColor(c.healthScore);
                return (
                  <button
                    key={i}
                    onClick={() => onSelectContact(c)}
                    className="bg-[#07071a] rounded-xl px-6 py-6 text-left border border-[#1a2a3a] shadow-xl hover:border-[#38bdf8] transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg text-[#e2e8f0]" style={{ fontFamily: "'Orbitron', monospace" }}>{getAvatar(c.name)} {c.name}</span>
                      <span className="font-bold text-2xl" style={{ fontFamily: "'Orbitron', monospace", color: col }}>{c.healthScore}</span>
                    </div>
                    <div className="text-[9px] tracking-widest uppercase mb-4 font-mono-display" style={{ color: col }}>{c.state}</div>
                    <div className="flex gap-4 text-[10px] text-[#a5f3fc] mb-4 font-mono-display">
                      <span>🕒 {c.daysSinceLastInteraction}d ago</span>
                      <span>💬 {c.interactionCountLast30} / 30d</span>
                    </div>
                    <div className="mt-4 px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2" style={{ background: 'rgba(7,7,26,0.8)', color: col, border: `1px solid ${col}44` }}>
                      {c.suggestedAction}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Adding a global style tag for keyframes if needed, though Tailwind replaces them. Let's just use CSS for pulse. */}
      <style>{`
        @keyframes pulse { 0%,100% {opacity:0.5} 50% {opacity:1} }
      `}</style>
    </div>
  );
}
