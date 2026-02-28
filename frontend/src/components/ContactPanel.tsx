import { ContactAnalysis } from "@/lib/types";
import { X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ContactPanelProps {
  contact: ContactAnalysis | null;
  onClose: () => void;
}

const getHealthColor = (s: number) => {
  if (s >= 75) return "#4dffb4";
  if (s >= 45) return "#b482ff";
  return "#ff4d6d";
};

export function ContactPanel({ contact, onClose }: ContactPanelProps) {
  if (!contact) return null;
  const stateColor = getHealthColor(contact.healthScore);

  const TrendIcon = contact.trendDirection === "up" ? TrendingUp
    : contact.trendDirection === "down" ? TrendingDown : Minus;

  const stateReason = () => {
    if (contact.state === "At Risk") return `Only ${contact.interactionCountLast30} interactions in last 30 days, ${contact.daysSinceLastInteraction} days since last contact.`;
    if (contact.state === "Drifting") return `Frequency declining ${Math.abs(contact.frequencyTrendPercent)}%. Initiation ratio: ${contact.initiationRatio}% you.`;
    if (contact.state === "Stable") return `Consistent engagement with ${contact.interactionCountLast30} interactions in last 30 days.`;
    return `Strong reciprocal relationship with frequent, balanced interactions.`;
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
              <span style={{ color: '#94a3b8' }}>You initiate</span>
              <span style={{ color: '#ffffff', fontFamily: "'Orbitron', monospace", fontSize: '16px' }}>{contact.initiationRatio}%</span>
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
