import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ContactAnalysis } from "@/lib/types";
import { Galaxy3DView } from "@/components/Galaxy3DView";
import { useAuth } from "@/lib/auth-context";

const getHealthColor = (s: number) => {
  if (s >= 75) return "#4dffb4";
  if (s >= 48) return "#b482ff";
  return "#ff4d6d";
};

export default function HomeDashboard({
  contacts,
  onSelectContact
}: {
  contacts: ContactAnalysis[];
  onSelectContact: (contact: ContactAnalysis) => void;
}) {
  const [viewMode, setViewMode] = useState<'galaxy' | 'table' | 'detail'>('galaxy');
  const [selectedContact, setSelectedContact] = useState<ContactAnalysis | null>(null);
  // User menu dropdown state
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const { logout, userName } = useAuth();

  const handleContactSelect = (contact: ContactAnalysis) => {
    setSelectedContact(contact);
    setViewMode('detail');
    onSelectContact(contact);
  };

  const handleBackToTable = () => {
    setSelectedContact(null);
    setViewMode('table');
  };

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
  const avgGroupHealth = contacts.length > 0 ? Math.round(contacts.reduce((sum, c) => sum + c.healthScore, 0) / contacts.length) : 0;
  const pendingActions = 12; // Mock

  return (
    <div style={{ minHeight: '100vh', background: '#020209', fontFamily: "'DM Sans', sans-serif", color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>

      {/* SHARED NAV */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: 'rgba(2,2,9,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #0d1a2e' }}>
        <div>
          <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '24px', background: 'linear-gradient(135deg, #a78bfa, #60a5fa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '2px', textShadow: '0 0 20px rgba(167, 139, 250, 0.5)' }}>SOCIALPULSE</div>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '8px', color: '#4dffb4', letterSpacing: '2px', marginTop: '2px', fontWeight: 600 }}>RELATIONSHIP INTELLIGENCE ENGINE</div>
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
            onClick={() => { setViewMode('table'); setSelectedContact(null); }}
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '11px',
              letterSpacing: '1.5px',
              padding: '8px 20px',
              borderRadius: '10px',
              cursor: 'pointer',
              border: 'none',
              background: (viewMode === 'table' || viewMode === 'detail') ? '#60a5fa' : '#07071a',
              color: (viewMode === 'table' || viewMode === 'detail') ? '#fff' : '#f8fafc',
              fontWeight: 900,
              boxShadow: (viewMode === 'table' || viewMode === 'detail') ? '0 2px 12px #60a5fa88' : 'none',
              transition: 'all 0.2s',
              textShadow: (viewMode === 'table' || viewMode === 'detail') ? '0 1px 8px #fff' : 'none',
            }}
          >
            🧭 Explore Relationships
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '8px', color: '#4dffb4', letterSpacing: '2px' }}>7 CONTACTS · 3 AT RISK</div>
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
                <div style={{ padding: '10px', fontFamily: "'Orbitron', monospace", fontSize: '11px', color: '#a78bfa', borderBottom: '1px solid #1a2a3a', textAlign: 'center' }}>
                  {userName || 'User'}
                </div>
                <button style={{ width: '100%', padding: '10px', background: 'none', color: '#f472b6', border: 'none', fontFamily: "'Orbitron', monospace", fontSize: '12px', cursor: 'pointer', textAlign: 'left' }} onClick={() => {
                    logout();
                    navigate('/login');
                  }}>
                  Signout
                </button>
              </div>
            )}
          </div>


        </div>
      </div>

      {viewMode === 'galaxy' ? (
        <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', display: 'flex' }}>

          <div style={{ flex: 1, position: 'relative' }}>
            <Galaxy3DView
              contacts={contacts}
              onContactClick={(index) => {
                setSelectedContact(contacts[index]);
                onSelectContact(contacts[index]);
              }}
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
              {/* Avg Group Health */}
              <div style={{ background: '#b482ff', border: 'none', borderRadius: '12px', padding: '12px 24px', textAlign: 'center', boxShadow: '0 2px 16px #b482ff88' }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '26px', fontWeight: 900, color: '#fff', textShadow: '0 1px 8px #fff' }}>{avgGroupHealth}</div>
                <div style={{ fontSize: '11px', color: '#fff', letterSpacing: '2px', marginTop: '4px', fontWeight: 700 }}>AVG GROUP HEALTH</div>
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
                    onClick={() => {
                      setSelectedContact(c);
                      onSelectContact(c);
                    }}
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

          {/* Side Panel - Show when contact is selected in galaxy mode */}
          {selectedContact && (
            <div style={{ width: '400px', background: 'rgba(7,7,26,0.8)', backdropFilter: 'blur(10px)', borderLeft: '1px solid #1a2a3a', overflowY: 'auto', maxHeight: '100vh', padding: '24px', marginTop: '60px', position: 'relative' }}>
              {/* Close Button */}
              <button
                onClick={() => setSelectedContact(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255,77,109,0.1)',
                  border: '1px solid #ff4d6d44',
                  color: '#ff4d6d',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                ×
              </button>

              {/* Contact Header */}
              <div style={{ marginBottom: '32px', paddingRight: '32px' }}>
                <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '24px', fontWeight: 900, color: '#ffffff', marginBottom: '4px' }}>
                  {selectedContact.name}
                </h2>
                <p style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  RELATIONSHIP DEEP DIVE
                </p>
              </div>

              {/* Metrics Section - Horizontal Layout */}
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '11px', fontFamily: "'Orbitron', monospace", color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 600 }}>Relationship Metrics</h3>
                
                {/* Three Circles - Health, Friction, Debt */}
                <div style={{ display: 'flex', justifyContent: 'space-around', gap: '12px', marginBottom: '20px', padding: '12px', background: 'rgba(7,7,26,0.6)', borderRadius: '8px', border: '1px solid #1a2a3a' }}>
                  {/* Health Circle */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ position: 'relative', width: '70px', height: '70px' }}>
                      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#1a2a3a" strokeWidth="2" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={getHealthColor(selectedContact.healthScore)}
                          strokeWidth="2.5"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 - (selectedContact.healthScore / 100) * 2 * Math.PI * 40}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: '18px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: getHealthColor(selectedContact.healthScore) }}>{selectedContact.healthScore}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '8px', color: '#94a3b8', letterSpacing: '1px', fontFamily: "'Orbitron', monospace", fontWeight: 600, textTransform: 'uppercase' }}>HEALTH</div>
                  </div>

                  {/* Friction Circle */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ position: 'relative', width: '70px', height: '70px' }}>
                      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#1a2a3a" strokeWidth="2" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={selectedContact.frictionScore > 50 ? '#ff4d6d' : selectedContact.frictionScore > 25 ? '#fbbf24' : '#a3e635'}
                          strokeWidth="2.5"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 - (selectedContact.frictionScore / 100) * 2 * Math.PI * 40}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: '18px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: selectedContact.frictionScore > 50 ? '#ff4d6d' : selectedContact.frictionScore > 25 ? '#fbbf24' : '#a3e635' }}>{selectedContact.frictionScore}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '8px', color: '#94a3b8', letterSpacing: '1px', fontFamily: "'Orbitron', monospace", fontWeight: 600, textTransform: 'uppercase' }}>FRICTION</div>
                  </div>

                  {/* Debt Circle */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ position: 'relative', width: '70px', height: '70px' }}>
                      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#1a2a3a" strokeWidth="2" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#06b6d4"
                          strokeWidth="2.5"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 - (selectedContact.debtScore / 100) * 2 * Math.PI * 40}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: '18px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: '#06b6d4' }}>{selectedContact.debtScore}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '8px', color: '#94a3b8', letterSpacing: '1px', fontFamily: "'Orbitron', monospace", fontWeight: 600, textTransform: 'uppercase' }}>DEBT</div>
                  </div>
                </div>
              </div>

              {/* Communication Style Bars */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '10px', fontFamily: "'Orbitron', monospace", color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>Communication</h3>
                
                {/* Your Initiation Share */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '9px', color: '#94a3b8', letterSpacing: '0.5px', fontFamily: "'Orbitron', monospace", fontWeight: 600, textTransform: 'uppercase' }}>You Initiate</span>
                    <span style={{ fontSize: '11px', fontFamily: "'Orbitron', monospace", fontWeight: 700, color: '#4dffb4' }}>{selectedContact.yourInitiationPercent}%</span>
                  </div>
                  <div style={{ height: '3px', background: '#1a2a3a', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${selectedContact.yourInitiationPercent}%`, background: '#4dffb4', borderRadius: '2px' }} />
                  </div>
                </div>

                {/* Emoji-only Replies */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '9px', color: '#94a3b8', letterSpacing: '0.5px', fontFamily: "'Orbitron', monospace", fontWeight: 600, textTransform: 'uppercase' }}>Emoji Replies</span>
                    <span style={{ fontSize: '11px', fontFamily: "'Orbitron', monospace", fontWeight: 700, color: '#ff4d6d' }}>{selectedContact.emojiOnlyRepliesPercent}%</span>
                  </div>
                  <div style={{ height: '3px', background: '#1a2a3a', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${selectedContact.emojiOnlyRepliesPercent}%`, background: '#ff4d6d', borderRadius: '2px' }} />
                  </div>
                </div>

                {/* Positive Sentiment */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '9px', color: '#94a3b8', letterSpacing: '0.5px', fontFamily: "'Orbitron', monospace", fontWeight: 600, textTransform: 'uppercase' }}>Positive</span>
                    <span style={{ fontSize: '11px', fontFamily: "'Orbitron', monospace", fontWeight: 700, color: '#4dffb4' }}>{selectedContact.positiveSentimentPercent}%</span>
                  </div>
                  <div style={{ height: '3px', background: '#1a2a3a', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${selectedContact.positiveSentimentPercent}%`, background: '#4dffb4', borderRadius: '2px' }} />
                  </div>
                </div>
              </div>

              {/* Social Debt - Quick Stats */}
              <div>
                <h3 style={{ fontSize: '10px', fontFamily: "'Orbitron', monospace", color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>Social Debt</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ padding: '12px', background: 'rgba(7,7,26,0.6)', borderRadius: '8px', border: '1px solid #1a2a3a', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: '#4dffb4' }}>{selectedContact.conversationsYouStarted}</div>
                    <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '4px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>You Started</div>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(7,7,26,0.6)', borderRadius: '8px', border: '1px solid #1a2a3a', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: '#4dffb4' }}>{selectedContact.conversationsTheyStarted}</div>
                    <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '4px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>They Started</div>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(7,7,26,0.6)', borderRadius: '8px', border: '1px solid #1a2a3a', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: '#ff4d6d' }}>{selectedContact.daysSinceLastInteraction}</div>
                    <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '4px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Days Gap</div>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(7,7,26,0.6)', borderRadius: '8px', border: '1px solid #1a2a3a', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: '#4dffb4' }}>{selectedContact.daysSinceLastInteraction}</div>
                    <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '4px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Last Contact</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', width: '100%', paddingTop: '80px', position: 'relative', zIndex: 10, paddingLeft: '24px', paddingRight: '24px', paddingBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '32px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Left Sidebar - Contact Cards */}
            <div style={{ minWidth: '240px', width: '240px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: 'calc(100vh - 150px)', overflowY: 'auto', paddingBottom: '16px' }}>
              {contacts.map((c, i) => {
                const col = getHealthColor(c.healthScore);
                
                // Generate simple bar chart data for communication patterns
                const chartBars = Array(12).fill(0).map(() => Math.round(Math.random() * 100));
                
                return (
                  <button
                    key={i}
                    onClick={() => handleContactSelect(c)}
                    style={{
                      background: 'rgba(7,7,26,0.6)',
                      border: `2px solid ${col}40`,
                      borderRadius: '16px',
                      padding: '14px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = col;
                      e.currentTarget.style.background = 'rgba(7,7,26,0.9)';
                      e.currentTarget.style.boxShadow = `0 0 24px ${col}44`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${col}40`;
                      e.currentTarget.style.background = 'rgba(7,7,26,0.6)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Top Row: Name/Days on Left, Health Circle on Right */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      {/* Name and Days */}
                      <div>
                        <div style={{ fontSize: '16px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: '#ffffff', marginBottom: '2px' }}>
                          {c.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{c.daysSinceLastInteraction}d ago</div>
                      </div>

                      {/* Health Score Circle */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{ position: 'relative', width: '70px', height: '70px' }}>
                          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                            <circle cx="50" cy="50" r="35" fill="none" stroke="#1a2a3a" strokeWidth="2" />
                            <circle
                              cx="50"
                              cy="50"
                              r="35"
                              fill="none"
                              stroke={col}
                              strokeWidth="2.5"
                              strokeDasharray={`${2 * Math.PI * 35}`}
                              strokeDashoffset={`${2 * Math.PI * 35 - (c.healthScore / 100) * 2 * Math.PI * 35}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ fontSize: '20px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: col }}>{c.healthScore}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: '9px', color: '#94a3b8', letterSpacing: '1px', fontFamily: "'Orbitron', monospace", fontWeight: 600, textTransform: 'uppercase' }}>HEALTH</div>
                      </div>
                    </div>

                    {/* Communication Pattern Bars */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '2px', height: '36px', marginBottom: '12px', paddingBottom: '2px' }}>
                      {chartBars.map((val, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: '6px',
                            height: `${(val / 100) * 100}%`,
                            background: col,
                            borderRadius: '2px',
                            opacity: 0.5 + (idx % 3) * 0.3,
                            transition: 'opacity 0.2s',
                          }}
                        />
                      ))}
                    </div>

                    {/* Status Labels - Two Badge Style */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ fontSize: '9px', color: '#4dffb4', letterSpacing: '1px', fontFamily: "'Orbitron', monospace", fontWeight: 600, textTransform: 'uppercase', padding: '4px 8px', background: '#4dffb420', borderRadius: '6px', border: '1px solid #4dffb440' }}>
                        {c.frequencyTrendPercent > 0 ? '↑ They initiate more' : c.frequencyTrendPercent < 0 ? '↓ Memory triggers' : '→ Balanced'}
                      </div>
                      <div style={{ fontSize: '9px', color: '#60a5fa', letterSpacing: '1px', fontFamily: "'Orbitron', monospace", fontWeight: 600, textTransform: 'uppercase', padding: '4px 8px', background: '#60a5fa20', borderRadius: '6px', border: '1px solid #60a5fa40' }}>
                        {c.interactionCountLast30} chats
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Panel - Stats and Summary OR Selected Contact Detail */}
            <div style={{ flex: 1, minWidth: '320px', overflowY: 'auto', maxHeight: 'calc(100vh - 150px)' }}>
              {selectedContact ? (
                // Detail View for Selected Contact
                <>
                  <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '24px', fontWeight: 900, color: '#ffffff', marginBottom: '4px' }}>
                      {selectedContact.name}
                    </h2>
                    <p style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '2px', textTransform: 'uppercase' }}>
                      RELATIONSHIP DEEP DIVE
                    </p>
                  </div>

                  {/* Metrics Section - Horizontal Layout */}
                  <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '11px', fontFamily: "'Orbitron', monospace", color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 600 }}>Relationship Metrics</h3>
                    
                    {/* Three Circles - Health, Friction, Debt */}
                    <div style={{ display: 'flex', justifyContent: 'space-around', gap: '20px', marginBottom: '32px', padding: '16px', background: 'rgba(7,7,26,0.6)', borderRadius: '12px', border: '1px solid #1a2a3a' }}>
                      {/* Health Circle */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#1a2a3a" strokeWidth="2" />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke={getHealthColor(selectedContact.healthScore)}
                              strokeWidth="2.5"
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={`${2 * Math.PI * 40 - (selectedContact.healthScore / 100) * 2 * Math.PI * 40}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ fontSize: '22px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: getHealthColor(selectedContact.healthScore) }}>{selectedContact.healthScore}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: '9px', color: '#94a3b8', letterSpacing: '1px', fontFamily: "'Orbitron', monospace", fontWeight: 600, textTransform: 'uppercase' }}>HEALTH</div>
                      </div>

                      {/* Friction Circle */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#1a2a3a" strokeWidth="2" />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke={selectedContact.frictionScore > 50 ? '#ff4d6d' : selectedContact.frictionScore > 25 ? '#fbbf24' : '#a3e635'}
                              strokeWidth="2.5"
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={`${2 * Math.PI * 40 - (selectedContact.frictionScore / 100) * 2 * Math.PI * 40}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ fontSize: '22px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: selectedContact.frictionScore > 50 ? '#ff4d6d' : selectedContact.frictionScore > 25 ? '#fbbf24' : '#a3e635' }}>{selectedContact.frictionScore}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: '9px', color: '#94a3b8', letterSpacing: '1px', fontFamily: "'Orbitron', monospace", fontWeight: 600, textTransform: 'uppercase' }}>FRICTION</div>
                      </div>

                      {/* Debt Circle */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#1a2a3a" strokeWidth="2" />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#06b6d4"
                              strokeWidth="2.5"
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={`${2 * Math.PI * 40 - (selectedContact.debtScore / 100) * 2 * Math.PI * 40}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ fontSize: '22px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: '#06b6d4' }}>{selectedContact.debtScore}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: '9px', color: '#94a3b8', letterSpacing: '1px', fontFamily: "'Orbitron', monospace", fontWeight: 600, textTransform: 'uppercase' }}>DEBT</div>
                      </div>
                    </div>
                  </div>

                  {/* Communication Style Bars */}
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '11px', fontFamily: "'Orbitron', monospace", color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>Communication Style</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', background: 'rgba(7,7,26,0.6)', borderRadius: '12px', border: '1px solid #1a2a3a' }}>
                      {/* Your Initiation Share */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '1px', fontFamily: "'Orbitron', monospace", fontWeight: 600, textTransform: 'uppercase' }}>Your Initiation share</span>
                          <span style={{ fontSize: '11px', fontFamily: "'Orbitron', monospace", fontWeight: 700, color: '#4dffb4' }}>{selectedContact.yourInitiationPercent}%</span>
                        </div>
                        <div style={{ height: '3px', background: '#1a2a3a', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${selectedContact.yourInitiationPercent}%`, background: '#4dffb4', borderRadius: '2px' }} />
                        </div>
                      </div>

                      {/* Emoji-only Replies */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '1px', fontFamily: "'Orbitron', monospace", fontWeight: 600, textTransform: 'uppercase' }}>Emoji-only replies (them)</span>
                          <span style={{ fontSize: '11px', fontFamily: "'Orbitron', monospace", fontWeight: 700, color: '#ff4d6d' }}>{selectedContact.emojiOnlyRepliesPercent}%</span>
                        </div>
                        <div style={{ height: '3px', background: '#1a2a3a', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${selectedContact.emojiOnlyRepliesPercent}%`, background: '#ff4d6d', borderRadius: '2px' }} />
                        </div>
                      </div>

                      {/* One-word Replies */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '1px', fontFamily: "'Orbitron', monospace", fontWeight: 600, textTransform: 'uppercase' }}>One-word replies (them)</span>
                          <span style={{ fontSize: '11px', fontFamily: "'Orbitron', monospace", fontWeight: 700, color: '#fbbf24' }}>{selectedContact.oneWordRepliesPercent}%</span>
                        </div>
                        <div style={{ height: '3px', background: '#1a2a3a', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${selectedContact.oneWordRepliesPercent}%`, background: '#fbbf24', borderRadius: '2px' }} />
                        </div>
                      </div>

                      {/* Positive Sentiment */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '1px', fontFamily: "'Orbitron', monospace", fontWeight: 600, textTransform: 'uppercase' }}>Positive sentiment</span>
                          <span style={{ fontSize: '11px', fontFamily: "'Orbitron', monospace", fontWeight: 700, color: '#4dffb4' }}>{selectedContact.positiveSentimentPercent}%</span>
                        </div>
                        <div style={{ height: '3px', background: '#1a2a3a', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${selectedContact.positiveSentimentPercent}%`, background: '#4dffb4', borderRadius: '2px' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social Debt Ledger */}
                  <div>
                    <h3 style={{ fontSize: '11px', fontFamily: "'Orbitron', monospace", color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🤝 SOCIAL DEBT LEDGER
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {/* Convos You Started */}
                      <div style={{ padding: '16px', background: 'rgba(7,7,26,0.6)', borderRadius: '10px', border: '1px solid #1a2a3a', textAlign: 'center' }}>
                        <div style={{ fontSize: '9px', color: '#94a3b8', letterSpacing: '1px', fontFamily: "'Orbitron', monospace", fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Convos You Started</div>
                        <div style={{ fontSize: '24px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: '#4dffb4' }}>{selectedContact.conversationsYouStarted}</div>
                      </div>

                      {/* Convos They Started */}
                      <div style={{ padding: '16px', background: 'rgba(7,7,26,0.6)', borderRadius: '10px', border: '1px solid #1a2a3a', textAlign: 'center' }}>
                        <div style={{ fontSize: '9px', color: '#94a3b8', letterSpacing: '1px', fontFamily: "'Orbitron', monospace", fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Convos They Started</div>
                        <div style={{ fontSize: '24px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: '#4dffb4' }}>{selectedContact.conversationsTheyStarted}</div>
                      </div>

                      {/* Long Gaps in Chat */}
                      <div style={{ padding: '16px', background: 'rgba(7,7,26,0.6)', borderRadius: '10px', border: '1px solid #1a2a3a', textAlign: 'center' }}>
                        <div style={{ fontSize: '9px', color: '#94a3b8', letterSpacing: '1px', fontFamily: "'Orbitron', monospace", fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Long Gaps In Chat</div>
                        <div style={{ fontSize: '24px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: '#ff4d6d' }}>{selectedContact.daysSinceLastInteraction}</div>
                      </div>

                      {/* Days Since Contact */}
                      <div style={{ padding: '16px', background: 'rgba(7,7,26,0.6)', borderRadius: '10px', border: '1px solid #1a2a3a', textAlign: 'center' }}>
                        <div style={{ fontSize: '9px', color: '#94a3b8', letterSpacing: '1px', fontFamily: "'Orbitron', monospace", fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Days Since Contact</div>
                        <div style={{ fontSize: '24px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: '#4dffb4' }}>{selectedContact.daysSinceLastInteraction}</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Summary Stats when no contact selected
                <>
                  {/* Header Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                    <div style={{ background: 'rgba(77,255,180,0.1)', border: '1px solid #4dffb444', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: '#4dffb4' }}>{avgGroupHealth}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px', letterSpacing: '1px', textTransform: 'uppercase' }}>AVG HEALTH</div>
                    </div>
                    <div style={{ background: 'rgba(77,255,180,0.1)', border: '1px solid #4dffb444', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: '#4dffb4' }}>{contacts.filter(c => c.state === 'Thriving').length}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px', letterSpacing: '1px', textTransform: 'uppercase' }}>THRIVING</div>
                    </div>
                    <div style={{ background: 'rgba(180,130,255,0.1)', border: '1px solid #b482ff44', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: '#b482ff' }}>{contacts.filter(c => c.state === 'Drifting').length}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px', letterSpacing: '1px', textTransform: 'uppercase' }}>DRIFTING</div>
                    </div>
                    <div style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid #ff4d6d44', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: '#ff4d6d' }}>{pendingIssues}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px', letterSpacing: '1px', textTransform: 'uppercase' }}>AT RISK</div>
                    </div>
                  </div>

                  {/* Top Performers */}
                  <div style={{ marginTop: '32px' }}>
                    <h3 style={{ fontSize: '12px', fontFamily: "'Orbitron', monospace", color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 600 }}>🌟 Top Connections</h3>
                    {contacts.slice(0, 3).map((c, i) => {
                      const col = getHealthColor(c.healthScore);
                      return (
                        <div key={i} style={{ marginBottom: '12px', padding: '12px', background: 'rgba(7,7,26,0.5)', border: `1px solid ${col}30`, borderRadius: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{c.name}</span>
                            <span style={{ fontSize: '18px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: col }}>{c.healthScore}</span>
                          </div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>{c.state}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Relationship Summary */}
                  <div style={{ marginTop: '32px', padding: '16px', background: 'rgba(147,51,234,0.1)', border: '1px solid #a78bfa44', borderRadius: '12px' }}>
                    <h3 style={{ fontSize: '12px', fontFamily: "'Orbitron', monospace", color: '#a78bfa', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 700 }}>💡 Network Status</h3>
                    <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
                      <p>You have <strong style={{ color: '#4dffb4' }}>{contacts.filter(c => c.state === 'Thriving').length} thriving</strong> relationships and <strong style={{ color: '#ff4d6d' }}>{pendingIssues} that need attention</strong> right now.</p>
                      <p style={{ marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>Click a contact card to explore detailed metrics and actionable insights.</p>
                    </div>
                  </div>
                </>
              )}
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
