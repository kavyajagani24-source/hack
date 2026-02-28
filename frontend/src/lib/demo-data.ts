import { ChatLog } from "./types";

const now = new Date();
const d = (daysAgo: number, hoursAgo = 0) => {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
};

const USER = "You";

export const demoData: ChatLog[] = [
  // Sarah Chen - Thriving (frequent, reciprocal, recent)
  { timestamp: d(0, 2), sender: USER, receiver: "Sarah Chen", message: "Hey, want to grab coffee later?" },
  { timestamp: d(0, 1), sender: "Sarah Chen", receiver: USER, message: "Absolutely! 3pm works?" },
  { timestamp: d(1, 5), sender: "Sarah Chen", receiver: USER, message: "Check out this article" },
  { timestamp: d(1, 4), sender: USER, receiver: "Sarah Chen", message: "Love it, thanks!" },
  { timestamp: d(3), sender: USER, receiver: "Sarah Chen", message: "Movie tonight?" },
  { timestamp: d(3, -1), sender: "Sarah Chen", receiver: USER, message: "I'm in!" },
  { timestamp: d(5), sender: "Sarah Chen", receiver: USER, message: "Happy Monday!" },
  { timestamp: d(7), sender: USER, receiver: "Sarah Chen", message: "Brunch Sunday?" },
  { timestamp: d(7, -2), sender: "Sarah Chen", receiver: USER, message: "Yes please!" },
  { timestamp: d(10), sender: "Sarah Chen", receiver: USER, message: "How was your weekend?" },
  { timestamp: d(12), sender: USER, receiver: "Sarah Chen", message: "Great! We should hike soon" },
  { timestamp: d(15), sender: "Sarah Chen", receiver: USER, message: "Thinking of you, hope work is good" },
  { timestamp: d(18), sender: USER, receiver: "Sarah Chen", message: "It is! Let's catch up" },
  { timestamp: d(20), sender: "Sarah Chen", receiver: USER, message: "Dinner Friday?" },
  { timestamp: d(25), sender: USER, receiver: "Sarah Chen", message: "Sent you that recipe" },
  { timestamp: d(35), sender: "Sarah Chen", receiver: USER, message: "Miss our chats!" },
  { timestamp: d(40), sender: USER, receiver: "Sarah Chen", message: "Same here, let's plan something" },
  { timestamp: d(45), sender: "Sarah Chen", receiver: USER, message: "Coffee next week?" },
  { timestamp: d(50), sender: USER, receiver: "Sarah Chen", message: "Absolutely!" },

  // Marcus Rivera - Stable (regular but less frequent)
  { timestamp: d(2), sender: USER, receiver: "Marcus Rivera", message: "How's the project going?" },
  { timestamp: d(2, -1), sender: "Marcus Rivera", receiver: USER, message: "Almost done, thanks for asking" },
  { timestamp: d(8), sender: "Marcus Rivera", receiver: USER, message: "Can you review my PR?" },
  { timestamp: d(8, -2), sender: USER, receiver: "Marcus Rivera", message: "On it!" },
  { timestamp: d(14), sender: USER, receiver: "Marcus Rivera", message: "Lunch tomorrow?" },
  { timestamp: d(14, -3), sender: "Marcus Rivera", receiver: USER, message: "Sure thing" },
  { timestamp: d(22), sender: "Marcus Rivera", receiver: USER, message: "Thanks for the help yesterday" },
  { timestamp: d(30), sender: USER, receiver: "Marcus Rivera", message: "No problem!" },
  { timestamp: d(38), sender: "Marcus Rivera", receiver: USER, message: "Beers Friday?" },
  { timestamp: d(45), sender: USER, receiver: "Marcus Rivera", message: "Let's do it" },
  { timestamp: d(52), sender: "Marcus Rivera", receiver: USER, message: "Good chat today" },

  // Priya Patel - Drifting (declining frequency)
  { timestamp: d(12), sender: USER, receiver: "Priya Patel", message: "Hey! How are things?" },
  { timestamp: d(12, -5), sender: "Priya Patel", receiver: USER, message: "Good! Busy with the move" },
  { timestamp: d(25), sender: USER, receiver: "Priya Patel", message: "Hope settling in is going well" },
  { timestamp: d(35), sender: USER, receiver: "Priya Patel", message: "Miss our coffee dates" },
  { timestamp: d(36), sender: "Priya Patel", receiver: USER, message: "Me too! Let's plan one" },
  { timestamp: d(42), sender: "Priya Patel", receiver: USER, message: "How's everything?" },
  { timestamp: d(48), sender: USER, receiver: "Priya Patel", message: "All good, you?" },
  { timestamp: d(55), sender: "Priya Patel", receiver: USER, message: "Hanging in there!" },

  // James O'Brien - At Risk (very low recent contact)
  { timestamp: d(45), sender: USER, receiver: "James O'Brien", message: "Hey James, long time!" },
  { timestamp: d(48), sender: "James O'Brien", receiver: USER, message: "Yeah, been swamped" },
  { timestamp: d(55), sender: USER, receiver: "James O'Brien", message: "We should catch up" },

  // Luna Zhang - Thriving (very reciprocal)
  { timestamp: d(1), sender: "Luna Zhang", receiver: USER, message: "Morning! Ready for today?" },
  { timestamp: d(1, -1), sender: USER, receiver: "Luna Zhang", message: "Born ready!" },
  { timestamp: d(2), sender: USER, receiver: "Luna Zhang", message: "Great session today" },
  { timestamp: d(2, -1), sender: "Luna Zhang", receiver: USER, message: "Agreed! Next week same time?" },
  { timestamp: d(4), sender: "Luna Zhang", receiver: USER, message: "Found this resource for you" },
  { timestamp: d(6), sender: USER, receiver: "Luna Zhang", message: "This is amazing, thanks!" },
  { timestamp: d(9), sender: "Luna Zhang", receiver: USER, message: "Yoga Saturday?" },
  { timestamp: d(9, -1), sender: USER, receiver: "Luna Zhang", message: "Yesss" },
  { timestamp: d(13), sender: USER, receiver: "Luna Zhang", message: "That was so fun" },
  { timestamp: d(16), sender: "Luna Zhang", receiver: USER, message: "When's the next one?" },
  { timestamp: d(20), sender: USER, receiver: "Luna Zhang", message: "This weekend!" },
  { timestamp: d(28), sender: "Luna Zhang", receiver: USER, message: "Count me in" },
  { timestamp: d(35), sender: USER, receiver: "Luna Zhang", message: "Always!" },
  { timestamp: d(42), sender: "Luna Zhang", receiver: USER, message: "Book club pick?" },
  { timestamp: d(50), sender: USER, receiver: "Luna Zhang", message: "I'll send one tonight" },

  // Derek Kim - Drifting (user initiates most)
  { timestamp: d(8), sender: USER, receiver: "Derek Kim", message: "Hey Derek, how's the new job?" },
  { timestamp: d(10), sender: "Derek Kim", receiver: USER, message: "It's alright" },
  { timestamp: d(20), sender: USER, receiver: "Derek Kim", message: "Want to hang out this weekend?" },
  { timestamp: d(32), sender: USER, receiver: "Derek Kim", message: "Haven't heard from you in a while" },
  { timestamp: d(33), sender: "Derek Kim", receiver: USER, message: "Sorry, been busy" },
  { timestamp: d(45), sender: USER, receiver: "Derek Kim", message: "No worries, hope things are good" },
  { timestamp: d(50), sender: USER, receiver: "Derek Kim", message: "Let me know if you want to grab food" },

  // Aisha Williams - Stable (consistent, moderate)
  { timestamp: d(3), sender: "Aisha Williams", receiver: USER, message: "Team outing next week?" },
  { timestamp: d(3, -1), sender: USER, receiver: "Aisha Williams", message: "I'm down!" },
  { timestamp: d(10), sender: USER, receiver: "Aisha Williams", message: "That was fun" },
  { timestamp: d(10, -2), sender: "Aisha Williams", receiver: USER, message: "We should do it more often" },
  { timestamp: d(18), sender: "Aisha Williams", receiver: USER, message: "Saw this and thought of you" },
  { timestamp: d(18, -1), sender: USER, receiver: "Aisha Williams", message: "Haha love it" },
  { timestamp: d(28), sender: USER, receiver: "Aisha Williams", message: "Happy birthday!!" },
  { timestamp: d(28, -1), sender: "Aisha Williams", receiver: USER, message: "Thank youuu!" },
  { timestamp: d(38), sender: "Aisha Williams", receiver: USER, message: "Meeting tomorrow?" },
  { timestamp: d(45), sender: USER, receiver: "Aisha Williams", message: "Confirmed!" },
  { timestamp: d(52), sender: "Aisha Williams", receiver: USER, message: "See you there" },
];
