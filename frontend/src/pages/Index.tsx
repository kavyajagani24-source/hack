import { useState, useCallback } from "react";
import { ChatLog, ContactAnalysis } from "@/lib/types";
import { analyzeRelationships, simulateNoContact } from "@/lib/intelligence-engine";
import { FileUpload } from "@/components/FileUpload";
import HomeDashboard from "./HomeDashboard";
import { RelationshipSpace } from "@/components/RelationshipSpace";
import { ContactPanel } from "@/components/ContactPanel";
import { AnimatePresence, motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 1.03, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

const arVariants = {
  initial: { opacity: 0, scale: 1.1 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

const Index = () => {
  const [contacts, setContacts] = useState<ContactAnalysis[] | null>(null);
  const [originalContacts, setOriginalContacts] = useState<ContactAnalysis[] | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactAnalysis | null>(null);
  const [view, setView] = useState<"upload" | "dashboard" | "ar">("upload");
  const [isSimulated, setIsSimulated] = useState(false);

  const handleDataLoaded = useCallback((data: ChatLog[]) => {
    const analyzed = analyzeRelationships(data);
    setContacts(analyzed);
    setOriginalContacts(analyzed);
    setView("dashboard");
  }, []);

  const handleSimulate = useCallback(() => {
    if (originalContacts) {
      setContacts(simulateNoContact(originalContacts));
      setIsSimulated(true);
    }
  }, [originalContacts]);

  const handleReset = useCallback(() => {
    setContacts(originalContacts);
    setIsSimulated(false);
  }, [originalContacts]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        {view === "upload" && (
          <motion.div key="upload" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <FileUpload onDataLoaded={handleDataLoaded} />
          </motion.div>
        )}

        {view === "dashboard" && contacts && (
          <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <HomeDashboard contacts={contacts} onSelectContact={setSelectedContact} />
          </motion.div>
        )}

        {view === "ar" && contacts && (
          <motion.div key="ar" variants={arVariants} initial="initial" animate="animate" exit="exit">
            <RelationshipSpace
              contacts={contacts}
              onSelectContact={setSelectedContact}
              onExit={() => setView("dashboard")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ContactPanel
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
      />
    </div>
  );
};

export default Index;
