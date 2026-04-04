/**
 * Chatbot — Floating AI chatbot widget (bottom-right corner)
 * Features: rule-based + AI fallback, quick replies, typing indicator,
 * language-aware messaging, navigation support
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import ChatMessage from "./ChatMessage";
import QuickReplies from "./QuickReplies";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
}

interface QuickReply {
  label: string;
  action: string;
}

const API_BASE = "/api";

const Chatbot = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Add language prompt on first open
  const handleOpen = useCallback(() => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([
        {
          id: "lang_prompt",
          role: "bot",
          text: "Please select your preferred language for this conversation.\nकृपया इस बातचीत के लिए अपनी पसंदीदा भाषा चुनें।\nਕਿਰਪਾ ਕਰਕੇ ਇਸ ਗੱਲਬਾਤ ਲਈ ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ।",
        },
      ]);
      setQuickReplies([
        { label: "English", action: "set_lang_en" },
        { label: "हिंदी / Hindi", action: "set_lang_hi" },
        { label: "ਪੰਜਾਬੀ / Punjabi", action: "set_lang_pa" },
      ]);
    }
  }, [messages.length]);

  // Generate unique message ID
  const genId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  // Handle navigation actions from quick replies
  const handleNavigation = useCallback(
    (action: string) => {
      if (action === "navigate_complaints") {
        navigate("/user/my-complaints");
      } else if (action === "navigate_home") {
        navigate("/");
      } else if (action.startsWith("department_")) {
        navigate("/user/file-complaint");
      }
    },
    [navigate]
  );

  // Send message to backend
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // Add user message
      const userMsg: Message = { id: genId(), role: "user", text: text.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setQuickReplies([]);
      setIsTyping(true);

      try {
        // Build chat history for context (last 10 messages)
        const history = messages.slice(-10).map((m) => ({
          role: m.role === "user" ? "user" : "model",
          text: m.text,
        }));

        const res = await fetch(`${API_BASE}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            history,
            language: i18n.language,
          }),
        });

        let data;
        try {
          data = await res.json();
        } catch (e) {
          throw new Error("Server returned an invalid response.");
        }

        if (!res.ok) {
          throw new Error(data?.error || "Failed to get response");
        }

        // Add bot response
        const botMsg: Message = {
          id: genId(),
          role: "bot",
          text: data.reply || "I'm sorry, I couldn't process that. Please try again.",
        };
        setMessages((prev) => [...prev, botMsg]);

        // Set quick replies if provided
        if (data.quickReplies && data.quickReplies.length > 0) {
          setQuickReplies(data.quickReplies);
        }
      } catch (error) {
        console.error("Chatbot error:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: genId(),
            role: "bot",
            text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [messages, i18n.language]
  );

  // Handle quick reply selection
  const handleQuickReply = useCallback(
    async (reply: QuickReply) => {
      // Language selection handling
      if (reply.action.startsWith("set_lang_")) {
        const langCode = reply.action.replace("set_lang_", "");
        
        // Show user selection
        const userMsg: Message = { id: genId(), role: "user", text: reply.label };
        setMessages((prev) => [...prev, userMsg]);
        setQuickReplies([]);
        setIsTyping(true);

        // Update global language and wait for translations to load
        await i18n.changeLanguage(langCode);
        
        // Present the translated welcome message and options
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { id: genId(), role: "bot", text: i18n.t("chatbot.welcome", { defaultValue: "Welcome to Samadhan Portal! I can help you with:\n\n• File a Complaint\n• Track a Complaint\n• Departments\n\nHow can I assist you today?" }) }
        ]);
        setQuickReplies([
          { label: i18n.t("chatbot.optComplaint", { defaultValue: "📝 File Complaint" }), action: "complaint" },
          { label: i18n.t("chatbot.optTrack", { defaultValue: "🔍 Track Complaint" }), action: "navigate_complaints" },
          { label: i18n.t("chatbot.optDept", { defaultValue: "📋 Departments" }), action: "departments" },
          { label: i18n.t("chatbot.optHelp", { defaultValue: "❓ Help" }), action: "help" },
        ]);
        return;
      }

      // Check if it's a navigation action
      if (
        reply.action.startsWith("navigate_") ||
        reply.action.startsWith("department_")
      ) {
        handleNavigation(reply.action);
        
        // Add user message so the UI updates
        const userMsg: Message = { id: genId(), role: "user", text: reply.label };
        setMessages((prev) => [...prev, userMsg]);
        setQuickReplies([]);

        // Add a helpful bot transition message
        let botText = t("chatbot.navigating", { defaultValue: "Navigating..." });
        if (reply.action === "navigate_complaints") {
           botText = t("chatbot.navComplaints", { defaultValue: "I've taken you to your Complaints Dashboard." });
        } else if (reply.action === "navigate_home") {
           botText = t("chatbot.navHome", { defaultValue: "Returning you to the Home page." });
        } else if (reply.action.startsWith("department_")) {
           // Remove emojis from the label for cleaner text
           const cleanLabel = reply.label.replace(/[\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF]/g, '').trim();
           botText = t("chatbot.navDepartment", { defaultValue: "I've opened the Complaint Form. Please select the **{{dept}}** department and describe your issue!", dept: cleanLabel });
        }

        setTimeout(() => {
           setMessages((prev) => [...prev, { id: genId(), role: "bot", text: botText }]);
        }, 400);

        return;
      }

      // Otherwise send as a chat message
      sendMessage(reply.label);
    },
    [handleNavigation, sendMessage, i18n]
  );

  // Handle enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Chat toggle button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            id="chatbot-toggle"
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground 
                       rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            aria-label="Open chatbot"
          >
            <MessageCircle className="h-6 w-6" />
            {/* Pulse ring animation */}
            <motion.span
              className="absolute inset-0 rounded-full bg-primary/30"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chatbot-window"
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] 
                       h-[520px] max-h-[calc(100vh-4rem)] bg-card border rounded-2xl 
                       shadow-2xl flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-primary-foreground/20 rounded-full p-1">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{t("chatbot.title")}</h3>
                  <p className="text-[10px] text-primary-foreground/70">{t("chatbot.subtitle")}</p>
                </div>
              </div>
              <motion.button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-primary-foreground/20 rounded-full transition-colors"
                whileTap={{ scale: 0.9 }}
                aria-label="Close chatbot"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 scrollbar-thin">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} role={msg.role} text={msg.text} />
              ))}
              {isTyping && <ChatMessage role="bot" text="" isTyping />}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            {quickReplies.length > 0 && !isTyping && (
              <div className="px-3 pb-1">
                <QuickReplies replies={quickReplies} onSelect={handleQuickReply} />
              </div>
            )}

            {/* Input area */}
            <div className="px-3 py-2.5 border-t bg-card shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("chatbot.inputPlaceholder")}
                  className="flex-1 bg-muted text-foreground text-sm rounded-full px-4 py-2 
                             focus:outline-none focus:ring-2 focus:ring-primary/40 
                             placeholder:text-muted-foreground/60"
                  disabled={isTyping}
                />
                <motion.button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className="bg-primary text-primary-foreground rounded-full p-2 
                             disabled:opacity-40 disabled:cursor-not-allowed 
                             hover:opacity-90 transition-opacity"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
