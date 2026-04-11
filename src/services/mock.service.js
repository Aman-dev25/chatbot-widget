// src/services/mock.service.js
// Provides realistic-feeling canned responses for testing without an API key.
// Matches on keywords in the user's message and picks a random variant.

// Each entry: { keywords: string[], replies: string[] }
const MOCK_RULES = [
  {
    keywords: ["hello", "hi", "hey", "greetings", "howdy"],
    replies: [
      "Hey there! 👋 How can I help you today?",
      "Hello! Great to see you. What can I do for you?",
      "Hi! I'm here and ready to help. What's on your mind?",
    ],
  },
  {
    keywords: ["name", "who are you", "what are you", "introduce"],
    replies: [
      "I'm your friendly Support Bot! I'm here to help you with any questions you might have.",
      "Great question! I'm Support Bot, a virtual assistant here to make your experience smoother.",
    ],
  },
  {
    keywords: ["help", "support", "assist", "problem", "issue"],
    replies: [
      "Of course! I'm happy to help. Could you describe the issue you're facing in a bit more detail?",
      "Sure thing! Tell me more about what you need help with and I'll do my best to point you in the right direction.",
      "I'm here for you! Please share more details about your issue and we'll figure it out together.",
    ],
  },
  {
    keywords: ["price", "pricing", "cost", "plan", "plans", "subscription", "fee"],
    replies: [
      "We offer flexible plans to suit all needs — from a free tier up to enterprise. Want me to walk you through the options?",
      "Our pricing is designed to scale with your business. I'd recommend checking our Pricing page or speaking to our sales team for the best fit.",
    ],
  },
  {
    keywords: ["bye", "goodbye", "see you", "later", "thanks", "thank you"],
    replies: [
      "You're welcome! Don't hesitate to come back if you need anything. Take care! 👋",
      "Happy to help! Have a great day! 😊",
      "Goodbye! Feel free to reach out anytime.",
    ],
  },
  {
    keywords: ["feature", "features", "can you", "what can"],
    replies: [
      "I can answer questions, guide you through our platform, help with troubleshooting, and connect you with our team. What would you like to explore?",
      "Great question! I can help with general inquiries, product questions, and support requests. What do you need?",
    ],
  },
  {
    keywords: ["contact", "human", "agent", "person", "speak to"],
    replies: [
      "Of course! You can reach our team at support@example.com or use the live chat during business hours. Want me to help while you wait?",
      "I'll flag this for a human agent to follow up. In the meantime, feel free to describe your issue and I'll do what I can.",
    ],
  },
];

// Fallback replies when no keyword matches
const FALLBACK_REPLIES = [
  "That's a great question! Let me look into that for you. In the meantime, feel free to ask anything else.",
  "I'm not 100% sure about that one, but our support team would be happy to help. You can also try rephrasing your question!",
  "Interesting! I want to make sure I give you the right answer. Could you elaborate a little more?",
  "Got it! I'll do my best to assist. Our team is also available if you'd prefer to speak with someone directly.",
];

/**
 * Picks a random element from an array.
 */
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Returns a mock reply based on keyword matching.
 * @param {string} message - The raw user message
 * @returns {string} - A realistic-sounding reply
 */
export function getMockReply(message) {
  const lower = message.toLowerCase();

  for (const rule of MOCK_RULES) {
    const matched = rule.keywords.some((kw) => lower.includes(kw));
    if (matched) {
      return randomPick(rule.replies);
    }
  }

  return randomPick(FALLBACK_REPLIES);
}
