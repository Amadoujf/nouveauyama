import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gift, Plus, Trash2, Edit2, Save, X, Image, 
  Palette, Package, Settings, Eye, EyeOff, GripVertical,
  Upload, Check, Calendar, Sparkles, Star, Moon, Baby,
  TreePine, Heart, ShoppingBag, Sun, Layers
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { formatPrice, getImageUrl } from "../../lib/utils";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Template icon mapping
const TEMPLATE_ICONS = {
  "🌙": Moon,
  "🧸": Baby,
  "🎄": TreePine,
  "👜": ShoppingBag,
  "💝": Heart,
  "🐑": Sun,
  "💐": Sparkles,
  "🎁": Gift
};

export default function GiftBoxAdmin({ token }) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("templates");
  const [config, setConfig] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [wrappings, setWrappings] = useState([]);
  const [templates, setTemplates] = useState([]);
  
  // Edit states
  const [editingSize, setEditingSize] = useState(null);
  const [editingWrapping, setEditingWrapping] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showAddSize, setShowAddSize] = useState(false);
  const [showAddWrapping, setShowAddWrapping] = useState(false);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  
  // Form states
  const [newSize, setNewSize] = useState({
    name: "", description: "", max_items: 5, base_price: 10000, icon: "🎁", image: "", is_active: true, sort_order: 0
  });
  const [newWrapping, setNewWrapping] = useState({
    name: "", color: "#FF0000", price: 0, image: "", is_active: true, sort_order: 0
  });
  const [newTemplate, setNewTemplate] = useState({
    name: "", description: "", icon: "🎁", theme_color: "#9333EA", page_title: "", page_subtitle: "", banner_image: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [configRes, templatesRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/gift-box/config`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/admin/gift-box/templates`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setConfig(configRes.data.config);
      setSizes(configRes.data.sizes);
      setWrappings(configRes.data.wrappings);
      setTemplates(templatesRes.data.templates);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async () => {
    try {
      await axios.put(`${API_URL}/api/admin/gift-box/config`, config, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Configuration mise à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleImageUpload = async (file, callback) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(`${API_URL}/api/upload/image`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      callback(response.data.url);
      toast.success("Image uploadée");
    } catch (error) {
      toast.error("Erreur lors de l'upload");
    }
  };

  // Template functions
  const activateTemplate = async (templateId) => {
    try {
      await axios.put(`${API_URL}/api/admin/gift-box/templates/${templateId}/activate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(templates.map(t => ({ ...t, is_active: t.template_id === templateId })));
      toast.success("Template activé avec succès !");
    } catch (error) {
      toast.error("Erreur lors de l'activation");
    }
  };

  const createTemplate = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/admin/gift-box/templates`, newTemplate, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates([...templates, response.data.template]);
      setShowAddTemplate(false);
      setNewTemplate({ name: "", description: "", icon: "🎁", theme_color: "#9333EA", page_title: "", page_subtitle: "", banner_image: "" });
      toast.success("Template créé");
    } catch (error) {
      toast.error("Erreur lors de la création");
    }
  };

  const updateTemplate = async (templateId, data) => {
    try {
      await axios.put(`${API_URL}/api/admin/gift-box/templates/${templateId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(templates.map(t => t.template_id === templateId ? { ...t, ...data } : t));
      setEditingTemplate(null);
      toast.success("Template mis à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteTemplate = async (templateId) => {
    if (!window.confirm("Supprimer ce template ?")) return;
    try {
      await axios.delete(`${API_URL}/api/admin/gift-box/templates/${templateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(templates.filter(t => t.template_id !== templateId));
      toast.success("Template supprimé");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de la suppression");
    }
  };

  // Size CRUD
  const createSize = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/admin/gift-box/sizes`, newSize, { headers: { Authorization: `Bearer ${token}` } });
      setSizes([...sizes, response.data]);
      setShowAddSize(false);
      setNewSize({ name: "", description: "", max_items: 5, base_price: 10000, icon: "🎁", image: "", is_active: true, sort_order: sizes.length });
      toast.success("Taille créée");
    } catch (error) {
      toast.error("Erreur lors de la création");
    }
  };

  const updateSize = async (sizeId, data) => {
    try {
      await axios.put(`${API_URL}/api/admin/gift-box/sizes/${sizeId}`, data, { headers: { Authorization: `Bearer ${token}` } });
      setSizes(sizes.map(s => s.size_id === sizeId ? { ...s, ...data } : s));
      setEditingSize(null);
      toast.success("Taille mise à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteSize = async (sizeId) => {
    if (!window.confirm("Supprimer cette taille de coffret ?")) return;
    try {
      await axios.delete(`${API_URL}/api/admin/gift-box/sizes/${sizeId}`, { headers: { Authorization: `Bearer ${token}` } });
      setSizes(sizes.filter(s => s.size_id !== sizeId));
      toast.success("Taille supprimée");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  // Wrapping CRUD
  const createWrapping = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/admin/gift-box/wrappings`, newWrapping, { headers: { Authorization: `Bearer ${token}` } });
      setWrappings([...wrappings, response.data]);
      setShowAddWrapping(false);
      setNewWrapping({ name: "", color: "#FF0000", price: 0, image: "", is_active: true, sort_order: wrappings.length });
      toast.success("Emballage créé");
    } catch (error) {
      toast.error("Erreur lors de la création");
    }
  };

  const updateWrapping = async (wrappingId, data) => {
    try {
      await axios.put(`${API_URL}/api/admin/gift-box/wrappings/${wrappingId}`, data, { headers: { Authorization: `Bearer ${token}` } });
      setWrappings(wrappings.map(w => w.wrapping_id === wrappingId ? { ...w, ...data } : w));
      setEditingWrapping(null);
      toast.success("Emballage mis à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteWrapping = async (wrappingId) => {
    if (!window.confirm("Supprimer cet emballage ?")) return;
    try {
      await axios.delete(`${API_URL}/api/admin/gift-box/wrappings/${wrappingId}`, { headers: { Authorization: `Bearer ${token}` } });
      setWrappings(wrappings.filter(w => w.wrapping_id !== wrappingId));
      toast.success("Emballage supprimé");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeTemplate = templates.find(t => t.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Gift className="w-8 h-8 text-purple-500" />
            Coffrets Cadeaux
          </h2>
          <p className="text-muted-foreground">Gérez les templates, tailles et emballages</p>
        </div>
        <a 
          href="/coffret-cadeau" 
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Voir la page
        </a>
      </div>

      {/* Active Template Banner */}
      {activeTemplate && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border-2 flex items-center justify-between"
          style={{ 
            borderColor: activeTemplate.theme_color,
            background: `${activeTemplate.theme_color}15`
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activeTemplate.icon}</span>
            <div>
              <p className="font-semibold" style={{ color: activeTemplate.theme_color }}>
                Template actif : {activeTemplate.name}
              </p>
              <p className="text-sm text-muted-foreground">{activeTemplate.page_title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
            <Check className="w-4 h-4" />
            Actif
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: "templates", label: "Templates", icon: Layers },
          { id: "sizes", label: "Tailles", icon: Package },
          { id: "wrappings", label: "Emballages", icon: Palette },
          { id: "settings", label: "Paramètres", icon: Settings }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Choisissez le template selon la période (Ramadan, Noël, etc.)
            </p>
            <button
              onClick={() => setShowAddTemplate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouveau template
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <motion.div
                key={template.template_id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  template.is_active 
                    ? "ring-2 ring-green-500 ring-offset-2" 
                    : "hover:shadow-lg"
                }`}
                style={{ 
                  borderColor: template.theme_color,
                  background: template.is_active ? `${template.theme_color}10` : 'var(--card)'
                }}
              >
                {template.is_active && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-3">
                  <span className="text-4xl">{template.icon}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingTemplate(template)}
                      className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    {!["classique", "ramadan", "noel", "enfant", "pack_accessoires", "saint_valentin", "tabaski", "fete_meres"].includes(template.template_id) && (
                      <button
                        onClick={() => deleteTemplate(template.template_id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {template.description}
                </p>

                <div 
                  className="h-2 rounded-full mb-4"
                  style={{ background: template.theme_color }}
                />

                {!template.is_active ? (
                  <button
                    onClick={() => activateTemplate(template.template_id)}
                    className="w-full py-2 rounded-lg font-medium transition-colors"
                    style={{ 
                      background: template.theme_color,
                      color: 'white'
                    }}
                  >
                    Activer ce template
                  </button>
                ) : (
                  <div className="w-full py-2 rounded-lg font-medium text-center bg-green-100 text-green-700">
                    Template actif
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Add Template Modal */}
          <AnimatePresence>
            {showAddTemplate && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowAddTemplate(false)}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 w-full max-w-md"
                  onClick={e => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold mb-4">Nouveau Template</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nom</label>
                      <input
                        type="text"
                        value={newTemplate.name}
                        onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                        placeholder="Ex: Coffret Anniversaire"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={newTemplate.description}
                        onChange={e => setNewTemplate({ ...newTemplate, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                        rows={2}
                        placeholder="Description du template"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Icône</label>
                        <input
                          type="text"
                          value={newTemplate.icon}
                          onChange={e => setNewTemplate({ ...newTemplate, icon: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-center text-2xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Couleur</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={newTemplate.theme_color}
                            onChange={e => setNewTemplate({ ...newTemplate, theme_color: e.target.value })}
                            className="w-12 h-10 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={newTemplate.theme_color}
                            onChange={e => setNewTemplate({ ...newTemplate, theme_color: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Titre de page</label>
                      <input
                        type="text"
                        value={newTemplate.page_title}
                        onChange={e => setNewTemplate({ ...newTemplate, page_title: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                        placeholder="Titre affiché sur la page"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Sous-titre</label>
                      <input
                        type="text"
                        value={newTemplate.page_subtitle}
                        onChange={e => setNewTemplate({ ...newTemplate, page_subtitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                        placeholder="Sous-titre descriptif"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowAddTemplate(false)}
                      className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={createTemplate}
                      className="flex-1 py-2 rounded-lg bg-purple-500 text-white font-medium"
                    >
                      Créer
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit Template Modal */}
          <AnimatePresence>
            {editingTemplate && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setEditingTemplate(null)}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 w-full max-w-md"
                  onClick={e => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold mb-4">Modifier : {editingTemplate.name}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nom</label>
                      <input
                        type="text"
                        value={editingTemplate.name}
                        onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={editingTemplate.description}
                        onChange={e => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Icône</label>
                        <input
                          type="text"
                          value={editingTemplate.icon}
                          onChange={e => setEditingTemplate({ ...editingTemplate, icon: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-center text-2xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Couleur</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={editingTemplate.theme_color}
                            onChange={e => setEditingTemplate({ ...editingTemplate, theme_color: e.target.value })}
                            className="w-12 h-10 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingTemplate.theme_color}
                            onChange={e => setEditingTemplate({ ...editingTemplate, theme_color: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Titre de page</label>
                      <input
                        type="text"
                        value={editingTemplate.page_title}
                        onChange={e => setEditingTemplate({ ...editingTemplate, page_title: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Sous-titre</label>
                      <input
                        type="text"
                        value={editingTemplate.page_subtitle}
                        onChange={e => setEditingTemplate({ ...editingTemplate, page_subtitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setEditingTemplate(null)}
                      className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => updateTemplate(editingTemplate.template_id, editingTemplate)}
                      className="flex-1 py-2 rounded-lg bg-purple-500 text-white font-medium"
                    >
                      Sauvegarder
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Sizes Tab */}
      {activeTab === "sizes" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddSize(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              <Plus className="w-4 h-4" />
              Ajouter une taille
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {sizes.map(size => (
              <div key={size.size_id} className="p-4 bg-white dark:bg-[#1C1C1E] rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{size.icon}</span>
                    <div>
                      <h4 className="font-semibold">{size.name}</h4>
                      <p className="text-sm text-muted-foreground">{size.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingSize(size)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteSize(size.size_id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Max: {size.max_items} articles</span>
                  <span className="font-semibold text-purple-600">{formatPrice(size.base_price)}</span>
                  <span className={`px-2 py-1 rounded ${size.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {size.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Size Modal */}
          <AnimatePresence>
            {showAddSize && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowAddSize(false)}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 w-full max-w-md"
                  onClick={e => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold mb-4">Nouvelle Taille</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={newSize.name}
                      onChange={e => setNewSize({ ...newSize, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                      placeholder="Nom de la taille"
                    />
                    <input
                      type="text"
                      value={newSize.description}
                      onChange={e => setNewSize({ ...newSize, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                      placeholder="Description"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Icône</label>
                        <input
                          type="text"
                          value={newSize.icon}
                          onChange={e => setNewSize({ ...newSize, icon: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border bg-transparent text-center text-xl"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Max articles</label>
                        <input
                          type="number"
                          value={newSize.max_items}
                          onChange={e => setNewSize({ ...newSize, max_items: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg border bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Prix (FCFA)</label>
                        <input
                          type="number"
                          value={newSize.base_price}
                          onChange={e => setNewSize({ ...newSize, base_price: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg border bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowAddSize(false)} className="flex-1 py-2 rounded-lg border">Annuler</button>
                    <button onClick={createSize} className="flex-1 py-2 rounded-lg bg-purple-500 text-white">Créer</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit Size Modal */}
          <AnimatePresence>
            {editingSize && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setEditingSize(null)}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 w-full max-w-md"
                  onClick={e => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold mb-4">Modifier : {editingSize.name}</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editingSize.name}
                      onChange={e => setEditingSize({ ...editingSize, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border bg-transparent"
                      placeholder="Nom"
                    />
                    <input
                      type="text"
                      value={editingSize.description}
                      onChange={e => setEditingSize({ ...editingSize, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border bg-transparent"
                      placeholder="Description"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={editingSize.icon}
                        onChange={e => setEditingSize({ ...editingSize, icon: e.target.value })}
                        className="px-3 py-2 rounded-lg border bg-transparent text-center text-xl"
                      />
                      <input
                        type="number"
                        value={editingSize.max_items}
                        onChange={e => setEditingSize({ ...editingSize, max_items: parseInt(e.target.value) })}
                        className="px-3 py-2 rounded-lg border bg-transparent"
                      />
                      <input
                        type="number"
                        value={editingSize.base_price}
                        onChange={e => setEditingSize({ ...editingSize, base_price: parseInt(e.target.value) })}
                        className="px-3 py-2 rounded-lg border bg-transparent"
                      />
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingSize.is_active}
                        onChange={e => setEditingSize({ ...editingSize, is_active: e.target.checked })}
                        className="rounded"
                      />
                      <span>Actif</span>
                    </label>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setEditingSize(null)} className="flex-1 py-2 rounded-lg border">Annuler</button>
                    <button onClick={() => updateSize(editingSize.size_id, editingSize)} className="flex-1 py-2 rounded-lg bg-purple-500 text-white">Sauvegarder</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Wrappings Tab */}
      {activeTab === "wrappings" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddWrapping(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              <Plus className="w-4 h-4" />
              Ajouter un emballage
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wrappings.map(wrapping => (
              <div key={wrapping.wrapping_id} className="p-4 bg-white dark:bg-[#1C1C1E] rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg"
                      style={{ background: wrapping.color }}
                    />
                    <div>
                      <h4 className="font-semibold">{wrapping.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {wrapping.price > 0 ? formatPrice(wrapping.price) : 'Gratuit'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingWrapping(wrapping)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteWrapping(wrapping.wrapping_id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add/Edit Wrapping Modals - Similar structure to sizes */}
          <AnimatePresence>
            {showAddWrapping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowAddWrapping(false)}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 w-full max-w-md"
                  onClick={e => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold mb-4">Nouvel Emballage</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={newWrapping.name}
                      onChange={e => setNewWrapping({ ...newWrapping, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border bg-transparent"
                      placeholder="Nom de l'emballage"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Couleur</label>
                        <input
                          type="color"
                          value={newWrapping.color}
                          onChange={e => setNewWrapping({ ...newWrapping, color: e.target.value })}
                          className="w-full h-10 rounded cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Prix (FCFA)</label>
                        <input
                          type="number"
                          value={newWrapping.price}
                          onChange={e => setNewWrapping({ ...newWrapping, price: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-lg border bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowAddWrapping(false)} className="flex-1 py-2 rounded-lg border">Annuler</button>
                    <button onClick={createWrapping} className="flex-1 py-2 rounded-lg bg-purple-500 text-white">Créer</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {editingWrapping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setEditingWrapping(null)}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 w-full max-w-md"
                  onClick={e => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold mb-4">Modifier : {editingWrapping.name}</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editingWrapping.name}
                      onChange={e => setEditingWrapping({ ...editingWrapping, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border bg-transparent"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="color"
                        value={editingWrapping.color}
                        onChange={e => setEditingWrapping({ ...editingWrapping, color: e.target.value })}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                      <input
                        type="number"
                        value={editingWrapping.price}
                        onChange={e => setEditingWrapping({ ...editingWrapping, price: parseInt(e.target.value) || 0 })}
                        className="px-3 py-2 rounded-lg border bg-transparent"
                      />
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingWrapping.is_active}
                        onChange={e => setEditingWrapping({ ...editingWrapping, is_active: e.target.checked })}
                        className="rounded"
                      />
                      <span>Actif</span>
                    </label>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setEditingWrapping(null)} className="flex-1 py-2 rounded-lg border">Annuler</button>
                    <button onClick={() => updateWrapping(editingWrapping.wrapping_id, editingWrapping)} className="flex-1 py-2 rounded-lg bg-purple-500 text-white">Sauvegarder</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && config && (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuration générale
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.is_enabled}
                onChange={e => setConfig({ ...config, is_enabled: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300"
              />
              <span>Activer la page Coffrets Cadeaux</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.allow_personal_message}
                onChange={e => setConfig({ ...config, allow_personal_message: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300"
              />
              <span>Autoriser les messages personnalisés</span>
            </label>
            <div>
              <label className="block text-sm font-medium mb-1">Longueur max du message</label>
              <input
                type="number"
                value={config.max_message_length || 200}
                onChange={e => setConfig({ ...config, max_message_length: parseInt(e.target.value) })}
                className="w-32 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
              />
            </div>
            <button
              onClick={updateConfig}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
