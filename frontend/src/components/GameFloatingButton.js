import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X } from "lucide-react";
import axios from "axios";
import SpinWheelGame from "./SpinWheelGame";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function GameFloatingButton() {
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [gameConfig, setGameConfig] = useState(null);
  const [showPulse, setShowPulse] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/game/config`);
        setGameConfig(response.data);
      } catch (err) {
        console.error("Error fetching game config:", err);
      }
    };
    fetchConfig();
  }, []);

  // Don't show if game is not active
  if (!gameConfig?.active) return null;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsGameOpen(true);
          setShowPulse(false);
        }}
        className="fixed bottom-24 right-6 z-[80] w-16 h-16 bg-green-600 hover:bg-green-700 rounded-full shadow-lg flex items-center justify-center text-white transition-colors"
        aria-label="Jouer pour gagner"
      >
        {showPulse && (
          <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
        )}
        <Gift className="w-7 h-7 relative z-10" />
      </motion.button>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-[7.5rem] right-24 z-40 hidden md:block"
      >
        <div className="bg-black dark:bg-white text-white dark:text-black text-xs font-medium px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
          🎁 Gagnez un maillot CAN !
        </div>
      </motion.div>

      {/* Game Modal */}
      <SpinWheelGame 
        isOpen={isGameOpen} 
        onClose={() => setIsGameOpen(false)} 
      />
    </>
  );
}
