import { ContactAnalysis, getStateColor } from "@/lib/types";
import { ContactCard } from "./ContactCard";
import { motion } from "framer-motion";
import { BarChart3, Eye, FastForward, RotateCcw } from "lucide-react";

interface DashboardProps {
  contacts: ContactAnalysis[];
  onSelectContact: (contact: ContactAnalysis) => void;
  onEnterAR: () => void;
  onSimulate: () => void;
  onReset: () => void;
  isSimulated: boolean;
}

export function Dashboard({ contacts, onSelectContact, onEnterAR, onSimulate, onReset, isSimulated }: DashboardProps) {
  const stateCounts = {
    Thriving: contacts.filter(c => c.state === "Thriving").length,
    Stable: contacts.filter(c => c.state === "Stable").length,
    Drifting: contacts.filter(c => c.state === "Drifting").length,
    "At Risk": contacts.filter(c => c.state === "At Risk").length,
  };

  const avgHealth = Math.round(contacts.reduce((s, c) => s + c.healthScore, 0) / contacts.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#181e2a] to-[#1e293b] relative">
      {/* Neon space background overlay */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{background:"radial-gradient(ellipse at 60% 40%, #38bdf8 0%, #0f172a 60%, #181e2a 100%)", opacity:0.18}} />
      {/* Header */}
      <header className="border-b border-[#2dd4a8]/30 px-6 py-4 flex items-center justify-between bg-[#0f172a]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-[#38bdf8] drop-shadow-neon" />
          <h1 className="text-2xl font-bold font-mono-display text-[#e0e7ff] tracking-widest drop-shadow-neon">
            <span className="text-[#38bdf8]">SPACE</span> Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {isSimulated ? (
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          ) : (
            <button
              onClick={onSimulate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-all"
            >
              <FastForward className="w-4 h-4" />
              Simulate 30 Days
            </button>
          )}
          <button
            onClick={onEnterAR}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#38bdf8] via-[#a855f7] to-[#f97316] text-white text-base font-bold shadow-lg hover:scale-105 transition-all drop-shadow-neon"
          >
            <Eye className="w-5 h-5" />
            Enter 3D AR Space
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 relative z-10">
        {/* Summary stats */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-5 gap-4"
        >
          <div className="rounded-xl border border-[#38bdf8]/40 bg-gradient-to-br from-[#181e2a] to-[#0f172a] p-4 text-center shadow-lg">
            <div className="text-4xl font-mono-display font-bold text-[#38bdf8] drop-shadow-neon">{avgHealth}</div>
            <div className="text-xs text-[#a5f3fc] mt-1">Avg Health</div>
          </div>
          {(Object.entries(stateCounts) as [string, number][]).map(([state, count]) => {
            const color = getStateColor(state as any);
            return (
              <div key={state} className={`rounded-xl border border-[${color}]/40 bg-gradient-to-br from-[#181e2a] to-[#0f172a] p-4 text-center shadow-lg`}>
                <div className={`text-4xl font-mono-display font-bold`} style={{color}}>{count}</div>
                <div className="text-xs text-[#a5f3fc] mt-1">{state}</div>
              </div>
            );
          })}
        </motion.div>

        {isSimulated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-status-at-risk bg-status-at-risk/10 p-4 text-center"
          >
            <p className="text-sm text-status-at-risk font-medium font-mono-display">
              ⚠ Simulating 30 days of no contact — watch relationships collapse
            </p>
          </motion.div>
        )}

        {/* Contact grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {contacts.map((contact, i) => (
            <ContactCard
              key={contact.name}
              contact={contact}
              index={i}
              onClick={() => onSelectContact(contact)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
