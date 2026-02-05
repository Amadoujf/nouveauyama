import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  User,
  Bot,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function LiveChatWidget() {
  const { user, token, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const messagesEndRef = useRef(null);

  // Start chat session when opened
  useEffect(() => {
    if (isOpen && !session) {
      startSession();
    }
  }, [isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages
  useEffect(() => {
    if (!session?.session_id) return;

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_URL}/api/chat/${session.session_id}`);
        if (response.data.messages.length > messages.length) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.error("Error polling messages:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [session, messages.length]);

  const startSession = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/chat/start`,
        {
          name: user?.name || "Visiteur",
          email: user?.email || "",
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      setSession(response.data);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Error starting chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !session?.session_id || sending) return;

    const messageText = input.trim();
    setInput("");
    setSending(true);

    // Optimistic update
    const tempMessage = {
      message_id: `temp_${Date.now()}`,
      message: messageText,
      sender_type: "customer",
      sender_name: user?.name || "Vous",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const response = await axios.post(
        `${API_URL}/api/chat/${session.session_id}/message`,
        {
          message: messageText,
          sender_type: "customer",
        }
      );

      // Replace temp message with real one
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.message_id !== tempMessage.message_id);
        const newMessages = [response.data.message];
        if (response.data.auto_reply) {
          newMessages.push(response.data.auto_reply);
        }
        return [...filtered, ...newMessages];
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.message_id !== tempMessage.message_id));
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(true);
          setShowBadge(false);
        }}
        className={`fixed bottom-6 left-6 z-[70] w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-full shadow-lg flex items-center justify-center text-white transition-all ${
          isOpen ? "hidden" : ""
        }`}
        aria-label="Ouvrir le chat"
      >
        <MessageCircle className="w-6 h-6" />
        {showBadge && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold">
            1
          </span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-4 sm:right-auto sm:w-[360px] z-[80] h-[70vh] sm:h-[450px] bg-white dark:bg-gray-900 sm:rounded-2xl shadow-2xl border flex flex-col"
            style={{ maxHeight: 'calc(100vh - 60px)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm sm:text-base">Support YAMA+</h3>
                  <p className="text-xs text-white/80">
                    {loading ? "Connexion..." : "En ligne"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <Minimize2 className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSession(null);
                    setMessages([]);
                  }}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50 dark:bg-gray-800 min-h-0">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={msg.message_id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        msg.sender_type === "customer" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 sm:px-4 py-2 ${
                          msg.sender_type === "customer"
                            ? "bg-primary text-white rounded-br-md"
                            : "bg-white dark:bg-gray-700 shadow-sm rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p
                          className={`text-[10px] mt-1 ${
                            msg.sender_type === "customer"
                              ? "text-white/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input - Fixed at bottom */}
            <div className="p-3 sm:p-4 border-t bg-white dark:bg-gray-900 flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  disabled={loading || sending}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading || sending}
                  className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-center text-muted-foreground mt-2">
                Réponses automatiques • Support humain disponible
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
