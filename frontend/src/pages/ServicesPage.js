import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import {
  Search,
  MapPin,
  Star,
  Phone,
  MessageCircle,
  Filter,
  ChevronRight,
  BadgeCheck,
  Crown,
  Briefcase,
  Clock,
  Users,
} from "lucide-react";
import { cn } from "../lib/utils";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Category icons mapping
const categoryIcons = {
  construction: "🏠",
  electricity_plumbing: "⚡",
  auto: "🚗",
  beauty: "💅",
  tech: "💻",
  cleaning: "🧹",
  transport: "🚚",
  events: "🎉",
  education: "📚",
  other: "🔧",
};

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [locations, setLocations] = useState({ cities: [], dakar_zones: [] });
  const [loading, setLoading] = useState(true);
  const [totalProviders, setTotalProviders] = useState(0);
  
  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "");
  const [selectedZone, setSelectedZone] = useState(searchParams.get("zone") || "");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchLocations();
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [selectedCategory, selectedCity, selectedZone, verifiedOnly, search]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/services/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/services/locations`);
      setLocations(response.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedCity) params.append("city", selectedCity);
      if (selectedZone) params.append("zone", selectedZone);
      if (verifiedOnly) params.append("verified_only", "true");
      if (search) params.append("search", search);
      params.append("limit", "20");

      const response = await axios.get(`${API_URL}/api/services/providers?${params}`);
      setProviders(response.data.providers || []);
      setTotalProviders(response.data.total || 0);
    } catch (error) {
      console.error("Error fetching providers:", error);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProviders();
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedCity("");
    setSelectedZone("");
    setVerifiedOnly(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A]">
      <Helmet>
        <title>Services & Prestataires - GROUPE YAMA+</title>
        <meta name="description" content="Trouvez des professionnels qualifiés au Sénégal : plombiers, électriciens, peintres, menuisiers et plus encore." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-gray-900 to-black text-white py-16 lg:py-24">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920')] opacity-10 bg-cover bg-center" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
            >
              Trouvez le bon professionnel
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-300 mb-8"
            >
              Des milliers de prestataires qualifiés au Sénégal
            </motion.p>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un métier, prestataire..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  data-testid="service-search-input"
                />
              </div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-4 rounded-xl bg-white text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Toutes les villes</option>
                {locations.cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <button
                type="submit"
                className="px-8 py-4 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-300 transition-colors"
                data-testid="service-search-btn"
              >
                Rechercher
              </button>
            </motion.form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-semibold mb-6">Catégories de services</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.category_id}
                onClick={() => setSelectedCategory(selectedCategory === cat.category_id ? "" : cat.category_id)}
                className={cn(
                  "flex flex-col items-center p-4 rounded-xl transition-all",
                  selectedCategory === cat.category_id
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
                data-testid={`category-${cat.category_id}`}
              >
                <span className="text-2xl mb-2">{cat.icon}</span>
                <span className="text-xs font-medium text-center leading-tight">{cat.name_fr}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sticky top-24">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtres
                </h3>

                {/* City Filter */}
                <div className="mb-4">
                  <label className="text-sm text-muted-foreground mb-2 block">Ville</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setSelectedZone("");
                    }}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Toutes</option>
                    {locations.cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Zone Filter (Dakar only) */}
                {selectedCity === "Dakar" && (
                  <div className="mb-4">
                    <label className="text-sm text-muted-foreground mb-2 block">Quartier</label>
                    <select
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">Tous</option>
                      {locations.dakar_zones.map((zone) => (
                        <option key={zone} value={zone}>{zone}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Verified Only */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Vérifiés uniquement</span>
                    <BadgeCheck className="w-4 h-4 text-blue-500" />
                  </label>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={clearFilters}
                  className="w-full py-2 text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </aside>

            {/* Providers List */}
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    {selectedCategory
                      ? categories.find((c) => c.category_id === selectedCategory)?.name_fr
                      : "Tous les prestataires"}
                  </h2>
                  <p className="text-sm text-muted-foreground">{totalProviders} prestataires trouvés</p>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg"
                >
                  <Filter className="w-4 h-4" />
                  Filtres
                </button>
              </div>

              {/* Mobile Filters */}
              {showFilters && (
                <div className="lg:hidden bg-white dark:bg-gray-800 rounded-xl p-4 mb-6">
                  {/* Same filters as desktop */}
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="p-2 border rounded-lg"
                    >
                      <option value="">Toutes les villes</option>
                      {locations.cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={verifiedOnly}
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                      />
                      <span className="text-sm">Vérifiés</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Providers Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : providers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {providers.map((provider) => (
                    <ProviderCard key={provider.provider_id} provider={provider} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
                  <Briefcase className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Aucun prestataire trouvé</h3>
                  <p className="text-muted-foreground mb-6">
                    Essayez de modifier vos critères de recherche
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}

              {/* CTA - Request Service */}
              <div className="mt-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold text-black mb-3">
                  Vous n'avez pas trouvé ce que vous cherchez ?
                </h3>
                <p className="text-black/80 mb-6">
                  Publiez votre demande et recevez des propositions de professionnels
                </p>
                <Link
                  to="/services/request"
                  className="inline-block px-8 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-900 transition-colors"
                  data-testid="request-service-btn"
                >
                  Demander un service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Provider Card Component
function ProviderCard({ provider }) {
  const whatsappLink = `https://wa.me/${provider.whatsapp?.replace(/[^0-9]/g, "") || provider.phone?.replace(/[^0-9]/g, "")}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 hover:shadow-lg transition-shadow"
    >
      <div className="flex gap-4">
        {/* Photo */}
        <div className="relative">
          <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden">
            {provider.photos?.[0] ? (
              <img
                src={provider.photos[0]}
                alt={provider.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                {categoryIcons[provider.category] || "👷"}
              </div>
            )}
          </div>
          {provider.is_premium && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Crown className="w-3 h-3 text-black" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold flex items-center gap-1">
                {provider.name}
                {provider.is_verified && (
                  <BadgeCheck className="w-4 h-4 text-blue-500" />
                )}
              </h3>
              <p className="text-sm text-muted-foreground">{provider.profession}</p>
            </div>
            {provider.rating > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-semibold">{provider.rating}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{provider.city}{provider.zone ? `, ${provider.zone}` : ""}</span>
          </div>

          {provider.price_from && (
            <p className="text-sm font-medium mt-1">
              À partir de {provider.price_from.toLocaleString()} FCFA
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <Link
          to={`/provider/${provider.provider_id}`}
          className="flex-1 py-2 text-center text-sm font-medium bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Voir le profil
        </Link>
        <a
          href={`tel:${provider.phone}`}
          className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Phone className="w-5 h-5" />
        </a>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
        </a>
      </div>
    </motion.div>
  );
}
