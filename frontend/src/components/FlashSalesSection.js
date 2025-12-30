import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ArrowRight, Clock, Flame, Timer, TrendingDown } from "lucide-react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { formatPrice, calculateDiscount } from "../lib/utils";

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
          relative w-16 h-16 md:w-20 md:h-20 
          rounded-2xl overflow-hidden
          ${isVeryUrgent 
            ? 'bg-gradient-to-br from-red-500 to-red-600' 
            : isUrgent 
              ? 'bg-gradient-to-br from-orange-500 to-red-500'
              : 'bg-gradient-to-br from-primary to-primary/80'
          }
          shadow-lg
        `}
        animate={changed ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {/* Glowing effect */}
        <div className="absolute inset-0 bg-white/10 rounded-2xl" />
        
        {/* Number */}
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center text-2xl md:text-3xl font-bold text-white tabular-nums"
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
        
        {/* Shine effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
      </motion.div>
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-2">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex items-center gap-2 md:gap-4">
      <TimeBlock value={timeLeft.days} label="Jours" changed={timeLeft.days !== prevTime.days} />
      <span className="text-2xl font-light text-primary mb-6">:</span>
      <TimeBlock value={timeLeft.hours} label="Heures" changed={timeLeft.hours !== prevTime.hours} />
      <span className="text-2xl font-light text-primary mb-6">:</span>
      <TimeBlock value={timeLeft.minutes} label="Min" changed={timeLeft.minutes !== prevTime.minutes} />
      <span className="text-2xl font-light text-primary mb-6">:</span>
      <TimeBlock value={timeLeft.seconds} label="Sec" changed={timeLeft.seconds !== prevTime.seconds} />
    </div>
  );
}

function FlashProductCard({ product, index }) {
  const discount = calculateDiscount(product.price, product.flash_sale_price || product.price);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ y: -8 }}
      className="relative group"
    >
      {/* Animated glow effect on hover */}
      <motion.div 
        className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-red-500/50 to-orange-500/50 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
      />
      
      {/* Flash Sale Badge - Animated */}
      <motion.div 
        className="absolute top-4 left-4 z-20"
        animate={{ 
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
          <Flame className="w-3.5 h-3.5 animate-pulse" />
          -{discount}%
        </div>
      </motion.div>

      {/* Timer badge */}
      <div className="absolute top-4 right-4 z-20 bg-black/80 text-white px-2 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1">
        <Timer className="w-3 h-3" />
        LIMITÉ
      </div>
      
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-lg">
        <ProductCard 
          product={{
            ...product,
            price: product.flash_sale_price || product.price,
            original_price: product.price,
            is_promo: true
          }} 
          index={0} 
        />
        
        {/* Price comparison bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-16">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-green-400" />
              <span className="text-sm">Économisez</span>
            </div>
            <span className="font-bold text-green-400">
              {formatPrice(product.price - (product.flash_sale_price || product.price))}
            </span>
          </div>
        </div>
      </div>
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
    <section className="py-16 md:py-24 bg-gradient-to-b from-[#F5F5F7] via-white to-[#F5F5F7] dark:from-[#1C1C1E] dark:via-[#0B0B0B] dark:to-[#1C1C1E] overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      <div className="container-lumina relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          {/* Animated badge */}
          <motion.div 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-5 py-2.5 rounded-full text-sm font-bold mb-6 shadow-lg"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(239, 68, 68, 0.3)",
                "0 0 40px rgba(239, 68, 68, 0.5)",
                "0 0 20px rgba(239, 68, 68, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-4 h-4" />
            VENTES FLASH
            <Flame className="w-4 h-4 animate-pulse" />
          </motion.div>
          
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Offres Exclusives
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-muted-foreground text-lg max-w-md mx-auto mb-10"
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
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4 text-red-500 animate-pulse" />
                <span className="text-red-500">Fin de l'offre dans</span>
              </div>
              <AnimatedCountdownTimer endDate={nearestEndDate} />
            </motion.div>
          )}
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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
          className="text-center mt-12"
        >
          <Link
            to="/promotions"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <Zap className="w-5 h-5" />
            Voir toutes les offres
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
