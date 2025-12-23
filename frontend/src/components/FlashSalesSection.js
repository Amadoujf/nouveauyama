import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
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
    <div className={`flex items-center gap-2 ${isUrgent ? 'text-red-500' : 'text-white'}`}>
      <div className="text-center">
        <div className={`text-2xl md:text-3xl font-bold ${isUrgent ? 'animate-pulse' : ''}`}>
          {String(timeLeft.days).padStart(2, '0')}
        </div>
        <div className="text-xs uppercase opacity-70">Jours</div>
      </div>
      <span className="text-2xl font-bold">:</span>
      <div className="text-center">
        <div className={`text-2xl md:text-3xl font-bold ${isUrgent ? 'animate-pulse' : ''}`}>
          {String(timeLeft.hours).padStart(2, '0')}
        </div>
        <div className="text-xs uppercase opacity-70">Heures</div>
      </div>
      <span className="text-2xl font-bold">:</span>
      <div className="text-center">
        <div className={`text-2xl md:text-3xl font-bold ${isUrgent ? 'animate-pulse' : ''}`}>
          {String(timeLeft.minutes).padStart(2, '0')}
        </div>
        <div className="text-xs uppercase opacity-70">Min</div>
      </div>
      <span className="text-2xl font-bold">:</span>
      <div className="text-center">
        <div className={`text-2xl md:text-3xl font-bold ${isUrgent ? 'animate-pulse' : ''}`}>
          {String(timeLeft.seconds).padStart(2, '0')}
        </div>
        <div className="text-xs uppercase opacity-70">Sec</div>
      </div>
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
    <section className="py-12 md:py-16 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500">
      <div className="container-lumina">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center">
              <Zap className="w-8 h-8 text-red-600 fill-current" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                Ventes Flash
                <span className="animate-pulse">⚡</span>
              </h2>
              <p className="text-white/80">Offres limitées - Faites vite !</p>
            </div>
          </div>
          
          {nearestEndDate && (
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl px-6 py-3">
              <p className="text-white/70 text-xs mb-1 text-center">Se termine dans</p>
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
              <div className="absolute top-4 left-4 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                <Zap className="w-4 h-4 fill-current" />
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
          className="text-center mt-8"
        >
          <Link
            to="/promotions"
            className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-white/90 transition-colors"
          >
            Voir toutes les offres
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
