import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ArrowRight, Clock, Flame, Timer, TrendingDown, ShoppingBag, Sparkles } from "lucide-react";
import axios from "axios";
import { formatPrice, calculateDiscount } from "../lib/utils";
import { useCart } from "../contexts/CartContext";

const API_URL = process.env.REACT_APP_BACKEND_URL;

function AnimatedCountdownTimer({ endDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [prevTime, setPrevTime] = useState(timeLeft);

  function calculateTimeLeft() {
    const difference = new Date(endDate) - new Date();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setPrevTime(timeLeft);
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, timeLeft]);

  if (timeLeft.expired) return null;

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 6;
  const isVeryUrgent = timeLeft.days === 0 && timeLeft.hours < 1;

  const TimeBlock = ({ value, label, changed }) => (
    <div className="flex flex-col items-center">
      <motion.div 
        className={`
          relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 
          rounded-2xl overflow-hidden
          ${isVeryUrgent 
            ? 'bg-gradient-to-br from-red-500 to-red-600' 
            : isUrgent 
              ? 'bg-gradient-to-br from-orange-500 to-red-500'
              : 'bg-gradient-to-br from-red-500 to-orange-500'
          }
          shadow-lg
        `}
        animate={changed ? { scale: [1, 1.15, 1], rotateY: [0, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {/* Glowing effect */}
        <div className="absolute inset-0 bg-white/10 rounded-2xl" />
        
        {/* Number with flip animation */}
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -30, opacity: 0, rotateX: -90 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            exit={{ y: 30, opacity: 0, rotateX: 90 }}
            transition={{ duration: 0.3, type: "spring" }}
            className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold text-white tabular-nums"
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
        
        {/* Shine effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
        />
      </motion.div>
      <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/80 mt-2">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
      <TimeBlock value={timeLeft.days} label="Jours" changed={timeLeft.days !== prevTime.days} />
      <motion.span 
        className="text-xl sm:text-2xl font-bold text-white/60 mb-6"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >:</motion.span>
      <TimeBlock value={timeLeft.hours} label="Heures" changed={timeLeft.hours !== prevTime.hours} />
      <motion.span 
        className="text-xl sm:text-2xl font-bold text-white/60 mb-6"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >:</motion.span>
      <TimeBlock value={timeLeft.minutes} label="Min" changed={timeLeft.minutes !== prevTime.minutes} />
      <motion.span 
        className="text-xl sm:text-2xl font-bold text-white/60 mb-6"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >:</motion.span>
      <TimeBlock value={timeLeft.seconds} label="Sec" changed={timeLeft.seconds !== prevTime.seconds} />
    </div>
  );
}

function FlashProductCard({ product, index }) {
  const { addToCart, loading } = useCart();
  const discount = calculateDiscount(product.price, product.flash_sale_price || product.price);
  const savings = product.price - (product.flash_sale_price || product.price);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ 
        delay: index * 0.15,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      className="relative group"
    >
      {/* Animated glow effect */}
      <motion.div 
        className="absolute -inset-2 bg-gradient-to-r from-red-500/40 via-orange-500/40 to-yellow-500/40 rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500"
        animate={{
          background: [
            "linear-gradient(45deg, rgba(239,68,68,0.4), rgba(249,115,22,0.4), rgba(234,179,8,0.4))",
            "linear-gradient(180deg, rgba(249,115,22,0.4), rgba(234,179,8,0.4), rgba(239,68,68,0.4))",
            "linear-gradient(45deg, rgba(239,68,68,0.4), rgba(249,115,22,0.4), rgba(234,179,8,0.4))"
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      <motion.div 
        className="relative bg-white dark:bg-[#1C1C1E] rounded-3xl overflow-hidden shadow-xl"
        whileHover={{ y: -10, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Flash Sale Badge - Animated */}
        <motion.div 
          className="absolute top-4 left-4 z-20"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -3, 3, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-[length:200%_100%] text-white px-4 py-2 rounded-full text-sm font-black flex items-center gap-2 shadow-lg animate-gradient">
            <Flame className="w-4 h-4" />
            -{discount}%
          </div>
        </motion.div>

        {/* Timer badge */}
        <motion.div 
          className="absolute top-4 right-4 z-20 bg-black/90 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Timer className="w-3 h-3 animate-pulse" />
          LIMITÉ
        </motion.div>

        {/* Product Image */}
        <Link to={`/produit/${product.product_id}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-[#F5F5F7] dark:bg-[#2C2C2E]">
            <motion.img 
              src={product.images?.[0] || "/placeholder.jpg"}
              alt={product.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.6 }}
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Sparkle effects */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
            >
              <Sparkles className="absolute top-1/4 left-1/4 w-6 h-6 text-yellow-400" />
              <Sparkles className="absolute bottom-1/3 right-1/4 w-4 h-4 text-orange-400" />
            </motion.div>
          </div>
        </Link>
        
        {/* Product Info */}
        <div className="p-5">
          <Link to={`/produit/${product.product_id}`}>
            <h3 className="font-semibold text-base line-clamp-2 mb-3 group-hover:text-red-500 transition-colors">
              {product.name}
            </h3>
          </Link>
          
          {/* Price section */}
          <div className="flex items-end gap-3 mb-4">
            <motion.span 
              className="text-2xl font-black text-red-500"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {formatPrice(product.flash_sale_price || product.price)}
            </motion.span>
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          </div>
          
          {/* Savings badge */}
          <div className="flex items-center gap-2 mb-4 p-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <TrendingDown className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              Économisez {formatPrice(savings)}
            </span>
          </div>
          
          {/* Add to cart button */}
          <motion.button
            onClick={() => addToCart(product.product_id)}
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <ShoppingBag className="w-5 h-5" />
            Ajouter au panier
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FlashSalesSection() {
  const [flashProducts, setFlashProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nearestEndDate, setNearestEndDate] = useState(null);

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/flash-sales`);
        setFlashProducts(response.data);
        
        if (response.data.length > 0) {
          const dates = response.data.map(p => new Date(p.flash_sale_end));
          setNearestEndDate(new Date(Math.min(...dates)).toISOString());
        }
      } catch (error) {
        console.error("Error fetching flash sales:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSales();
  }, []);

  if (loading || flashProducts.length === 0) return null;

  return (
    <section className="py-12 md:py-20 overflow-hidden relative" data-testid="flash-sales-section">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500">
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              "linear-gradient(135deg, rgba(220,38,38,1) 0%, rgba(249,115,22,1) 50%, rgba(234,179,8,1) 100%)",
              "linear-gradient(135deg, rgba(249,115,22,1) 0%, rgba(234,179,8,1) 50%, rgba(220,38,38,1) 100%)",
              "linear-gradient(135deg, rgba(234,179,8,1) 0%, rgba(220,38,38,1) 50%, rgba(249,115,22,1) 100%)",
              "linear-gradient(135deg, rgba(220,38,38,1) 0%, rgba(249,115,22,1) 50%, rgba(234,179,8,1) 100%)"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5
            }}
          />
        ))}
        
        {/* Lightning bolt animations */}
        <motion.div
          className="absolute top-10 left-[10%]"
          animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
        >
          <Zap className="w-8 h-8 text-yellow-300" fill="currentColor" />
        </motion.div>
        <motion.div
          className="absolute top-20 right-[15%]"
          animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        >
          <Zap className="w-6 h-6 text-yellow-300" fill="currentColor" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-[20%]"
          animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
        >
          <Zap className="w-10 h-10 text-yellow-300" fill="currentColor" />
        </motion.div>
      </div>

      <div className="container-lumina relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          {/* Animated badge */}
          <motion.div 
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-black mb-6 border border-white/30"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(255,255,255,0.2)",
                "0 0 40px rgba(255,255,255,0.4)",
                "0 0 20px rgba(255,255,255,0.2)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-5 h-5" fill="currentColor" />
            </motion.div>
            VENTES FLASH
            <Flame className="w-5 h-5 animate-pulse" />
          </motion.div>
          
          <motion.h2 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Offres <span className="text-yellow-300">Exclusives</span>
          </motion.h2>
          
          <motion.p 
            className="text-white/80 text-base sm:text-lg max-w-md mx-auto mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Des prix imbattables pour une durée très limitée !
          </motion.p>
          
          {/* Animated Countdown */}
          {nearestEndDate && (
            <motion.div 
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <motion.div 
                className="flex items-center gap-2 text-sm font-bold text-white bg-black/30 px-4 py-2 rounded-full"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Clock className="w-4 h-4 animate-pulse" />
                <span>Fin de l'offre dans</span>
              </motion.div>
              <AnimatedCountdownTimer endDate={nearestEndDate} />
            </motion.div>
          )}
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {flashProducts.slice(0, 4).map((product, index) => (
            <FlashProductCard 
              key={product.product_id} 
              product={product} 
              index={index} 
            />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10 md:mt-14"
        >
          <Link
            to="/promotions"
            className="group inline-flex items-center gap-3 bg-white text-red-500 px-8 py-4 rounded-full font-black shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
          >
            <Zap className="w-5 h-5" />
            Voir toutes les offres
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </Link>
        </motion.div>
      </div>
      
      {/* CSS for gradient animation */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
}
