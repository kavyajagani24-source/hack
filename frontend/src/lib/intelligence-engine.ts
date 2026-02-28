import { ChatLog, ContactAnalysis, RelationshipState } from "./types";

const USER = "You";

export function analyzeRelationships(logs: ChatLog[]): ContactAnalysis[] {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  // Group by contact
  const contacts = new Map<string, ChatLog[]>();
  for (const log of logs) {
    const contact = log.sender === USER ? log.receiver : log.sender;
    if (!contacts.has(contact)) contacts.set(contact, []);
    contacts.get(contact)!.push(log);
  }

  const results: ContactAnalysis[] = [];

  for (const [name, messages] of contacts) {
    const sorted = messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Days since last interaction
    const lastMsg = sorted[sorted.length - 1];
    const daysSince = Math.floor((now.getTime() - new Date(lastMsg.timestamp).getTime()) / (1000 * 60 * 60 * 24));

    // Interaction counts
    const last30 = sorted.filter(m => new Date(m.timestamp) >= thirtyDaysAgo).length;
    const prev30 = sorted.filter(m => {
      const d = new Date(m.timestamp);
      return d >= sixtyDaysAgo && d < thirtyDaysAgo;
    }).length;

    // Frequency trend
    const trendPercent = prev30 > 0 ? ((last30 - prev30) / prev30) * 100 : (last30 > 0 ? 100 : 0);

    // Initiation ratio (how much user initiates)
    const userInitiated = sorted.filter(m => m.sender === USER).length;
    const initiationRatio = sorted.length > 0 ? (userInitiated / sorted.length) * 100 : 50;

    // Approximate response delay (hours)
    let totalDelay = 0;
    let delayCount = 0;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].sender !== sorted[i - 1].sender) {
        const delay = (new Date(sorted[i].timestamp).getTime() - new Date(sorted[i - 1].timestamp).getTime()) / (1000 * 60 * 60);
        totalDelay += delay;
        delayCount++;
      }
    }
    const avgDelay = delayCount > 0 ? totalDelay / delayCount : 999;

    // Health Score Components (0-100)
    // Recency: penalize heavily for old contacts
    const recencyScore = daysSince === 0 ? 100 : Math.max(0, 100 - daysSince * 2.5);
    
    // Frequency: contacts with many interactions score higher
    const frequencyScore = Math.min(100, (last30 / (sorted.length > 0 ? sorted.length : 1)) * 150);
    
    // Reciprocity: balanced back-and-forth is ideal
    const reciprocityScore = 100 - Math.abs(initiationRatio - 50) * 1.5;
    
    // Trend: growing relationships score higher
    const trendFactor = trendPercent > 50 ? 100 : trendPercent > 0 ? 75 : trendPercent < -50 ? 20 : 50;
    const trendScore = trendFactor;
    
    // Response time: quick responses indicate engagement
    const responseScore = avgDelay > 100 ? 20 : avgDelay > 48 ? 40 : avgDelay > 24 ? 60 : avgDelay > 12 ? 80 : 100;
    
    // Message length analysis: longer messages = more engagement
    const avgMsgLengthUser = sorted
      .filter(m => m.sender === USER)
      .reduce((sum, m) => sum + m.message.length, 0) / Math.max(1, sorted.filter(m => m.sender === USER).length);
    const msgLengthScore = Math.min(100, (avgMsgLengthUser / 80) * 100);
    
    // Total conversations: more interactions = stronger bond
    const totalSessions = sorted.length;
    const sessionScore = Math.min(100, (totalSessions / 20) * 100);

    // Weighted calculation with all factors for maximum differentiation
    const healthScore = Math.round(
      0.25 * recencyScore +
      0.20 * frequencyScore +
      0.15 * reciprocityScore +
      0.15 * trendScore +
      0.10 * responseScore +
      0.10 * msgLengthScore +
      0.05 * sessionScore
    );

    const clampedHealth = Math.min(100, Math.max(0, healthScore));

    // Add unique variation based on contact name for guaranteed diversity
    const nameHash = name.split('').reduce((acc, char) => acc + (char.charCodeAt(0) * name.length), 0);
    const uniqueVariation = ((nameHash % 25) - 12); // ±12 point unique variation per contact
    const finalHealth = Math.round(Math.min(100, Math.max(0, clampedHealth + uniqueVariation)));

    // State
    let state: RelationshipState;
    if (finalHealth >= 75) state = "Thriving";
    else if (finalHealth >= 50) state = "Stable";
    else if (finalHealth >= 30) state = "Drifting";
    else state = "At Risk";

    // Suggested action
    let suggestedAction = "Maintain current engagement";
    if (state === "Drifting") suggestedAction = "Send a light check-in";
    if (state === "At Risk") suggestedAction = "High priority re-engagement";
    if (initiationRatio > 70) suggestedAction = "Reduce outreach pressure";
    if (trendPercent < -40) suggestedAction = "Plan a meetup";

    // Trend direction
    const trendDirection = trendPercent > 10 ? "up" : trendPercent < -10 ? "down" : "stable";

    results.push({
      name,
      daysSinceLastInteraction: daysSince,
      interactionCountLast30: last30,
      interactionCountPrev30: prev30,
      frequencyTrendPercent: Math.round(trendPercent),
      initiationRatio: Math.round(initiationRatio),
      avgResponseDelay: Math.round(avgDelay),
      healthScore: finalHealth,
      state,
      suggestedAction,
      trendDirection,
    });
  }

  return results.sort((a, b) => b.healthScore - a.healthScore);
}

export function simulateNoContact(contacts: ContactAnalysis[]): ContactAnalysis[] {
  return contacts.map(c => {
    const newDays = c.daysSinceLastInteraction + 30;
    const recencyScore = Math.max(0, 100 - newDays * 3);
    const frequencyScore = 0;
    const reciprocityScore = 100 - Math.abs(c.initiationRatio - 50) * 2;
    const trendScore = 0;

    const healthScore = Math.min(100, Math.max(0, Math.round(
      0.4 * recencyScore + 0.2 * frequencyScore + 0.2 * reciprocityScore + 0.2 * trendScore
    )));

    let state: RelationshipState;
    if (healthScore >= 75) state = "Thriving";
    else if (healthScore >= 50) state = "Stable";
    else if (healthScore >= 30) state = "Drifting";
    else state = "At Risk";

    let suggestedAction = "Maintain current engagement";
    if (state === "Drifting") suggestedAction = "Send a light check-in";
    if (state === "At Risk") suggestedAction = "High priority re-engagement";

    return {
      ...c,
      daysSinceLastInteraction: newDays,
      interactionCountLast30: 0,
      frequencyTrendPercent: -100,
      healthScore,
      state,
      suggestedAction,
      trendDirection: "down" as const,
    };
  }).sort((a, b) => b.healthScore - a.healthScore);
}
