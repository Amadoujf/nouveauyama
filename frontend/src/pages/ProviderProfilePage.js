import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ProviderProfilePage() {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
    client_name: "",
    client_phone: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);

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

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${provider.name} - ${provider.profession}`,
          text: `Découvrez ${provider.name}, ${provider.profession} sur YAMA+ Services`,
          url,
        });
      } catch (e) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Lien copié !");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Prestataire non trouvé</h1>
        <Link to="/services" className="text-blue-500 hover:underline">
          Retour aux services
        </Link>
      </div>
    );
  }

  const whatsappLink = `https://wa.me/${provider.whatsapp?.replace(/[^0-9]/g, "") || provider.phone?.replace(/[^0-9]/g, "")}?text=Bonjour ${provider.name}, je vous contacte via YAMA+ Services...`;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] pb-24">
      <Helmet>
        <title>{provider.name} - {provider.profession} | YAMA+ Services</title>
        <meta name="description" content={`${provider.name}, ${provider.profession} à ${provider.city}. ${provider.description?.substring(0, 150)}`} />
      </Helmet>

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour aux services
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm"
          >
            {/* Cover / Photos */}
            {provider.photos?.length > 0 && (
              <div className="h-48 bg-gradient-to-r from-gray-800 to-gray-900 relative overflow-hidden">
                <img
                  src={provider.photos[0]}
                  alt="Cover"
                  className="w-full h-full object-cover opacity-50"
                />
              </div>
            )}

            {/* Main Info */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Avatar */}
                <div className="relative mx-auto sm:mx-0">
                  <div className={cn(
                    "w-28 h-28 rounded-2xl overflow-hidden border-4 border-white dark:border-gray-800",
                    provider.photos?.length > 0 ? "-mt-20" : ""
                  )}>
                    {provider.photos?.[0] ? (
                      <img
                        src={provider.photos[0]}
                        alt={provider.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-4xl">
                        👷
                      </div>
                    )}
                  </div>
                  {provider.is_premium && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                      <Crown className="w-4 h-4 text-black" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold flex items-center justify-center sm:justify-start gap-2">
                      {provider.name}
                      {provider.is_verified && (
                        <BadgeCheck className="w-6 h-6 text-blue-500" />
                      )}
                    </h1>
                    {provider.is_verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-xs font-medium rounded-full">
                        <BadgeCheck className="w-3 h-3" />
                        Vérifié YAMA+
                      </span>
                    )}
                  </div>

                  <p className="text-lg text-muted-foreground mb-3">{provider.profession}</p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {provider.city}{provider.zone ? `, ${provider.zone}` : ""}
                    </span>
                    {provider.experience_years && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {provider.experience_years} ans d'exp.
                      </span>
                    )}
                    {provider.review_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {provider.rating} ({provider.review_count} avis)
                      </span>
                    )}
                  </div>

                  {provider.price_from && (
                    <p className="mt-3 text-lg font-semibold">
                      À partir de {provider.price_from.toLocaleString()} FCFA
                      {provider.price_description && (
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          ({provider.price_description})
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <a
                    href={`tel:${provider.phone}`}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <Phone className="w-5 h-5" />
                    Appeler
                  </a>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </a>
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    Partager
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 mt-6"
          >
            <h2 className="font-semibold mb-4">À propos</h2>
            <p className="text-muted-foreground whitespace-pre-line">
              {provider.description || "Aucune description fournie."}
            </p>

            {/* Availability */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Disponibilité :</span>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  provider.availability === "available"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : provider.availability === "busy"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                )}>
                  {provider.availability === "available" ? "Disponible" :
                   provider.availability === "busy" ? "Occupé" : "Non disponible"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Photo Gallery */}
          {provider.photos?.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 mt-6"
            >
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Réalisations ({provider.photos.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {provider.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(photo)}
                    className="aspect-square rounded-xl overflow-hidden hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={photo}
                      alt={`Réalisation ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 mt-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold flex items-center gap-2">
                <Star className="w-5 h-5" />
                Avis ({provider.review_count || 0})
              </h2>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-sm font-medium text-blue-500 hover:text-blue-600"
              >
                Laisser un avis
              </button>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Note</label>
                  <div className="flex gap-1">
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
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Votre nom *</label>
                  <input
                    type="text"
                    value={reviewForm.client_name}
                    onChange={(e) => setReviewForm({ ...reviewForm, client_name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Votre avis *</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {submittingReview ? "Envoi..." : "Envoyer l'avis"}
                </button>
              </form>
            )}

            {/* Reviews List */}
            {provider.reviews?.length > 0 ? (
              <div className="space-y-4">
                {provider.reviews.map((review) => (
                  <div key={review.review_id} className="pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.client_name}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "w-3 h-3",
                                  i < review.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(review.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Aucun avis pour le moment
              </p>
            )}
          </motion.div>

          {/* Request Service CTA */}
          <div className="mt-6 bg-gradient-to-r from-black to-gray-800 text-white rounded-2xl p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Besoin de ce service ?</h3>
            <p className="text-gray-300 mb-4">
              Décrivez votre projet et recevez un devis personnalisé
            </p>
            <Link
              to={`/services/request?provider=${provider.provider_id}&profession=${provider.profession}`}
              className="inline-block px-8 py-3 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-300 transition-colors"
            >
              Demander un devis
            </Link>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Réalisation"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </main>
  );
}
