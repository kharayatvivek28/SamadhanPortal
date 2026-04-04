/**
 * AI Controller — Handles chat, rephrase, and translate endpoints
 * Rule-based responses are checked first before falling back to AI
 */
import {
  chatWithAI,
  rephraseComplaint,
  translateText,
  detectLanguage,
  suggestCategory,
} from '../services/aiService.js';

// ─── Rule-Based Response Definitions ─────────────────────────────────────────

const DEPARTMENT_OPTIONS = [
  { label: '💧 Water Supply', value: 'Water Supply' },
  { label: '⚡ Electricity', value: 'Electricity' },
  { label: '🛣️ Roads & Infrastructure', value: 'Roads & Infrastructure' },
  { label: '🧹 Sanitation', value: 'Sanitation' },
  { label: '🛡️ Public Safety', value: 'Public Safety' },
];

const QUICK_REPLIES = [
  { label: '📝 File Complaint', action: 'complaint' },
  { label: '🔍 Track Complaint', action: 'track' },
  { label: '📋 Departments', action: 'departments' },
  { label: '❓ Help', action: 'help' },
];

/**
 * Check if user input matches a rule-based pattern
 * @param {string} message - User message (lowercased)
 * @returns {object|null} Rule-based response or null
 */
const checkRules = (message) => {
  const lower = message.toLowerCase().trim();

  // Greeting / Help
  if (/^(hi|hello|hey|help|start|menu|options)\b/.test(lower)) {
    return {
      reply: "👋 Welcome to Samadhan Portal! I can help you with:\n\n• **File a Complaint** — Submit a new complaint\n• **Track a Complaint** — Check your complaint status\n• **Departments** — View available departments\n\nHow can I assist you today?",
      quickReplies: QUICK_REPLIES,
      type: 'rule',
    };
  }

  // Complaint filing
  if (/\b(complaint|register|file|submit|new complaint|lodge)\b/.test(lower)) {
    return {
      reply: "📝 **To file a complaint:**\n\n1. Choose a department below\n2. You'll be redirected to the complaint form\n3. Describe your issue clearly\n\nSelect a department:",
      quickReplies: DEPARTMENT_OPTIONS.map((d) => ({
        label: d.label,
        action: `department_${d.value}`,
      })),
      navigateTo: '/user/file-complaint',
      type: 'rule',
    };
  }

  // Tracking
  if (/\b(track|status|check|where|progress|update)\b/.test(lower)) {
    return {
      reply: "🔍 **To track your complaint:**\n\n1. Go to your **My Complaints** page\n2. Click on any complaint to see its full timeline\n3. You'll receive real-time notifications on status changes\n\nWould you like to go there now?",
      quickReplies: [
        { label: '📋 My Complaints', action: 'navigate_complaints' },
        { label: '🏠 Go Home', action: 'navigate_home' },
      ],
      navigateTo: '/user/my-complaints',
      type: 'rule',
    };
  }

  // Departments info
  if (/\b(department|departments|categories|types)\b/.test(lower)) {
    return {
      reply: "🏛️ **Available Departments:**\n\n" +
        DEPARTMENT_OPTIONS.map((d) => `• ${d.label}`).join('\n') +
        "\n\nSelect a department to file a complaint:",
      quickReplies: DEPARTMENT_OPTIONS.map((d) => ({
        label: d.label,
        action: `department_${d.value}`,
      })),
      type: 'rule',
    };
  }

  // Thank you
  if (/\b(thank|thanks|thankyou|thank you|bye|goodbye)\b/.test(lower)) {
    return {
      reply: "🙏 You're welcome! Feel free to reach out anytime you need help. Have a great day!",
      quickReplies: QUICK_REPLIES,
      type: 'rule',
    };
  }

  return null; // No rule matched — fall through to AI
};

// ─── Route Handlers ──────────────────────────────────────────────────────────

/**
 * POST /api/chat
 * Handles chatbot messages with rule-based check + AI fallback
 */
