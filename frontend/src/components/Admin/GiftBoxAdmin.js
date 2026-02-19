import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gift, Plus, Trash2, Edit2, Save, X, Image, 
  Palette, Package, Settings, Eye, EyeOff, GripVertical,
  Upload, Check
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { formatPrice } from "../../lib/utils";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function GiftBoxAdmin({ token }) {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [wrappings, setWrappings] = useState([]);
  
  // Edit states
  const [editingSize, setEditingSize] = useState(null);
  const [editingWrapping, setEditingWrapping] = useState(null);
  const [showAddSize, setShowAddSize] = useState(false);
  const [showAddWrapping, setShowAddWrapping] = useState(false);
  
  // Form states
  const [newSize, setNewSize] = useState({
    name: "", description: "", max_items: 5, base_price: 10000, icon: "🎁", image: "", is_active: true, sort_order: 0
  });
  const [newWrapping, setNewWrapping] = useState({
    name: "", color: "#FF0000", price: 0, image: "", is_active: true, sort_order: 0
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/gift-box/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConfig(response.data.config);
      setSizes(response.data.sizes);
      setWrappings(response.data.wrappings);
    } catch (error) {
      console.error("Error fetching config:", error);
      toast.error("Erreur lors du chargement de la configuration");
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async () => {
    try {
      await axios.put(`${API_URL}/api/admin/gift-box/config`, config, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      let imageUrl = response.data.url;
      if (imageUrl.startsWith('/api/')) {
        imageUrl = `${API_URL}${imageUrl}`;
      }
      callback(imageUrl);
      toast.success("Image uploadée");
    } catch (error) {
      toast.error("Erreur lors de l'upload");
    }
  };

  // Size CRUD
  const createSize = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/admin/gift-box/sizes`, newSize, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      await axios.put(`${API_URL}/api/admin/gift-box/sizes/${sizeId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      await axios.delete(`${API_URL}/api/admin/gift-box/sizes/${sizeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSizes(sizes.filter(s => s.size_id !== sizeId));
      toast.success("Taille supprimée");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  // Wrapping CRUD
  const createWrapping = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/admin/gift-box/wrappings`, newWrapping, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      await axios.put(`${API_URL}/api/admin/gift-box/wrappings/${wrappingId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      await axios.delete(`${API_URL}/api/admin/gift-box/wrappings/${wrappingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Gift className="w-8 h-8 text-purple-500" />
            Coffrets Cadeaux
          </h2>
          <p className="text-muted-foreground">Gérez les tailles, emballages et options des coffrets</p>
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

      {/* General Config */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configuration générale
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Titre de la page</label>
            <input
              type="text"
              value={config?.page_title || ""}
              onChange={(e) => setConfig({ ...config, page_title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longueur max message</label>
            <input
              type="number"
              value={config?.max_message_length || 200}
              onChange={(e) => setConfig({ ...config, max_message_length: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={config?.page_description || ""}
              onChange={(e) => setConfig({ ...config, page_description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config?.is_enabled ?? true}
                onChange={(e) => setConfig({ ...config, is_enabled: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Page activée</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config?.allow_personal_message ?? true}
                onChange={(e) => setConfig({ ...config, allow_personal_message: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Autoriser messages personnels</span>
            </label>
          </div>
        </div>
        
        <button
          onClick={updateConfig}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          <Save className="w-4 h-4" />
          Enregistrer
        </button>
      </div>

      {/* Sizes */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5" />
            Tailles de coffrets ({sizes.length})
          </h3>
          <button
            onClick={() => setShowAddSize(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sizes.map((size) => (
            <motion.div
              key={size.size_id}
              layout
              className={`p-4 border rounded-xl ${size.is_active ? 'border-purple-200 dark:border-purple-800' : 'border-gray-200 dark:border-gray-700 opacity-60'}`}
            >
              {editingSize === size.size_id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={size.name}
                    onChange={(e) => setSizes(sizes.map(s => s.size_id === size.size_id ? { ...s, name: e.target.value } : s))}
                    className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-800"
                    placeholder="Nom"
                  />
                  <input
                    type="text"
                    value={size.description}
                    onChange={(e) => setSizes(sizes.map(s => s.size_id === size.size_id ? { ...s, description: e.target.value } : s))}
                    className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-800"
                    placeholder="Description"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={size.max_items}
                      onChange={(e) => setSizes(sizes.map(s => s.size_id === size.size_id ? { ...s, max_items: parseInt(e.target.value) } : s))}
                      className="w-1/2 px-2 py-1 border rounded text-sm dark:bg-gray-800"
                      placeholder="Max articles"
                    />
                    <input
                      type="number"
                      value={size.base_price}
                      onChange={(e) => setSizes(sizes.map(s => s.size_id === size.size_id ? { ...s, base_price: parseInt(e.target.value) } : s))}
                      className="w-1/2 px-2 py-1 border rounded text-sm dark:bg-gray-800"
                      placeholder="Prix"
                    />
                  </div>
                  <input
                    type="text"
                    value={size.icon}
                    onChange={(e) => setSizes(sizes.map(s => s.size_id === size.size_id ? { ...s, icon: e.target.value } : s))}
                    className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-800"
                    placeholder="Emoji/Icône"
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={size.is_active}
                        onChange={(e) => setSizes(sizes.map(s => s.size_id === size.size_id ? { ...s, is_active: e.target.checked } : s))}
                      />
                      Actif
                    </label>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => updateSize(size.size_id, size)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-green-500 text-white rounded text-xs"
                    >
                      <Check className="w-3 h-3" /> Sauver
                    </button>
                    <button
                      onClick={() => setEditingSize(null)}
                      className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{size.icon}</span>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingSize(size.size_id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button onClick={() => deleteSize(size.size_id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-semibold">{size.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{size.description}</p>
                  <p className="text-sm text-purple-600">Jusqu'à {size.max_items} articles</p>
                  <p className="font-bold text-lg">{formatPrice(size.base_price)}</p>
                  {!size.is_active && (
                    <span className="inline-flex items-center gap-1 text-xs text-orange-500 mt-2">
                      <EyeOff className="w-3 h-3" /> Masqué
                    </span>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Add Size Modal */}
        <AnimatePresence>
          {showAddSize && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              onClick={() => setShowAddSize(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 w-full max-w-md"
              >
                <h3 className="text-lg font-bold mb-4">Nouvelle taille de coffret</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newSize.name}
                    onChange={(e) => setNewSize({ ...newSize, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                    placeholder="Nom (ex: Grand Coffret)"
                  />
                  <input
                    type="text"
                    value={newSize.description}
                    onChange={(e) => setNewSize({ ...newSize, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                    placeholder="Description"
                  />
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">Max articles</label>
                      <input
                        type="number"
                        value={newSize.max_items}
                        onChange={(e) => setNewSize({ ...newSize, max_items: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">Prix (FCFA)</label>
                      <input
                        type="number"
                        value={newSize.base_price}
                        onChange={(e) => setNewSize({ ...newSize, base_price: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">Emoji/Icône</label>
                      <input
                        type="text"
                        value={newSize.icon}
                        onChange={(e) => setNewSize({ ...newSize, icon: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                        placeholder="🎁"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">Ordre</label>
                      <input
                        type="number"
                        value={newSize.sort_order}
                        onChange={(e) => setNewSize({ ...newSize, sort_order: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setShowAddSize(false)}
                      className="flex-1 px-4 py-2 border rounded-lg"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={createSize}
                      disabled={!newSize.name}
                      className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg disabled:opacity-50"
                    >
                      Créer
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Wrappings */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Options d'emballage ({wrappings.length})
          </h3>
          <button
            onClick={() => setShowAddWrapping(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {wrappings.map((wrap) => (
            <motion.div
              key={wrap.wrapping_id}
              layout
              className={`p-4 border rounded-xl text-center ${wrap.is_active ? 'border-purple-200 dark:border-purple-800' : 'border-gray-200 dark:border-gray-700 opacity-60'}`}
            >
              {editingWrapping === wrap.wrapping_id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={wrap.name}
                    onChange={(e) => setWrappings(wrappings.map(w => w.wrapping_id === wrap.wrapping_id ? { ...w, name: e.target.value } : w))}
                    className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-800"
                    placeholder="Nom"
                  />
                  <input
                    type="color"
                    value={wrap.color}
                    onChange={(e) => setWrappings(wrappings.map(w => w.wrapping_id === wrap.wrapping_id ? { ...w, color: e.target.value } : w))}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                  <input
                    type="number"
                    value={wrap.price}
                    onChange={(e) => setWrappings(wrappings.map(w => w.wrapping_id === wrap.wrapping_id ? { ...w, price: parseInt(e.target.value) } : w))}
                    className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-800"
                    placeholder="Prix"
                  />
                  <label className="flex items-center justify-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={wrap.is_active}
                      onChange={(e) => setWrappings(wrappings.map(w => w.wrapping_id === wrap.wrapping_id ? { ...w, is_active: e.target.checked } : w))}
                    />
                    Actif
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateWrapping(wrap.wrapping_id, wrap)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-green-500 text-white rounded text-xs"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setEditingWrapping(null)}
                      className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-end gap-1 mb-2">
                    <button onClick={() => setEditingWrapping(wrap.wrapping_id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                      <Edit2 className="w-3 h-3 text-gray-500" />
                    </button>
                    <button onClick={() => deleteWrapping(wrap.wrapping_id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-white shadow-md"
                    style={{ backgroundColor: wrap.color }}
                  />
                  <h4 className="font-medium text-sm">{wrap.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {wrap.price > 0 ? `+${formatPrice(wrap.price)}` : 'Inclus'}
                  </p>
                  {!wrap.is_active && (
                    <span className="inline-flex items-center gap-1 text-xs text-orange-500 mt-1">
                      <EyeOff className="w-3 h-3" /> Masqué
                    </span>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Add Wrapping Modal */}
        <AnimatePresence>
          {showAddWrapping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              onClick={() => setShowAddWrapping(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 w-full max-w-md"
              >
                <h3 className="text-lg font-bold mb-4">Nouvel emballage</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newWrapping.name}
                    onChange={(e) => setNewWrapping({ ...newWrapping, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                    placeholder="Nom (ex: Or & Luxe)"
                  />
                  <div>
                    <label className="text-xs text-muted-foreground">Couleur</label>
                    <input
                      type="color"
                      value={newWrapping.color}
                      onChange={(e) => setNewWrapping({ ...newWrapping, color: e.target.value })}
                      className="w-full h-12 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Prix supplémentaire (FCFA)</label>
                    <input
                      type="number"
                      value={newWrapping.price}
                      onChange={(e) => setNewWrapping({ ...newWrapping, price: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                      placeholder="0 pour inclus"
                    />
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setShowAddWrapping(false)}
                      className="flex-1 px-4 py-2 border rounded-lg"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={createWrapping}
                      disabled={!newWrapping.name}
                      className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg disabled:opacity-50"
                    >
                      Créer
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
