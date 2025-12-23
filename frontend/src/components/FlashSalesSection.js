import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Clock } from "lucide-react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { formatPrice } from "../lib/utils";

const API_URL = process.env.REACT_APP_BACKEND_URL;

function CountdownTimer({ endDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

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
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (timeLeft.expired) return null;

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 6;

  return (
    <div className="flex items-center gap-3">
      {[
        { value: timeLeft.days, label: 'J' },
        { value: timeLeft.hours, label: 'H' },
        { value: timeLeft.minutes, label: 'M' },
        { value: timeLeft.seconds, label: 'S' },
      ].map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="text-center">
            <div className={`
              w-14 h-14 md:w-16 md:h-16 
              bg-white dark:bg-[#1C1C1E] 
              rounded-xl 
              flex items-center justify-center
              shadow-sm
              ${isUrgent ? 'text-red-500' : 'text-black dark:text-white'}
            `}>
              <span className={`text-xl md:text-2xl font-bold tabular-nums ${isUrgent ? 'animate-pulse' : ''}`}>
                {String(item.value).padStart(2, '0')}
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 block">
              {item.label}
            </span>
          </div>
          {index < 3 && (
            <span className="text-xl font-light text-muted-foreground mb-4">:</span>
          )}
        </div>
      ))}
    </div>
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
        
        // Get the nearest end date for the main countdown
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
    <section className="py-16 md:py-20 bg-[#F5F5F7] dark:bg-[#1C1C1E]">
      <div className="container-lumina">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Offres limitées
          </div>
          
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Ventes Flash
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
            Des prix exceptionnels pour une durée limitée
          </p>
          
          {/* Countdown */}
          {nearestEndDate && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Se termine dans</span>
              </div>
              <CountdownTimer endDate={nearestEndDate} />
            </div>
          )}
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashProducts.slice(0, 4).map((product, index) => (
            <motion.div
              key={product.product_id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Flash Sale Badge */}
              <div className="absolute top-4 left-4 z-10 bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                <Zap className="w-3.5 h-3.5" />
                FLASH
              </div>
              
              <ProductCard 
                product={{
                  ...product,
                  price: product.flash_sale_price || product.price,
                  original_price: product.price,
                  is_promo: true
                }} 
                index={index} 
              />
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link
            to="/promotions"
            className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all"
          >
            Voir toutes les offres
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
