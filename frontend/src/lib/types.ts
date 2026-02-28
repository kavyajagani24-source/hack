export interface ChatLog {
  timestamp: string;
  sender: string;
  receiver: string;
  message: string;
}

export type RelationshipState = "Thriving" | "Stable" | "Drifting" | "At Risk";

export interface ContactAnalysis {
  name: string;
  daysSinceLastInteraction: number;
  interactionCountLast30: number;
  interactionCountPrev30: number;
  frequencyTrendPercent: number;
  initiationRatio: number;
  avgResponseDelay: number;
  healthScore: number;
  state: RelationshipState;
  suggestedAction: string;
  trendDirection: "up" | "down" | "stable";
  // New fields for detailed analysis
  frictionScore: number;
  debtScore: number;
  yourInitiationPercent: number;
  emojiOnlyRepliesPercent: number;
  oneWordRepliesPercent: number;
  positiveSentimentPercent: number;
  conversationsYouStarted: number;
  conversationsTheyStarted: number;
}

export function getStateColor(state: RelationshipState): string {
  switch (state) {
    case "Thriving": return "thriving";
    case "Stable": return "stable";
    case "Drifting": return "drifting";
    case "At Risk": return "at-risk";
  }
}
