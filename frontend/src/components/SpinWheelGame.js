import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Trophy, Truck, Percent, Loader2, PartyPopper } from "lucide-react";
import axios from "axios";
import { cn } from "../lib/utils";
import confetti from 'canvas-confetti';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Wheel segments configuration - Updated without CAN
const WHEEL_SEGMENTS = [
  { type: "discount_5", label: "-5%", color: "#F5F5F7", textColor: "#000" },
  { type: "discount_10", label: "-10%", color: "#8B5CF6", textColor: "#fff" },
  { type: "free_shipping", label: "Livraison\nGratuite", color: "#F5F5F7", textColor: "#000" },
  { type: "discount_5", label: "-5%", color: "#1C1C1E", textColor: "#fff" },
  { type: "discount_20", label: "-20%", color: "#D4AF37", textColor: "#000" },
  { type: "discount_5", label: "-5%", color: "#1C1C1E", textColor: "#fff" },
  { type: "discount_15", label: "-15%", color: "#EC4899", textColor: "#fff" },
  { type: "discount_10", label: "-10%", color: "#F5F5F7", textColor: "#000" },
];

const SEGMENT_ANGLE = 360 / WHEEL_SEGMENTS.length;

function SpinWheel({ onSpinComplete, isSpinning, setIsSpinning, prizeIndex }) {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);

  useEffect(() => {
    if (isSpinning && prizeIndex !== null) {
      // Calculate rotation to land on prize
      const baseRotations = 5; // Number of full rotations
      const targetAngle = 360 - (prizeIndex * SEGMENT_ANGLE) - (SEGMENT_ANGLE / 2);
      const totalRotation = (baseRotations * 360) + targetAngle + Math.random() * 20 - 10;
      
      setRotation(prev => prev + totalRotation);
      
      // Call complete after animation
      setTimeout(() => {
        setIsSpinning(false);
        onSpinComplete();
      }, 5000);
    }
  }, [isSpinning, prizeIndex]);

  return (
    <div className="relative w-72 h-72 md:w-80 md:h-80">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
        <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-black dark:border-t-white" />
      </div>
      
      {/* Wheel */}
      <motion.div
        ref={wheelRef}
        className="w-full h-full rounded-full border-4 border-black dark:border-white overflow-hidden shadow-2xl"
        style={{
          rotate: rotation,
          transition: isSpinning ? "transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none"
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {WHEEL_SEGMENTS.map((segment, index) => {
            const startAngle = index * SEGMENT_ANGLE;
            const endAngle = startAngle + SEGMENT_ANGLE;
            
            const startRad = (startAngle - 90) * Math.PI / 180;
            const endRad = (endAngle - 90) * Math.PI / 180;
            
            const x1 = 50 + 50 * Math.cos(startRad);
            const y1 = 50 + 50 * Math.sin(startRad);
            const x2 = 50 + 50 * Math.cos(endRad);
            const y2 = 50 + 50 * Math.sin(endRad);
            
            const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0;
            
            const textAngle = startAngle + SEGMENT_ANGLE / 2;
            const textRad = (textAngle - 90) * Math.PI / 180;
            const textX = 50 + 32 * Math.cos(textRad);
            const textY = 50 + 32 * Math.sin(textRad);
            
            return (
              <g key={index}>
                <path
                  d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={segment.color}
                  stroke="#333"
                  strokeWidth="0.5"
                />
                <text
                  x={textX}
                  y={textY}
                  fill={segment.textColor}
                  fontSize="6"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                >
                  {segment.label.split('\n').map((line, i) => (
                    <tspan key={i} x={textX} dy={i === 0 ? 0 : 7}>{line}</tspan>
                  ))}
                </text>
              </g>
            );
          })}
          {/* Center circle */}
          <circle cx="50" cy="50" r="8" fill="#000" className="dark:fill-white" />
          <text x="50" y="50" fill="#fff" className="dark:fill-black" fontSize="4" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
            CAN
          </text>
        </svg>
      </motion.div>
    </div>
  );
}

export default function SpinWheelGame({ isOpen, onClose }) {
  const [gameConfig, setGameConfig] = useState(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [eligibility, setEligibility] = useState(null);
  const [step, setStep] = useState("form"); // form, spinning, result
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchGameConfig();
    }
  }, [isOpen]);

  const fetchGameConfig = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/game/config`);
      setGameConfig(response.data);
    } catch (err) {
      console.error("Error fetching game config:", err);
    }
  };

  const checkEligibility = async () => {
    if (!email) return;
    try {
      const response = await axios.get(`${API_URL}/api/game/check-eligibility?email=${encodeURIComponent(email)}`);
      setEligibility(response.data);
    } catch (err) {
      console.error("Error checking eligibility:", err);
    }
  };

  const handleSpin = async () => {
    if (!email) {
      setError("Veuillez entrer votre email");
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/api/game/spin`, {
        email,
        name
      });
      
      setResult(response.data);
      
      // Find prize index on wheel
      const prizeType = response.data.prize_type;
      const index = WHEEL_SEGMENTS.findIndex(s => s.type === prizeType);
      setPrizeIndex(index >= 0 ? index : 0);
      
      setStep("spinning");
      setIsSpinning(true);
      
    } catch (err) {
      setError(err.response?.data?.detail || "Une erreur est survenue");
      setLoading(false);
    }
  };

  const handleSpinComplete = () => {
    setLoading(false);
    setStep("result");
    
    // Confetti for big prizes
    if (result?.prize_type === "jersey" || result?.prize_type === "discount_20") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleClose = () => {
    setStep("form");
    setResult(null);
    setEmail("");
    setName("");
    setError("");
    setEligibility(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#1C1C1E] rounded-3xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-green-600 to-green-700 text-white p-6 text-center">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl">🇸🇳</span>
              <Trophy className="w-8 h-8" />
              <span className="text-3xl">⚽</span>
            </div>
            <h2 className="text-2xl font-bold">Roue CAN 2025</h2>
            <p className="text-white/80 text-sm mt-1">
              Tentez de gagner un maillot personnalisé !
            </p>
            
            {gameConfig && (
              <div className="mt-3 flex items-center justify-center gap-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  🏆 {gameConfig.jerseys_remaining} maillots restants
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {step === "form" && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <p className="text-muted-foreground">
                    Inscrivez-vous pour obtenir un tour gratuit !
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    onBlur={checkEligibility}
                    placeholder="votre@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Nom (optionnel)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                {eligibility && !eligibility.can_spin && eligibility.is_subscribed && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 p-4 rounded-xl text-sm text-center">
                    Vous avez déjà utilisé votre tour gratuit. 
                    <br />
                    <strong>Achetez pour +25 000 FCFA</strong> pour un nouveau tour !
                  </div>
                )}

                <button
                  onClick={handleSpin}
                  disabled={loading || (eligibility && !eligibility.can_spin && eligibility.is_subscribed)}
                  className={cn(
                    "w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2",
                    loading || (eligibility && !eligibility.can_spin && eligibility.is_subscribed)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  )}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Gift className="w-5 h-5" />
                      Tourner la roue !
                    </>
                  )}
                </button>

                {/* Prizes preview */}
                <div className="mt-6 pt-6 border-t border-black/10 dark:border-white/10">
                  <p className="text-sm text-center text-muted-foreground mb-3">Prix à gagner</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">-5%</span>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">-10%</span>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">-20%</span>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Livraison gratuite
                    </span>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                      🏆 Maillot CAN
                    </span>
                  </div>
                </div>
              </div>
            )}

            {step === "spinning" && (
              <div className="flex flex-col items-center py-4">
                <SpinWheel
                  isSpinning={isSpinning}
                  setIsSpinning={setIsSpinning}
                  prizeIndex={prizeIndex}
                  onSpinComplete={handleSpinComplete}
                />
                <p className="mt-4 text-muted-foreground animate-pulse">
                  La roue tourne...
                </p>
              </div>
            )}

            {step === "result" && result && (
              <div className="text-center py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                >
                  {result.is_jersey ? (
                    <div className="w-24 h-24 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                      <Trophy className="w-12 h-12 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                      <PartyPopper className="w-12 h-12 text-blue-600" />
                    </div>
                  )}
                </motion.div>

                <h3 className="text-2xl font-bold mb-2">
                  {result.is_jersey ? "🎉 INCROYABLE !" : "Bravo !"}
                </h3>
                
                <p className="text-lg mb-4">{result.message}</p>

                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Votre code</p>
                  <p className="text-2xl font-mono font-bold tracking-wider">
                    {result.prize_code}
                  </p>
                </div>

                {result.is_jersey ? (
                  <p className="text-sm text-muted-foreground mb-4">
                    Nous vous contacterons par email pour personnaliser votre maillot !
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mb-4">
                    Utilisez ce code lors de votre prochaine commande
                  </p>
                )}

                <button
                  onClick={handleClose}
                  className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold hover:opacity-90 transition-opacity"
                >
                  {result.is_jersey ? "Super !" : "Utiliser maintenant"}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
