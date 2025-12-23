import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  Menu,
  X,
  FileText,
  Download,
  Zap,
} from "lucide-react";
import { formatPrice, formatDate, getOrderStatusDisplay, getPaymentStatusDisplay, getCategoryName } from "../lib/utils";
import { cn } from "../lib/utils";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const menuItems = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, href: "/admin" },
  { id: "products", label: "Produits", icon: Package, href: "/admin/products" },
  { id: "orders", label: "Commandes", icon: ShoppingCart, href: "/admin/orders" },
  { id: "users", label: "Utilisateurs", icon: Users, href: "/admin/users" },
];

export default function AdminPage() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // For edit mode
  const [productFormLoading, setProductFormLoading] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    short_description: "",
    price: "",
    original_price: "",
    category: "electronique",
    subcategory: "",
    images: "",
    stock: "",
    featured: false,
    is_new: false,
    is_promo: false,
  });

  const currentPage = location.pathname.split("/").pop() || "admin";

  // Reset form
  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      short_description: "",
      price: "",
      original_price: "",
      category: "electronique",
      subcategory: "",
      images: "",
      stock: "",
      featured: false,
      is_new: false,
      is_promo: false,
    });
    setEditingProduct(null);
  };

  // Open form for editing
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      short_description: product.short_description || "",
      price: product.price?.toString() || "",
      original_price: product.original_price?.toString() || "",
      category: product.category || "electronique",
      subcategory: product.subcategory || "",
      images: product.images?.join(", ") || "",
      stock: product.stock?.toString() || "",
      featured: product.featured || false,
      is_new: product.is_new || false,
      is_promo: product.is_promo || false,
    });
    setShowProductForm(true);
  };

  // Open form for new product
  const handleNewProduct = () => {
    resetProductForm();
    setShowProductForm(true);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!isAdmin) {
      navigate("/");
      toast.error("Accès non autorisé");
      return;
    }

    fetchData();
  }, [isAuthenticated, isAdmin, navigate, currentPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (currentPage === "admin" || currentPage === "") {
        const response = await axios.get(`${API_URL}/api/admin/stats`, {
          withCredentials: true,
        });
        setStats(response.data);
      }

      if (currentPage === "products" || currentPage === "admin") {
        const response = await axios.get(`${API_URL}/api/products?limit=50`);
        setProducts(response.data);
      }

      if (currentPage === "orders" || currentPage === "admin") {
        const response = await axios.get(`${API_URL}/api/admin/orders`, {
          withCredentials: true,
        });
        setOrders(response.data.orders);
      }

      if (currentPage === "users") {
        const response = await axios.get(`${API_URL}/api/admin/users`, {
          withCredentials: true,
        });
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;
    
    try {
      await axios.delete(`${API_URL}/api/products/${productId}`, {
        withCredentials: true,
      });
      toast.success("Produit supprimé");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setProductFormLoading(true);
    
    try {
      const imageUrls = productForm.images
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url);

      const productData = {
        name: productForm.name,
        description: productForm.description,
        short_description: productForm.short_description,
        price: parseInt(productForm.price),
        original_price: productForm.original_price ? parseInt(productForm.original_price) : null,
        category: productForm.category,
        subcategory: productForm.subcategory || null,
        images: imageUrls.length > 0 ? imageUrls : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
        stock: parseInt(productForm.stock) || 0,
        featured: productForm.featured,
        is_new: productForm.is_new,
        is_promo: productForm.is_promo,
        specs: {},
      };

      if (editingProduct) {
        // UPDATE existing product
        await axios.put(`${API_URL}/api/products/${editingProduct.product_id}`, productData, {
          withCredentials: true,
        });
        toast.success("Produit modifié avec succès !");
      } else {
        // CREATE new product
        await axios.post(`${API_URL}/api/products`, productData, {
          withCredentials: true,
        });
        toast.success("Produit créé avec succès !");
      }

      setShowProductForm(false);
      resetProductForm();
      fetchData();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(error.response?.data?.detail || "Erreur lors de l'enregistrement");
    } finally {
      setProductFormLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, orderStatus, paymentStatus) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/orders/${orderId}/status`,
        { order_status: orderStatus, payment_status: paymentStatus },
        { withCredentials: true }
      );
      toast.success("Statut mis à jour");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!isAuthenticated || !isAdmin) return null;

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.product_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (o) =>
      o.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shipping?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#0B0B0B]" data-testid="admin-page">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#1C1C1E] border-b border-black/5 dark:border-white/5 flex items-center justify-between px-4 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2"
        >
          <Menu className="w-6 h-6" />
        </button>
        <img 
          src="https://customer-assets.emergentagent.com/job_premium-senegal/artifacts/xs5g0hsy_IMG_0613.png" 
          alt="Groupe YAMA+" 
          className="h-10 w-auto"
        />
        <div className="w-10" />
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white dark:bg-[#1C1C1E] border-r border-black/5 dark:border-white/5 z-50 transform transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2">
              <img 
                src="https://customer-assets.emergentagent.com/job_premium-senegal/artifacts/xs5g0hsy_IMG_0613.png" 
                alt="Groupe YAMA+" 
                className="h-12 w-auto"
              />
              <span className="text-sm font-medium text-muted-foreground">Admin</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                location.pathname === item.href
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3 mb-4">
            {user?.picture ? (
              <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white dark:text-black" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">Administrateur</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {/* Dashboard */}
          {(currentPage === "admin" || currentPage === "") && (
            <>
              <h1 className="text-2xl font-semibold mb-8">Tableau de bord</h1>
              
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6"
                >
                  <p className="text-muted-foreground text-sm mb-1">Commandes</p>
                  <p className="text-3xl font-semibold">{stats?.total_orders || 0}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6"
                >
                  <p className="text-muted-foreground text-sm mb-1">En attente</p>
                  <p className="text-3xl font-semibold text-orange-500">
                    {stats?.pending_orders || 0}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6"
                >
                  <p className="text-muted-foreground text-sm mb-1">Produits</p>
                  <p className="text-3xl font-semibold">{stats?.total_products || 0}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6"
                >
                  <p className="text-muted-foreground text-sm mb-1">Revenus</p>
                  <p className="text-2xl font-semibold text-green-500">
                    {formatPrice(stats?.total_revenue || 0)}
                  </p>
                </motion.div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Commandes récentes</h2>
                  <Link to="/admin/orders" className="text-[#0071E3] text-sm font-medium">
                    Voir tout
                  </Link>
                </div>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 rounded-xl skeleton" />
                    ))}
                  </div>
                ) : orders.slice(0, 5).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucune commande
                  </p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => {
                      const status = getOrderStatusDisplay(order.order_status);
                      return (
                        <div
                          key={order.order_id}
                          className="flex items-center justify-between p-4 bg-[#F5F5F7] dark:bg-black/30 rounded-xl"
                        >
                          <div>
                            <p className="font-medium">{order.order_id}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.shipping?.full_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPrice(order.total)}</p>
                            <span className={cn("text-xs px-2 py-1 rounded-full", status.class)}>
                              {status.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Products Page */}
          {currentPage === "products" && (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <h1 className="text-2xl font-semibold">Produits</h1>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher..."
                      className="w-full h-10 pl-10 pr-4 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1C1C1E] outline-none"
                    />
                  </div>
                  <button
                    onClick={handleNewProduct}
                    className="flex items-center gap-2 px-4 h-10 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Ajouter</span>
                  </button>
                </div>
              </div>

              {/* Product Form Modal */}
              {showProductForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-[#1C1C1E] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                  >
                    <div className="sticky top-0 bg-white dark:bg-[#1C1C1E] border-b border-black/5 dark:border-white/5 p-6 flex items-center justify-between">
                      <h2 className="text-xl font-semibold">
                        {editingProduct ? "Modifier le Produit" : "Nouveau Produit"}
                      </h2>
                      <button
                        onClick={() => { setShowProductForm(false); resetProductForm(); }}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Nom du produit *</label>
                        <input
                          type="text"
                          required
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          className="w-full h-12 px-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent"
                          placeholder="iPhone 15 Pro Max"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Description courte *</label>
                        <input
                          type="text"
                          required
                          value={productForm.short_description}
                          onChange={(e) => setProductForm({ ...productForm, short_description: e.target.value })}
                          className="w-full h-12 px-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent"
                          placeholder="Puce A17 Pro. Titane. Caméra 48MP."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Description complète *</label>
                        <textarea
                          required
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent resize-none"
                          placeholder="Description détaillée du produit..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Prix (FCFA) *</label>
                          <input
                            type="number"
                            required
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent"
                            placeholder="1299000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Prix barré (optionnel)</label>
                          <input
                            type="number"
                            value={productForm.original_price}
                            onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent"
                            placeholder="1499000"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Catégorie *</label>
                          <select
                            value={productForm.category}
                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent"
                          >
                            <option value="electronique">Électronique</option>
                            <option value="electromenager">Électroménager</option>
                            <option value="decoration">Décoration & Mobilier</option>
                            <option value="beaute">Beauté & Bien-être</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Stock *</label>
                          <input
                            type="number"
                            required
                            value={productForm.stock}
                            onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent"
                            placeholder="10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">URLs des images (séparées par des virgules)</label>
                        <textarea
                          value={productForm.images}
                          onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                          rows={2}
                          className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent resize-none text-sm"
                          placeholder="https://exemple.com/image1.jpg, https://exemple.com/image2.jpg"
                        />
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={productForm.featured}
                            onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                            className="w-5 h-5 rounded"
                          />
                          <span className="text-sm">Mis en avant</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={productForm.is_new}
                            onChange={(e) => setProductForm({ ...productForm, is_new: e.target.checked })}
                            className="w-5 h-5 rounded"
                          />
                          <span className="text-sm">Nouveau</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={productForm.is_promo}
                            onChange={(e) => setProductForm({ ...productForm, is_promo: e.target.checked })}
                            className="w-5 h-5 rounded"
                          />
                          <span className="text-sm">En promo</span>
                        </label>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => { setShowProductForm(false); resetProductForm(); }}
                          className="flex-1 h-12 border border-black/10 dark:border-white/10 rounded-xl font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={productFormLoading}
                          className="flex-1 h-12 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {productFormLoading 
                            ? (editingProduct ? "Modification..." : "Création...") 
                            : (editingProduct ? "Enregistrer les modifications" : "Créer le produit")
                          }
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl overflow-hidden">
                {loading ? (
                  <div className="p-6 space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 rounded-xl skeleton" />
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-12">
                    Aucun produit trouvé
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table-lumina">
                      <thead>
                        <tr>
                          <th>Produit</th>
                          <th>Catégorie</th>
                          <th>Prix</th>
                          <th>Stock</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => (
                          <tr key={product.product_id}>
                            <td>
                              <div className="flex items-center gap-3">
                                <img
                                  src={product.images?.[0] || "/placeholder.jpg"}
                                  alt={product.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div>
                                  <p className="font-medium line-clamp-1">{product.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {product.product_id}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td>{getCategoryName(product.category)}</td>
                            <td className="font-medium">{formatPrice(product.price)}</td>
                            <td>
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                product.stock > 10 ? "bg-green-100 text-green-700" :
                                product.stock > 0 ? "bg-orange-100 text-orange-700" :
                                "bg-red-100 text-red-700"
                              )}>
                                {product.stock}
                              </span>
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 rounded-lg"
                                  title="Modifier"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <Link
                                  to={`/product/${product.product_id}`}
                                  className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
                                  title="Voir"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => handleDeleteProduct(product.product_id)}
                                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Orders Page */}
          {currentPage === "orders" && (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <h1 className="text-2xl font-semibold">Commandes</h1>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1C1C1E] outline-none"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl overflow-hidden">
                {loading ? (
                  <div className="p-6 space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-20 rounded-xl skeleton" />
                    ))}
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-12">
                    Aucune commande trouvée
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table-lumina">
                      <thead>
                        <tr>
                          <th>Commande</th>
                          <th>Client</th>
                          <th>Total</th>
                          <th>Paiement</th>
                          <th>Statut</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => {
                          const orderStatus = getOrderStatusDisplay(order.order_status);
                          const paymentStatus = getPaymentStatusDisplay(order.payment_status);
                          return (
                            <tr key={order.order_id}>
                              <td>
                                <p className="font-medium">{order.order_id}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(order.created_at)}
                                </p>
                              </td>
                              <td>
                                <p className="font-medium">{order.shipping?.full_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {order.shipping?.phone}
                                </p>
                              </td>
                              <td className="font-medium">{formatPrice(order.total)}</td>
                              <td>
                                <select
                                  value={order.payment_status}
                                  onChange={(e) => handleUpdateOrderStatus(order.order_id, null, e.target.value)}
                                  className="text-xs px-2 py-1 rounded-lg bg-transparent border border-black/10 dark:border-white/10"
                                >
                                  <option value="pending">En attente</option>
                                  <option value="paid">Payé</option>
                                  <option value="failed">Échoué</option>
                                </select>
                              </td>
                              <td>
                                <select
                                  value={order.order_status}
                                  onChange={(e) => handleUpdateOrderStatus(order.order_id, e.target.value, null)}
                                  className="text-xs px-2 py-1 rounded-lg bg-transparent border border-black/10 dark:border-white/10"
                                >
                                  <option value="pending">En attente</option>
                                  <option value="processing">En traitement</option>
                                  <option value="shipped">Expédié</option>
                                  <option value="delivered">Livré</option>
                                  <option value="cancelled">Annulé</option>
                                </select>
                              </td>
                              <td>
                                <div className="flex items-center gap-1">
                                  <Link
                                    to={`/order/${order.order_id}`}
                                    className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg inline-flex"
                                    title="Voir la commande"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                  <a
                                    href={`${API_URL}/api/orders/${order.order_id}/invoice`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 rounded-lg inline-flex"
                                    title="Télécharger la facture"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </a>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Users Page */}
          {currentPage === "users" && (
            <>
              <h1 className="text-2xl font-semibold mb-8">Utilisateurs</h1>

              <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl overflow-hidden">
                {loading ? (
                  <div className="p-6 space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 rounded-xl skeleton" />
                    ))}
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-muted-foreground text-center py-12">
                    Aucun utilisateur
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table-lumina">
                      <thead>
                        <tr>
                          <th>Utilisateur</th>
                          <th>Email</th>
                          <th>Téléphone</th>
                          <th>Rôle</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.user_id}>
                            <td>
                              <div className="flex items-center gap-3">
                                {u.picture ? (
                                  <img
                                    src={u.picture}
                                    alt={u.name}
                                    className="w-10 h-10 rounded-full"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-black/10 dark:bg-white/10 rounded-full flex items-center justify-center">
                                    <Users className="w-5 h-5" />
                                  </div>
                                )}
                                <span className="font-medium">{u.name}</span>
                              </div>
                            </td>
                            <td>{u.email}</td>
                            <td>{u.phone || "-"}</td>
                            <td>
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium capitalize",
                                u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                              )}>
                                {u.role}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
