import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import {
  User,
  Settings,
  Briefcase,
  Star,
  MapPin,
  Phone,
  Mail,
  Camera,
  Edit,
  Save,
  Clock,
  Eye,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  LogOut,
  BarChart3,
  Upload,
  X,
  Plus,
  Trash2,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Share2,
  Image as ImageIcon,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ProviderDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [editForm, setEditForm] = useState({
    description: "",
    availability: "available",
    price_from: "",
    price_description: "",
    phone: "",
    whatsapp: "",
    email: "",
    services: [],
    social_links: {
      facebook: "",
      instagram: "",
      linkedin: "",
      twitter: "",
      tiktok: "",
      youtube: "",
      website: "",
    }
  });

  const [newService, setNewService] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchProviderProfile();
  }, [user]);

  const fetchProviderProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/services/provider/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProvider(response.data);
      setEditForm({
        description: response.data.description || "",
        availability: response.data.availability || "available",
        price_from: response.data.price_from?.toString() || "",
        price_description: response.data.price_description || "",
        phone: response.data.phone || "",
        whatsapp: response.data.whatsapp || "",
        email: response.data.email || "",
        services: response.data.services || [],
        social_links: {
          facebook: response.data.social_links?.facebook || "",
          instagram: response.data.social_links?.instagram || "",
          linkedin: response.data.social_links?.linkedin || "",
          twitter: response.data.social_links?.twitter || "",
          tiktok: response.data.social_links?.tiktok || "",
          youtube: response.data.social_links?.youtube || "",
          website: response.data.social_links?.website || "",
        }
      });
    } catch (error) {
      if (error.response?.status === 404) {
        // User is not a provider
        setProvider(null);
      } else {
        console.error("Error fetching provider:", error);
        toast.error("Erreur lors du chargement du profil");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/services/provider/me`,
        {
          ...editForm,
          price_from: editForm.price_from ? parseInt(editForm.price_from) : null,
          services: editForm.services,
          social_links: editForm.social_links,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Profil mis à jour !");
      setEditing(false);
      fetchProviderProfile();
    } catch (error) {
      console.error("Error updating provider:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0A0A0A]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </main>
    );
  }

  // Not a provider
  if (!provider) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0A0A0A] px-4">
        <Helmet>
          <title>Tableau de bord prestataire - YAMA+</title>
        </Helmet>
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Pas encore prestataire ?</h1>
          <p className="text-muted-foreground mb-6">
            Vous n'avez pas encore de profil prestataire. L'inscription est sur invitation uniquement.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/services"
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Parcourir les services
            </Link>
            <Link
              to="/account"
              className="px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Mon compte
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Pending approval
  if (!provider.is_active) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0A0A0A] px-4">
        <Helmet>
          <title>En attente d'approbation - YAMA+</title>
        </Helmet>
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold mb-3">En attente d'approbation</h1>
          <p className="text-muted-foreground mb-6">
            Votre profil prestataire est en cours de vérification. Vous serez notifié une fois votre compte activé.
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold mb-2">Votre profil</h3>
            <p className="text-sm text-muted-foreground">
              <strong>Nom:</strong> {provider.name}<br />
              <strong>Métier:</strong> {provider.profession}<br />
              <strong>Ville:</strong> {provider.city}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Se déconnecter
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A]">
      <Helmet>
        <title>Tableau de bord - {provider.name} | YAMA+</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Avatar */}
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
                      👷
                    </div>
                  )}
                </div>
                {provider.is_verified && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{provider.name}</h1>
                <p className="text-muted-foreground">{provider.profession}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {provider.city}
                  </span>
                  {provider.rating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {provider.rating} ({provider.review_count} avis)
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  to={`/provider/${provider.provider_id}`}
                  className="px-4 py-2 flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  target="_blank"
                >
                  <Eye className="w-4 h-4" />
                  Voir mon profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-3">
              <span className={cn(
                "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
                provider.availability === "available"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : provider.availability === "busy"
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              )}>
                <Clock className="w-3 h-3" />
                {provider.availability === "available" ? "Disponible" :
                 provider.availability === "busy" ? "Occupé" : "Non disponible"}
              </span>
              {provider.is_verified && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Vérifié YAMA+
                </span>
              )}
              {provider.is_premium && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium">
                  <Star className="w-3 h-3" />
                  Premium
                </span>
              )}
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: "profile", label: "Mon profil", icon: User },
              { id: "stats", label: "Statistiques", icon: BarChart3 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap",
                  activeTab === id
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Edit Form */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Informations
                  </h2>
                  {editing ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(false)}
                        className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg flex items-center gap-2"
                      >
                        {saving ? (
                          <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Enregistrer
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditing(true)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Availability */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Disponibilité</label>
                    <select
                      value={editForm.availability}
                      onChange={(e) => setEditForm({ ...editForm, availability: e.target.value })}
                      disabled={!editing}
                      className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 disabled:opacity-60"
                    >
                      <option value="available">Disponible</option>
                      <option value="busy">Occupé</option>
                      <option value="unavailable">Non disponible</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      disabled={!editing}
                      rows={4}
                      className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 disabled:opacity-60"
                    />
                  </div>

                  {/* Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Téléphone</label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        disabled={!editing}
                        className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">WhatsApp</label>
                      <input
                        type="tel"
                        value={editForm.whatsapp}
                        onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                        disabled={!editing}
                        className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Prix de départ (FCFA)</label>
                      <input
                        type="text"
                        value={editForm.price_from}
                        onChange={(e) => setEditForm({ ...editForm, price_from: e.target.value })}
                        disabled={!editing}
                        className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Précisions tarif</label>
                      <input
                        type="text"
                        value={editForm.price_description}
                        onChange={(e) => setEditForm({ ...editForm, price_description: e.target.value })}
                        disabled={!editing}
                        className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats Tab */}
          {activeTab === "stats" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6"
            >
              <h2 className="font-semibold mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Vos statistiques
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold">{provider.review_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Avis reçus</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold">{provider.rating || 0}</p>
                  <p className="text-sm text-muted-foreground">Note moyenne</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold">{provider.completed_jobs || 0}</p>
                  <p className="text-sm text-muted-foreground">Travaux terminés</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold">{provider.photos?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Photos</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-muted-foreground text-center">
                  Plus de statistiques détaillées seront disponibles prochainement.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
