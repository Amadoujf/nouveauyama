import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import {
  Search,
  MapPin,
  Star,
  Phone,
  MessageCircle,
  ChevronRight,
  Filter,
  X,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  Users,
  Wrench,
  Paintbrush,
  Car,
  Scissors,
  Home,
  Laptop,
  Truck,
  PartyPopper,
  GraduationCap,
  Settings,
  Building,
  Droplets,
} from "lucide-react";
import { cn } from "../lib/utils";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Category icons mapping with colors
const CATEGORY_CONFIG = {
  construction: { 
    icon: Building, 
    color: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50",
    size: "md:col-span-2 md:row-span-2"
  },
  electricity_plumbing: { 
    icon: Droplets, 
    color: "from-blue-500 to-cyan-600",
    bgLight: "bg-blue-50",
    size: "md:col-span-1 md:row-span-1"
  },
  auto_mechanics: { 
    icon: Car, 
    color: "from-slate-600 to-zinc-700",
    bgLight: "bg-slate-50",
    size: "md:col-span-1 md:row-span-2"
  },
  beauty_wellness: { 
    icon: Scissors, 
    color: "from-pink-500 to-rose-600",
    bgLight: "bg-pink-50",
    size: "md:col-span-2 md:row-span-1"
  },
  tech_repair: { 
    icon: Laptop, 
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
    size: "md:col-span-1 md:row-span-1"
  },
  cleaning_home: { 
    icon: Home, 
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    size: "md:col-span-1 md:row-span-1"
  },
  transport_delivery: { 
    icon: Truck, 
    color: "from-indigo-500 to-blue-600",
    bgLight: "bg-indigo-50",
    size: "md:col-span-1 md:row-span-1"
  },
  events_entertainment: { 
    icon: PartyPopper, 
    color: "from-fuchsia-500 to-pink-600",
    bgLight: "bg-fuchsia-50",
    size: "md:col-span-2 md:row-span-1"
  },
  education_training: { 
    icon: GraduationCap, 
    color: "from-sky-500 to-blue-600",
    bgLight: "bg-sky-50",
    size: "md:col-span-1 md:row-span-1"
  },
  other_services: { 
    icon: Settings, 
    color: "from-gray-500 to-slate-600",
    bgLight: "bg-gray-50",
    size: "md:col-span-1 md:row-span-1"
  },
};