export const handleChat = async (req, res) => {
  try {
    const { message, history = [], language = 'en' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Step 1: Detect language if not English
    let processedMessage = message;
    let detectedLang = language;

    if (language !== 'en') {
      // Translate to English for processing
      try {
        processedMessage = await translateText(message, 'English');
        detectedLang = language;
      } catch {
        // If translation fails, use original message
        processedMessage = message;
      }
    } else {
      // Auto-detect language from input
      detectedLang = await detectLanguage(message);
      if (detectedLang !== 'en') {
        try {
          processedMessage = await translateText(message, 'English');
        } catch {
          processedMessage = message;
        }
      }
    }

    // Step 2: Check rule-based responses first
    const ruleResponse = checkRules(processedMessage);

    if (ruleResponse) {
      // Translate rule response if needed
      let reply = ruleResponse.reply;
      if (detectedLang !== 'en') {
        const langName = detectedLang === 'hi' ? 'Hindi' : 'Punjabi';
        try {
          reply = await translateText(reply, langName);
        } catch {
          // Keep English if translation fails
        }
      }

      return res.json({
        reply,
        quickReplies: ruleResponse.quickReplies || [],
        navigateTo: ruleResponse.navigateTo || null,
        type: 'rule',
      });
    }

    // Step 3: AI fallback — convert history format for Gemini
    const geminiHistory = history
      .filter((m) => m.role && m.text)
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

    let aiReply = await chatWithAI(processedMessage, geminiHistory);

    // Step 4: Translate AI response back if needed
    if (detectedLang !== 'en') {
      const langName = detectedLang === 'hi' ? 'Hindi' : 'Punjabi';
      try {
        aiReply = await translateText(aiReply, langName);
      } catch {
        // Keep English if translation fails
      }
    }

    return res.json({
      reply: aiReply,
      quickReplies: [],
      type: 'ai',
    });
  } catch (error) {
    console.error('Chat Controller Error:', error.message);
    return res.status(500).json({
      error: 'Something went wrong. Please try again.',
      reply: "I'm sorry, I'm having trouble right now. Please try again in a moment.",
      type: 'error',
    });
  }
};

/**
 * POST /api/rephrase
 * Rephrases complaint text to be formal and clear
 */
export const handleRephrase = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Complaint text is required' });
    }

    if (text.trim().length < 10) {
      return res.status(400).json({ error: 'Complaint text is too short to rephrase' });
    }

    const rephrased = await rephraseComplaint(text);

    return res.json({
      original: text,
      rephrased: rephrased.trim(),
    });
  } catch (error) {
    console.error('Rephrase Controller Error:', error.message);
    return res.status(500).json({ error: 'Failed to rephrase complaint. Please try again.' });
  }
};

/**
 * POST /api/translate
 * Translates text to target language
 */
export const handleTranslate = async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!targetLanguage || typeof targetLanguage !== 'string') {
      return res.status(400).json({ error: 'Target language is required' });
    }

    // Map language codes to names
    const langMap = {
      en: 'English',
      hi: 'Hindi',
      pa: 'Punjabi',
    };

    const langName = langMap[targetLanguage] || targetLanguage;
    const translated = await translateText(text, langName);

    return res.json({
      original: text,
      translated: translated.trim(),
      language: targetLanguage,
    });
  } catch (error) {
    console.error('Translate Controller Error:', error.message);
    return res.status(500).json({ error: 'Failed to translate text. Please try again.' });
  }
};

/**
 * POST /api/suggest-category
 * Suggests a department for the complaint text
 */
export const handleSuggestCategory = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length < 20) {
      return res.status(400).json({ error: 'Provide at least 20 characters of complaint text' });
    }

    const suggested = await suggestCategory(text);

    return res.json({ suggestedDepartment: suggested.trim() });
  } catch (error) {
    console.error('Suggest Category Error:', error.message);
    return res.status(500).json({ error: 'Failed to suggest category.' });
  }
};
