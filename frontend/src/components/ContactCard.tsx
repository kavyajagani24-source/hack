import { ContactAnalysis, getStateColor } from "@/lib/types";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, MessageCircle, Users, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface ContactCardProps {
  contact: ContactAnalysis;
  index: number;
  onClick: () => void;
}

export function ContactCard({ contact, index, onClick }: ContactCardProps) {
  const stateColor = getStateColor(contact.state);
  const TrendIcon = contact.trendDirection === "up" ? TrendingUp
    : contact.trendDirection === "down" ? TrendingDown : Minus;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={onClick}
      className={`group cursor-pointer rounded-2xl border border-[${stateColor}] bg-gradient-to-br from-[#181e2a] to-[#0f172a] p-6 transition-all hover:scale-[1.04] shadow-lg hover:shadow-neon`}
      style={{boxShadow: `0 0 16px 2px ${stateColor}55, 0 0 32px 4px #38bdf822`}}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-mono-display font-semibold text-[#e0e7ff] text-lg drop-shadow-neon">{contact.name}</h3>
          <span className={`text-xs font-bold`} style={{color: stateColor}}>
            {contact.state}
          </span>
        </div>
        <div className={`text-3xl font-mono-display font-bold`} style={{color: stateColor}}>
          {contact.healthScore}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs text-[#a5f3fc] mb-3">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#38bdf8]" />
          <span>{contact.daysSinceLastInteraction}d ago</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3 text-[#38bdf8]" />
          <span>{contact.interactionCountLast30} / 30d</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendIcon className="w-3 h-3 text-[#a855f7]" />
          <span>{contact.frequencyTrendPercent > 0 ? "+" : ""}{contact.frequencyTrendPercent}%</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-[#181e2a] border border-[#38bdf8]/30 shadow-inner">
        {contact.state === "At Risk" ? (
          <AlertTriangle className="w-3 h-3 text-[#ef4444] shrink-0" />
        ) : (
          <Users className="w-3 h-3 text-[#38bdf8] shrink-0" />
        )}
        <span className="text-[#a5f3fc]">{contact.suggestedAction}</span>
      </div>
    </motion.div>
  );
}