export default function ServicesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [locations, setLocations] = useState({ cities: [], dakar_zones: [] });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("verified") === "true");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [selectedCity, selectedCategory, verifiedOnly]);

  const fetchData = async () => {
    try {
      const [catRes, locRes] = await Promise.all([
        axios.get(`${API_URL}/api/services/categories`),
        axios.get(`${API_URL}/api/services/locations`),
      ]);
      setCategories(catRes.data);
      setLocations(locRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCity) params.append("city", selectedCity);
      if (selectedCategory) params.append("category", selectedCategory);
      if (verifiedOnly) params.append("verified", "true");
      if (searchQuery) params.append("search", searchQuery);

      const response = await axios.get(`${API_URL}/api/services/providers?${params}`);
      setProviders(response.data.providers || []);
    } catch (error) {
      console.error("Error fetching providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProviders();
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? "" : categoryId);
  };

  const clearFilters = () => {
    setSelectedCity("");
    setSelectedCategory("");
    setVerifiedOnly(false);
    setSearchQuery("");
  };

  const activeFiltersCount = [selectedCity, selectedCategory, verifiedOnly].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-[#F9F9F7] dark:bg-[#020617]">
      <Helmet>
        <title>Services Professionnels - YAMA+ Sénégal</title>
        <meta name="description" content="Trouvez les meilleurs professionnels au Sénégal. Plombiers, électriciens, mécaniciens, coiffeurs et plus. Services vérifiés et de qualité." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]" />
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          {/* Gold accent glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 py-24 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />
              Plus de 1000 professionnels vérifiés
            </motion.div>

            {/* Title */}
            <h1 
              className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Trouvez l'Expert
              <span className="block text-[#D4AF37]">Idéal</span>
            </h1>

            <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Artisans, techniciens et professionnels qualifiés à votre service partout au Sénégal
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
                {/* Profession Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Quel service recherchez-vous ?"
                    className="w-full h-14 pl-12 pr-4 bg-white/10 rounded-xl border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                    data-testid="search-input"
                  />
                </div>

                {/* City Select */}
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="h-14 pl-12 pr-8 bg-white/10 rounded-xl border border-white/10 text-white appearance-none cursor-pointer focus:outline-none focus:border-[#D4AF37]/50 transition-colors min-w-[180px]"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                    data-testid="city-select"
                  >
                    <option value="" className="text-gray-900">Toutes les villes</option>
                    {locations.cities.map((city) => (
                      <option key={city} value={city} className="text-gray-900">{city}</option>
                    ))}
                  </select>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="h-14 px-8 bg-[#D4AF37] hover:bg-[#B5952F] text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                  data-testid="search-btn"
                >
                  <Search className="w-5 h-5" />
                  <span className="hidden sm:inline">Rechercher</span>
                </button>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              {[
                { icon: Shield, label: "Vérifiés", value: "100%" },
                { icon: Users, label: "Clients satisfaits", value: "5000+" },
                { icon: Zap, label: "Réponse rapide", value: "< 2h" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3 text-white/80"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-white/60">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 
              className="text-4xl md:text-5xl font-bold text-[#0F172A] dark:text-white mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Explorez nos Catégories
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Des experts qualifiés dans chaque domaine pour répondre à tous vos besoins
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[140px] md:auto-rows-[160px]">
            {categories.map((cat, index) => {
              const config = CATEGORY_CONFIG[cat.category_id] || CATEGORY_CONFIG.other_services;
              const Icon = config.icon;
              const isSelected = selectedCategory === cat.category_id;

              return (
                <motion.button
                  key={cat.category_id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleCategoryClick(cat.category_id)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl md:rounded-3xl transition-all duration-500",
                    config.size,
                    isSelected 
                      ? "ring-4 ring-[#D4AF37] ring-offset-2 dark:ring-offset-[#020617]" 
                      : "hover:scale-[1.02]"
                  )}
                  data-testid={`category-${cat.category_id}`}
                >
                  {/* Background gradient */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-90 group-hover:opacity-100 transition-opacity",
                    config.color
                  )} />
                  
                  {/* Pattern overlay */}
                  <div 
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                      backgroundSize: '20px 20px',
                    }}
                  />

                  {/* Content */}
                  <div className="relative h-full p-5 md:p-6 flex flex-col justify-between">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    
                    <div className="text-left">
                      <h3 className="text-lg md:text-xl font-bold text-white mb-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                        {cat.name_fr}
                      </h3>
                      {cat.subcategories && (
                        <p className="text-white/70 text-sm hidden md:block">
                          {cat.subcategories.slice(0, 3).join(" • ")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Hover shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Providers Section */}
      <section className="py-24 px-6 md:px-12 bg-white dark:bg-[#0F172A]">
        <div className="max-w-[1400px] mx-auto">
          {/* Header with filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h2 
                className="text-4xl md:text-5xl font-bold text-[#0F172A] dark:text-white mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {selectedCategory 
                  ? categories.find(c => c.category_id === selectedCategory)?.name_fr || "Prestataires"
                  : "Nos Meilleurs Experts"
                }
              </h2>
              <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {providers.length} professionnel{providers.length > 1 ? "s" : ""} disponible{providers.length > 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex gap-3">
              {/* Verified filter */}
              <button
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all",
                  verifiedOnly 
                    ? "bg-[#D4AF37] text-white" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
                style={{ fontFamily: "'Manrope', sans-serif" }}
                data-testid="verified-filter"
              >
                <CheckCircle className="w-5 h-5" />
                Vérifiés uniquement
              </button>

              {/* Clear filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                  data-testid="clear-filters"
                >
                  <X className="w-5 h-5" />
                  Effacer ({activeFiltersCount})
                </button>
              )}
            </div>
          </div>

          {/* Providers Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[400px] rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : providers.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Aucun prestataire trouvé
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8" style={{ fontFamily: "'Manrope', sans-serif" }}>
                Essayez de modifier vos critères de recherche
              </p>
              <Link
                to="/services/request"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#D4AF37] text-white font-semibold rounded-full hover:bg-[#B5952F] transition-all"
                data-testid="request-service-btn"
              >
                Demander un service
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {providers.map((provider, index) => (
                  <ProviderCard key={provider.provider_id} provider={provider} index={index} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-12 md:p-20"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#D4AF37]/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 
                className="text-4xl md:text-5xl font-bold text-white mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Vous n'avez pas trouvé ?
              </h2>
              <p className="text-xl text-white/70 mb-10" style={{ fontFamily: "'Manrope', sans-serif" }}>
                Décrivez votre besoin et nous trouverons le professionnel idéal pour vous
              </p>
              <Link
                to="/services/request"
                className="inline-flex items-center gap-3 px-10 py-5 bg-[#D4AF37] hover:bg-[#B5952F] text-white text-lg font-semibold rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-[#D4AF37]/20 hover:scale-105"
                style={{ fontFamily: "'Manrope', sans-serif" }}
                data-testid="cta-request-btn"
              >
                Demander un service
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

// Provider Card Component
function ProviderCard({ provider, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-3xl bg-white dark:bg-[#1E293B] border border-black/5 dark:border-white/5 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
          {provider.photos?.[0] ? (
            <img
              src={provider.photos[0]}
              alt={provider.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              👷
            </div>
          )}
        </div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {provider.is_verified && (
            <span className="flex items-center gap-1 px-3 py-1.5 bg-[#D4AF37] text-white text-xs font-semibold rounded-full">
              <CheckCircle className="w-3 h-3" />
              Vérifié
            </span>
          )}
          {provider.is_premium && (
            <span className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white text-xs font-semibold rounded-full">
              <Sparkles className="w-3 h-3" />
              Premium
            </span>
          )}
        </div>

        {/* Availability */}
        <div className="absolute top-4 right-4">
          <span className={cn(
            "flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full",
            provider.availability === "available" 
              ? "bg-green-500 text-white" 
              : provider.availability === "busy"
              ? "bg-yellow-500 text-white"
              : "bg-gray-500 text-white"
          )}>
            <Clock className="w-3 h-3" />
            {provider.availability === "available" ? "Disponible" : 
             provider.availability === "busy" ? "Occupé" : "Indisponible"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
              {provider.name}
            </h3>
            <p className="text-[#D4AF37] font-medium">{provider.profession}</p>
          </div>
          {provider.rating > 0 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-[#D4AF37]/10 rounded-full">
              <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
              <span className="font-bold text-[#D4AF37]">{provider.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{provider.city}{provider.zone ? `, ${provider.zone}` : ""}</span>
        </div>

        {provider.price_from && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            À partir de <span className="text-lg font-bold text-gray-900 dark:text-white">{provider.price_from.toLocaleString()} FCFA</span>
            {provider.price_description && <span className="text-sm"> / {provider.price_description}</span>}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Link
            to={`/provider/${provider.provider_id}`}
            className="flex-1 py-3 text-center font-semibold text-[#0F172A] dark:text-white bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            style={{ fontFamily: "'Manrope', sans-serif" }}
            data-testid={`view-provider-${provider.provider_id}`}
          >
            Voir le profil
          </Link>
          <a
            href={`https://wa.me/${provider.whatsapp?.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 flex items-center justify-center bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
            data-testid={`whatsapp-${provider.provider_id}`}
          >
            <MessageCircle className="w-5 h-5" />
          </a>
          <a
            href={`tel:${provider.phone}`}
            className="w-12 h-12 flex items-center justify-center bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] rounded-xl hover:opacity-90 transition-opacity"
            data-testid={`phone-${provider.provider_id}`}
          >
            <Phone className="w-5 h-5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
