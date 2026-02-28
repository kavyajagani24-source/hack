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
    const recencyScore = Math.max(0, 100 - daysSince * 3);
    const frequencyScore = Math.min(100, last30 * 10);
    const reciprocityScore = 100 - Math.abs(initiationRatio - 50) * 2;
    const trendScore = Math.min(100, Math.max(0, 50 + trendPercent));

    const healthScore = Math.round(
      0.4 * recencyScore +
      0.2 * frequencyScore +
      0.2 * reciprocityScore +
      0.2 * trendScore
    );

    const clampedHealth = Math.min(100, Math.max(0, healthScore));

    // State
    let state: RelationshipState;
    if (clampedHealth >= 75) state = "Thriving";
    else if (clampedHealth >= 50) state = "Stable";
    else if (clampedHealth >= 30) state = "Drifting";
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
      healthScore: clampedHealth,
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
