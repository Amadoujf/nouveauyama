import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import {
  MapPin,
  Star,
  Phone,
  MessageCircle,
  BadgeCheck,
  Crown,
  Clock,
  Briefcase,
  ChevronLeft,
  Share2,
  Calendar,
  Image as ImageIcon,
  User,
  X,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Send,
  Heart,
  Award,
  Zap,
  MessageSquare,
  ArrowRight,
  Play,
  Sparkles,
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Social media icons mapping
const socialIcons = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  twitter: Twitter,
  youtube: Youtube,
  tiktok: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
    </svg>
  ),
  snapchat: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301a.42.42 0 01.45.045c.12.087.165.24.135.39-.12.53-.465.885-.855 1.065a2.03 2.03 0 01-.664.18l-.004.001c-.036.006-.06.01-.083.016a.226.226 0 00-.168.136c-.082.2-.11.509-.11.695 0 .18.04.36.097.54.36.96 1.23 1.785 2.22 2.19.12.045.24.12.3.225.075.12.075.27.015.39-.18.36-.63.51-1.17.585-.27.045-.54.06-.77.09-.21.03-.375.06-.495.135a.7.7 0 00-.285.33c-.12.24-.3.54-.615.825-.63.57-1.53.84-2.355.84-.6 0-1.095-.12-1.44-.225a2.61 2.61 0 01-.345-.12c-.27-.105-.57-.225-.96-.225a2.9 2.9 0 00-.945.21c-.09.03-.18.075-.285.12-.375.135-.87.315-1.53.315-.84 0-1.74-.285-2.355-.84a2.82 2.82 0 01-.615-.825.7.7 0 00-.285-.33c-.12-.075-.285-.105-.495-.135-.23-.03-.5-.045-.77-.09-.54-.075-.99-.225-1.17-.585a.382.382 0 01.015-.39c.06-.105.18-.18.3-.225.99-.405 1.86-1.23 2.22-2.19.057-.18.097-.36.097-.54 0-.186-.028-.495-.11-.695a.226.226 0 00-.168-.136c-.023-.006-.047-.01-.083-.016l-.004-.001a2.03 2.03 0 01-.664-.18c-.39-.18-.735-.535-.855-1.065a.388.388 0 01.135-.39.42.42 0 01.45-.045c.374.18.733.285 1.032.301.199 0 .327-.045.402-.09a9.6 9.6 0 01-.033-.57c-.104-1.628-.23-3.654.299-4.847C7.86 1.069 11.216.793 12.206.793z"/>
    </svg>
  ),
  whatsapp: MessageCircle,
  website: Globe,
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function ProviderProfilePage() {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
    client_name: "",
    client_phone: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const galleryRef = useRef(null);

  useEffect(() => {
    fetchProvider();
  }, [providerId]);

  const fetchProvider = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/services/providers/${providerId}`);
      setProvider(response.data);
    } catch (error) {
      console.error("Error fetching provider:", error);
      toast.error("Prestataire non trouvé");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim() || !reviewForm.client_name.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setSubmittingReview(true);
    try {
      await axios.post(
        `${API_URL}/api/services/providers/${providerId}/reviews`,
        null,
        { params: reviewForm }
      );
      toast.success("Avis envoyé avec succès !");
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: "", client_name: "", client_phone: "" });
      fetchProvider();
    } catch (error) {
      toast.error("Erreur lors de l'envoi de l'avis");
    } finally {
      setSubmittingReview(false);
    }
  };

  const profileUrl = window.location.href;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success("Lien copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (platform) => {
    const text = `Découvrez ${provider.name}, ${provider.profession} sur YAMA+ Services`;
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + profileUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(text)}`,
    };
    
    if (platform === "native" && navigator.share) {
      try {
        await navigator.share({ title: provider.name, text, url: profileUrl });
      } catch (e) {
        console.log("Share cancelled");
      }
    } else if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white/60">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-6">😕</motion.div>
        <h1 className="text-2xl font-bold mb-4">Prestataire non trouvé</h1>
        <Link to="/services" className="px-6 py-3 bg-yellow-400 text-black font-medium rounded-full hover:bg-yellow-300 transition-colors">
          Retour aux services
        </Link>
      </div>
    );
  }

  const whatsappLink = `https://wa.me/${provider.whatsapp?.replace(/[^0-9]/g, "") || provider.phone?.replace(/[^0-9]/g, "")}?text=Bonjour ${provider.name}, je vous contacte via YAMA+ Services...`;
  
  // Parse social links from provider data
  const socialLinks = provider.social_links || {};
  const gallery = provider.gallery || provider.photos?.map((url, i) => ({ photo_id: i, image_url: url })) || [];

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      <Helmet>
        <title>{provider.name} - {provider.profession} | YAMA+ Services</title>
        <meta name="description" content={`${provider.name}, ${provider.profession} à ${provider.city}. ${provider.description?.substring(0, 150)}`} />
        <meta property="og:title" content={`${provider.name} - ${provider.profession}`} />
        <meta property="og:description" content={provider.description?.substring(0, 150)} />
        <meta property="og:image" content={provider.photos?.[0] || ""} />
        <meta property="og:url" content={profileUrl} />
      </Helmet>

      {/* Hero Section - Full Width Visual */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          {provider.photos?.[0] ? (
            <img
              src={provider.photos[0]}
              alt={provider.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-yellow-400/20 via-black to-black" />
          )}
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/80 to-transparent" />
        </motion.div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400/30 rounded-full"
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%",
                opacity: 0 
              }}
              animate={{ 
                y: [null, "-20%"],
                opacity: [0, 0.8, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Link
                to="/services"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Services</span>
              </Link>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Partager</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="container mx-auto px-4 pb-8">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="max-w-4xl"
            >
              {/* Badges */}
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-2 mb-4">
                {provider.is_verified && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 text-blue-400 text-sm font-medium rounded-full">
                    <BadgeCheck className="w-4 h-4" />
                    Vérifié YAMA+
                  </span>
                )}
                {provider.is_premium && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/20 backdrop-blur-sm border border-yellow-400/30 text-yellow-400 text-sm font-medium rounded-full">
                    <Crown className="w-4 h-4" />
                    Premium
                  </span>
                )}
                {provider.experience_years && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white/80 text-sm font-medium rounded-full">
                    <Award className="w-4 h-4" />
                    {provider.experience_years} ans d'expérience
                  </span>
                )}
              </motion.div>

              {/* Name & Profession */}
              <motion.h1 
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 tracking-tight"
              >
                {provider.name}
              </motion.h1>
              <motion.p 
                variants={fadeInUp}
                className="text-xl sm:text-2xl text-yellow-400 font-medium mb-4"
              >
                {provider.profession}
              </motion.p>

              {/* Location & Rating */}
              <motion.div 
                variants={fadeInUp}
                className="flex flex-wrap items-center gap-4 text-white/70"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-yellow-400" />
                  {provider.city}{provider.zone ? `, ${provider.zone}` : ""}
                </span>
                {provider.review_count > 0 && (
                  <span className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-semibold">{provider.rating}</span>
                    <span>({provider.review_count} avis)</span>
                  </span>
                )}
                {provider.price_from && (
                  <span className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    À partir de <span className="text-white font-semibold">{provider.price_from.toLocaleString()} FCFA</span>
                  </span>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sticky CTA Bar */}
      <div className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Mini Profile */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800">
                {provider.photos?.[0] ? (
                  <img src={provider.photos[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">👷</div>
                )}
              </div>
              <div className="hidden sm:block">
                <p className="font-semibold text-sm">{provider.name}</p>
                <p className="text-xs text-white/60">{provider.profession}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <a
                href={`tel:${provider.phone}`}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black font-medium rounded-full hover:bg-gray-100 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">Appeler</span>
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-medium rounded-full hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { id: "about", label: "À propos", icon: User },
                { id: "gallery", label: "Galerie", icon: ImageIcon },
                { id: "reviews", label: "Avis", icon: Star },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-all",
                    activeTab === tab.id
                      ? "bg-yellow-400 text-black"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === "about" && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Description */}
                  {provider.description && (
                    <div className="bg-white/5 rounded-3xl p-6 sm:p-8">
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        Présentation
                      </h2>
                      <p className="text-white/80 leading-relaxed text-lg whitespace-pre-line">
                        {provider.description}
                      </p>
                    </div>
                  )}

                  {/* Services */}
                  {provider.services?.length > 0 && (
                    <div className="bg-white/5 rounded-3xl p-6 sm:p-8">
                      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-yellow-400" />
                        Services proposés
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {provider.services.map((service, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                          >
                            <div className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center">
                              <Check className="w-5 h-5 text-yellow-400" />
                            </div>
                            <span className="font-medium">{service}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Années d'expérience", value: provider.experience_years || "N/A", icon: Award },
                      { label: "Projets réalisés", value: provider.projects_count || "50+", icon: Briefcase },
                      { label: "Clients satisfaits", value: provider.review_count || "0", icon: Heart },
                      { label: "Note moyenne", value: provider.rating || "N/A", icon: Star },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-5 text-center"
                      >
                        <stat.icon className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-white/60">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "gallery" && (
                <motion.div
                  key="gallery"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-yellow-400" />
                      Galerie Photos
                    </h2>
                    <span className="text-white/60">{gallery.length} photos</span>
                  </div>

                  {gallery.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {gallery.map((photo, i) => (
                        <motion.button
                          key={photo.photo_id || i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => setSelectedImage(photo.image_url || photo)}
                          className="aspect-square rounded-2xl overflow-hidden bg-white/5 hover:ring-2 hover:ring-yellow-400 transition-all group relative"
                        >
                          <img
                            src={photo.image_url || photo}
                            alt={photo.caption || `Photo ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white/5 rounded-3xl">
                      <ImageIcon className="w-16 h-16 mx-auto text-white/20 mb-4" />
                      <p className="text-white/60">Pas encore de photos dans la galerie</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "reviews" && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      Avis clients
                    </h2>
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="px-4 py-2 bg-yellow-400 text-black font-medium rounded-full hover:bg-yellow-300 transition-colors"
                    >
                      Laisser un avis
                    </button>
                  </div>

                  {provider.reviews?.length > 0 ? (
                    <div className="space-y-4">
                      {provider.reviews.map((review, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-white/5 rounded-2xl p-5"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-lg">
                              {review.client_name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">{review.client_name}</h4>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, j) => (
                                    <Star
                                      key={j}
                                      className={cn(
                                        "w-4 h-4",
                                        j < review.rating
                                          ? "text-yellow-400 fill-yellow-400"
                                          : "text-white/20"
                                      )}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-white/80">{review.comment}</p>
                              <p className="text-xs text-white/40 mt-2">{review.created_at}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white/5 rounded-3xl">
                      <MessageSquare className="w-16 h-16 mx-auto text-white/20 mb-4" />
                      <p className="text-white/60 mb-4">Pas encore d'avis</p>
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="px-6 py-3 bg-yellow-400 text-black font-medium rounded-full hover:bg-yellow-300 transition-colors"
                      >
                        Soyez le premier à donner votre avis
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Contact Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Contact Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-6 border border-white/10"
              >
                <h3 className="text-lg font-bold mb-6">Contacter {provider.name}</h3>
                
                <div className="space-y-4">
                  <a
                    href={`tel:${provider.phone}`}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <p className="text-white/60 text-sm">{provider.phone}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>

                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-green-500/20 rounded-2xl hover:bg-green-500/30 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-500/30 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-green-400">WhatsApp</p>
                      <p className="text-white/60 text-sm">Envoyez un message</p>
                    </div>
                    <ArrowRight className="w-5 h-5 ml-auto text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>

                  {provider.email && (
                    <a
                      href={`mailto:${provider.email}`}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-white/60 text-sm truncate">{provider.email}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                </div>

                {/* Social Links */}
                {Object.keys(socialLinks).length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-sm text-white/60 mb-4">Réseaux sociaux</p>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(socialLinks).map(([platform, url]) => {
                        if (!url) return null;
                        const IconComponent = socialIcons[platform] || Globe;
                        return (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all"
                            title={platform}
                          >
                            {typeof IconComponent === "function" ? <IconComponent /> : <IconComponent className="w-5 h-5" />}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Share Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-yellow-400/20 to-orange-500/10 rounded-3xl p-6 border border-yellow-400/20"
              >
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-yellow-400" />
                  Partager ce profil
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  Partagez le profil de {provider.name} avec vos proches
                </p>
                
                <div className="flex gap-2 mb-4">
                  {[
                    { platform: "whatsapp", color: "bg-green-500", icon: MessageCircle },
                    { platform: "facebook", color: "bg-blue-600", icon: Facebook },
                    { platform: "twitter", color: "bg-sky-500", icon: Twitter },
                    { platform: "linkedin", color: "bg-blue-700", icon: Linkedin },
                  ].map(({ platform, color, icon: Icon }) => (
                    <button
                      key={platform}
                      onClick={() => handleShare(platform)}
                      className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform", color)}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  <span className="text-sm">{copied ? "Lien copié !" : "Copier le lien"}</span>
                </button>
              </motion.div>

              {/* Location */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 rounded-3xl p-6"
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-yellow-400" />
                  Localisation
                </h3>
                <p className="text-white/80">{provider.city}</p>
                {provider.zone && <p className="text-white/60">{provider.zone}</p>}
                {provider.address && <p className="text-white/60 mt-2">{provider.address}</p>}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              alt=""
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Form Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowReviewForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1A1A1A] rounded-3xl w-full max-w-md p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Laisser un avis</h3>
                <button onClick={() => setShowReviewForm(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium mb-2">Note</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="p-1"
                      >
                        <Star
                          className={cn(
                            "w-8 h-8 transition-colors",
                            star <= reviewForm.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-white/20"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Votre nom *</label>
                  <input
                    type="text"
                    required
                    value={reviewForm.client_name}
                    onChange={(e) => setReviewForm({ ...reviewForm, client_name: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:border-yellow-400 focus:outline-none transition-colors"
                    placeholder="Jean Dupont"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-2">Téléphone (optionnel)</label>
                  <input
                    type="tel"
                    value={reviewForm.client_phone}
                    onChange={(e) => setReviewForm({ ...reviewForm, client_phone: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:border-yellow-400 focus:outline-none transition-colors"
                    placeholder="77 123 45 67"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium mb-2">Votre avis *</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:border-yellow-400 focus:outline-none transition-colors resize-none"
                    placeholder="Partagez votre expérience..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50"
                >
                  {submittingReview ? "Envoi..." : "Envoyer mon avis"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1A1A1A] rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Partager le profil</h3>
                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Share Options */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { platform: "whatsapp", label: "WhatsApp", color: "bg-green-500", icon: MessageCircle },
                  { platform: "facebook", label: "Facebook", color: "bg-blue-600", icon: Facebook },
                  { platform: "twitter", label: "Twitter", color: "bg-sky-500", icon: Twitter },
                  { platform: "linkedin", label: "LinkedIn", color: "bg-blue-700", icon: Linkedin },
                ].map(({ platform, label, color, icon: Icon }) => (
                  <button
                    key={platform}
                    onClick={() => handleShare(platform)}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className={cn("w-14 h-14 rounded-full flex items-center justify-center text-white", color)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-white/60">{label}</span>
                  </button>
                ))}
              </div>

              {/* Copy Link */}
              <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                <div className="flex-1 truncate text-sm text-white/60">{profileUrl}</div>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black font-medium rounded-lg hover:bg-yellow-300 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copié" : "Copier"}
                </button>
              </div>

              {/* Native Share (Mobile) */}
              {navigator.share && (
                <button
                  onClick={() => handleShare("native")}
                  className="w-full mt-4 py-3 border border-white/20 rounded-xl text-white/80 hover:bg-white/5 transition-colors"
                >
                  Plus d'options de partage...
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
