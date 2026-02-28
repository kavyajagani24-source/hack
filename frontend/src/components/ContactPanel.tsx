import { ContactAnalysis } from "@/lib/types";
import { X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ContactPanelProps {
  contact: ContactAnalysis | null;
  onClose: () => void;
}

const getHealthColor = (s: number) => {
  if (s >= 75) return "#00ff88";
  if (s >= 48) return "#00d9ff";
  return "#ff2563";
};

// Circular metric component
const CircularMetric = ({ value, label, color, maxValue = 100 }: { value: number; label: string; color: string; maxValue?: number }) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / maxValue) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28" style={{ filter: `drop-shadow(0 0 16px ${color}44)` }}>
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#0a1a2a" strokeWidth="4" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300"
            style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ fontSize: '20px', fontWeight: 900, color: color, fontFamily: "'Orbitron', monospace", textShadow: `0 0 12px ${color}66` }}>{value}</span>
        </div>
      </div>
      <span style={{ fontSize: '12px', color: color, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Orbitron', monospace", fontWeight: 700 }}>{label}</span>
    </div>
  );
};

// Progress bar component
const ProgressBar = ({ label, value, color }: { label: string; value: number; color: string }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span style={{ fontSize: '11px', color: '#00d9ff', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Orbitron', monospace", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: '12px', color: color, fontFamily: "'Orbitron', monospace", fontWeight: 700 }}>{value}%</span>
      </div>
      <div className="h-2.5 bg-[#0a1a2a] rounded-full overflow-hidden" style={{ boxShadow: 'inset 0 0 8px rgba(0,0,0,0.5)' }}>
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}, ${color}dd)`, boxShadow: `0 0 12px ${color}88` }}
        />
      </div>
    </div>
  );
};

export function ContactPanel({ contact, onClose }: ContactPanelProps) {
  if (!contact) return null;
  const stateColor = getHealthColor(contact.healthScore);

  const TrendIcon = contact.trendDirection === "up" ? TrendingUp
    : contact.trendDirection === "down" ? TrendingDown : Minus;

  const stateReason = () => {
    if (contact.state === "At Risk") {
      return `Critical engagement gap: ${contact.daysSinceLastInteraction} days silent. Only ${contact.interactionCountLast30} messages in last 30 days. Avg response time: ${contact.avgResponseDelay.toFixed(1)}h. Immediate re-engagement recommended.`;
    }
    if (contact.state === "Drifting") {
      const trend = contact.trendDirection === "down" ? "declining" : contact.trendDirection === "up" ? "rising" : "stable";
      return `Frequency ${trend} at ${Math.abs(contact.frequencyTrendPercent)}%. ${contact.daysSinceLastInteraction} days since last chat. Average response: ${contact.avgResponseDelay.toFixed(1)}h. Engagement dropping - reach out soon.`;
    }
    if (contact.state === "Stable") {
      return `Consistent contact: ${contact.interactionCountLast30} messages last 30 days (vs ${contact.interactionCountPrev30} previously). Avg response: ${contact.avgResponseDelay.toFixed(1)}h. Maintain regular touchpoints to sustain momentum.`;
    }
    return `Thriving relationship: Strong engagement with frequent interactions. Avg response time: ${contact.avgResponseDelay.toFixed(1)}h. Balanced reciprocal communication. Keep nurturing this connection.`;
  };

  return (
    <AnimatePresence>
      <motion.div
        key={contact.name}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="fixed right-6 top-24 bottom-24 w-96 rounded-2xl p-8 z-[250] flex flex-col overflow-y-auto"
        style={{
          background: 'rgba(7,7,26,0.95)',
          border: `1px solid ${stateColor}44`,
          backdropFilter: 'blur(20px)',
          boxShadow: `0 0 30px ${stateColor}22`
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#1a2a3a] border border-[#1a2a3a] hover:bg-[#38bdf8]/20 transition-colors flex justify-center items-center z-10"
          style={{ color: '#a5f3fc' }}
          title="Close Panel"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6 mt-2 relative">
          <div>
            <h2 style={{ fontFamily: "'Orbitron', monospace", color: '#ffffff', fontSize: '28px', fontWeight: 900 }}>{contact.name}</h2>
            <span style={{ fontSize: '11px', letterSpacing: '3px', fontFamily: "'Orbitron', monospace", color: stateColor, textTransform: 'uppercase' }}>{contact.state}</span>
          </div>

          <div className="flex items-center gap-5 my-6">
            <div style={{ fontSize: '56px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: stateColor, lineHeight: 1, textShadow: `0 0 15px ${stateColor}66` }}>
              {contact.healthScore}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', lineHeight: 1.4 }}>
              Health<br />Score
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: '#94a3b8' }}>Days since contact</span>
              <span style={{ color: '#ffffff', fontFamily: "'Orbitron', monospace", fontSize: '16px' }}>{contact.daysSinceLastInteraction}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: '#94a3b8' }}>Interactions (30d)</span>
              <span style={{ color: '#ffffff', fontFamily: "'Orbitron', monospace", fontSize: '16px' }}>{contact.interactionCountLast30}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: '#94a3b8' }}>Trend</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: stateColor, fontFamily: "'Orbitron', monospace", fontSize: '16px' }}>
                <TrendIcon className="w-5 h-5" />
                {contact.frequencyTrendPercent > 0 ? "+" : ""}{contact.frequencyTrendPercent}%
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: '#94a3b8' }}>Avg Response Time</span>
              <span style={{ color: '#ffffff', fontFamily: "'Orbitron', monospace", fontSize: '16px' }}>{contact.avgResponseDelay.toFixed(1)} hours</span>
            </div>
          </div>

          {/* Detailed Analysis Metrics */}
          <div className="pt-6 border-t border-[#1a2a3a]">
            <h4 style={{ fontSize: '11px', fontFamily: "'Orbitron', monospace", color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>Relationship Metrics</h4>
            
            {/* Circular Metrics */}
            <div className="flex justify-around mb-8 gap-4">
              <CircularMetric
                value={contact.healthScore}
                label="Health"
                color={getHealthColor(contact.healthScore)}
              />
              <CircularMetric
                value={contact.frictionScore}
                label="Friction"
                color={contact.frictionScore > 50 ? '#ff2563' : contact.frictionScore > 25 ? '#ffaa00' : '#00ff88'}
              />
              <CircularMetric
                value={contact.debtScore}
                label="Debt"
                color="#00d9ff"
              />
            </div>

            {/* Communication Style */}
            <div style={{ padding: '14px', borderRadius: '10px', background: '#0a1a2a', marginBottom: '16px', border: '1px solid #00d9ff33' }}>
              <h5 style={{ fontSize: '11px', fontFamily: "'Orbitron', monospace", color: '#00d9ff', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px', fontWeight: 700 }}>Communication Style</h5>
              <div className="space-y-4">
                <ProgressBar
                  label="Your Initiation Share"
                  value={contact.yourInitiationPercent}
                  color="#00ff88"
                />
                <ProgressBar
                  label="Emoji-only Replies"
                  value={contact.emojiOnlyRepliesPercent}
                  color="#ff00ff"
                />
                <ProgressBar
                  label="One-word Replies"
                  value={contact.oneWordRepliesPercent}
                  color="#00d9ff"
                />
                <ProgressBar
                  label="Positive Sentiment"
                  value={contact.positiveSentimentPercent}
                  color="#ffff00"
                />
              </div>
            </div>

            {/* Social Debt Ledger */}
            <div style={{ padding: '14px', borderRadius: '10px', background: '#0a1a2a', marginBottom: '16px', border: '1px solid #00ff8833' }}>
              <h5 style={{ fontSize: '11px', fontFamily: "'Orbitron', monospace", color: '#00ff88', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px', fontWeight: 700 }}>Social Debt Ledger</h5>
              <div className="flex justify-between items-center">
                <div className="flex-1 text-center">
                  <div style={{ fontSize: '22px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: '#00ff88', textShadow: '0 0 10px #00ff8888' }}>{contact.conversationsYouStarted}</div>
                  <div style={{ fontSize: '10px', color: '#00d9ff', marginTop: '6px', fontWeight: 600 }}>You Started</div>
                </div>
                <div style={{ color: '#64748b', padding: '0 16px', fontSize: '18px' }}>
                  ⚖️
                </div>
                <div className="flex-1 text-center">
                  <div style={{ fontSize: '22px', fontFamily: "'Orbitron', monospace", fontWeight: 900, color: '#ff2563', textShadow: '0 0 10px #ff256388' }}>{contact.conversationsTheyStarted}</div>
                  <div style={{ fontSize: '10px', color: '#ff2563', marginTop: '6px', fontWeight: 600 }}>They Started</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-6">
            <h4 style={{ fontSize: '11px', fontFamily: "'Orbitron', monospace", color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px' }}>State Reason</h4>
            <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: 1.6 }}>{stateReason()}</p>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', background: `${stateColor}15`, border: `1px solid ${stateColor}55`, marginTop: '32px' }}>
            <h4 style={{ fontSize: '11px', fontFamily: "'Orbitron', monospace", color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Suggested Action</h4>
            <p style={{ fontSize: '15px', fontWeight: 600, color: stateColor }}>{contact.suggestedAction}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
