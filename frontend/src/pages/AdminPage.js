import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
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
  Mail,
  Upload,
  Image as ImageIcon,
  Loader2,
  BarChart3,
  Tag,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Palette,
  Ruler,
  Building2,
  ChevronDown,
  GripVertical,
} from "lucide-react";
import { formatPrice, formatDate, getOrderStatusDisplay, getPaymentStatusDisplay, getCategoryName } from "../lib/utils";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import EmailCampaignsPage from "./EmailCampaignsPage";
import FlashSalesAdminPage from "./FlashSalesAdminPage";
import AnalyticsDashboard from "./AnalyticsDashboard";
import PromoCodesAdminPage from "./PromoCodesAdminPage";
import AbandonedCartsAdminPage from "./AbandonedCartsAdminPage";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const menuItems = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, href: "/admin" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { id: "products", label: "Produits", icon: Package, href: "/admin/products" },
  { id: "flash-sales", label: "Ventes Flash", icon: Zap, href: "/admin/flash-sales" },
  { id: "orders", label: "Commandes", icon: ShoppingCart, href: "/admin/orders" },
  { id: "users", label: "Utilisateurs", icon: Users, href: "/admin/users" },
  { id: "promo-codes", label: "Codes Promo", icon: Tag, href: "/admin/promo-codes" },
  { id: "abandoned-carts", label: "Paniers abandonnés", icon: ShoppingBag, href: "/admin/abandoned-carts" },
  { id: "email", label: "Campagnes Email", icon: Mail, href: "/admin/email" },
];

const categories = [
  { id: "electronique", name: "Électronique" },
  { id: "electromenager", name: "Électroménager" },
  { id: "decoration", name: "Décoration & Mobilier" },
  { id: "beaute", name: "Beauté & Bien-être" },
  { id: "automobile", name: "Automobile" },
];

const defaultColors = [
  { name: "Noir", value: "#000000" },
  { name: "Blanc", value: "#FFFFFF" },
  { name: "Gris", value: "#808080" },
  { name: "Rouge", value: "#FF0000" },
  { name: "Bleu", value: "#0000FF" },
  { name: "Vert", value: "#00FF00" },
  { name: "Jaune", value: "#FFFF00" },
  { name: "Rose", value: "#FFC0CB" },
  { name: "Or", value: "#FFD700" },
  { name: "Argent", value: "#C0C0C0" },
];

const defaultSizes = ["XS", "S", "M", "L", "XL", "XXL", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];

export default function AdminPage() {
  const { user, token, logout, isAdmin, isAuthenticated } = useAuth();
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
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormLoading, setProductFormLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState("general");
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    short_description: "",
    price: "",
    original_price: "",
    category: "electronique",
    subcategory: "",
    images: [],
    stock: "",
    featured: false,
    is_new: false,
    is_promo: false,
    brand: "",
    colors: [],
    sizes: [],
    specs: {},
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
      images: [],
      stock: "",
      featured: false,
      is_new: false,
      is_promo: false,
      brand: "",
      colors: [],
      sizes: [],
      specs: {},
    });
    setEditingProduct(null);
    setActiveFormTab("general");
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const newImages = [...productForm.images];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${API_URL}/api/upload/image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          newImages.push(response.data.url);
        }
      } catch (error) {
        toast.error(`Erreur upload: ${error.response?.data?.detail || 'Erreur'}`);
      }
    }

    setProductForm({ ...productForm, images: newImages });
    setUploadingImage(false);
  };

  // Remove image from list
  const handleRemoveImage = (index) => {
    const newImages = productForm.images.filter((_, i) => i !== index);
    setProductForm({ ...productForm, images: newImages });
  };

  // Toggle color selection
  const handleColorToggle = (colorName) => {
    const newColors = productForm.colors.includes(colorName)
      ? productForm.colors.filter(c => c !== colorName)
      : [...productForm.colors, colorName];
    setProductForm({ ...productForm, colors: newColors });
  };

  // Toggle size selection
  const handleSizeToggle = (size) => {
    const newSizes = productForm.sizes.includes(size)
      ? productForm.sizes.filter(s => s !== size)
      : [...productForm.sizes, size];
    setProductForm({ ...productForm, sizes: newSizes });
  };

  // Add custom spec
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  
  const handleAddSpec = () => {
    if (newSpecKey && newSpecValue) {
      setProductForm({
        ...productForm,
        specs: { ...productForm.specs, [newSpecKey]: newSpecValue }
      });
      setNewSpecKey("");
      setNewSpecValue("");
    }
  };

  const handleRemoveSpec = (key) => {
    const newSpecs = { ...productForm.specs };
    delete newSpecs[key];
    setProductForm({ ...productForm, specs: newSpecs });
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
      images: product.images || [],
      stock: product.stock?.toString() || "",
      featured: product.featured || false,
      is_new: product.is_new || false,
      is_promo: product.is_promo || false,
      brand: product.brand || "",
      colors: product.colors || [],
      sizes: product.sizes || [],
      specs: product.specs || {},
    });
    setShowProductForm(true);
    setActiveFormTab("general");
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
      const headers = { Authorization: `Bearer ${token}` };

      if (currentPage === "admin" || currentPage === "") {
        const response = await axios.get(`${API_URL}/api/admin/stats`, { headers });
        setStats(response.data);
      }

      if (currentPage === "products" || currentPage === "admin") {
        const response = await axios.get(`${API_URL}/api/products?limit=50`);
        setProducts(response.data);
      }

      if (currentPage === "orders" || currentPage === "admin") {
        const response = await axios.get(`${API_URL}/api/admin/orders`, { headers });
        // Handle both array and object response formats
        const ordersData = Array.isArray(response.data) ? response.data : (response.data.orders || []);
        setOrders(ordersData);
      }

      if (currentPage === "users") {
        const response = await axios.get(`${API_URL}/api/admin/users`, { headers });
        // Handle both array and object response formats
        const usersData = Array.isArray(response.data) ? response.data : (response.data.users || []);
        setUsers(usersData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductFormLoading(true);

    try {
      const productData = {
        ...productForm,
        price: parseInt(productForm.price),
        original_price: productForm.original_price ? parseInt(productForm.original_price) : null,
        stock: parseInt(productForm.stock) || 0,
      };

      if (editingProduct) {
        await axios.put(
          `${API_URL}/api/admin/products/${editingProduct.product_id}`,
          productData,
          { withCredentials: true }
        );
        toast.success("Produit modifié avec succès");
      } else {
        await axios.post(
          `${API_URL}/api/admin/products`,
          productData,
          { withCredentials: true }
        );
        toast.success("Produit créé avec succès");
      }

      setShowProductForm(false);
      resetProductForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de la sauvegarde");
    } finally {
      setProductFormLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;

    try {
      await axios.delete(`${API_URL}/api/admin/products/${productId}`, {
        withCredentials: true,
      });
      toast.success("Produit supprimé");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success("Statut mis à jour");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  // Filter products by search
  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render sidebar
  const Sidebar = () => (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#1C1C1E] border-r border-black/5 dark:border-white/5 transform transition-transform duration-300 lg:translate-x-0",
      sidebarOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-black/5 dark:border-white/5">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_premium-senegal/artifacts/xs5g0hsy_IMG_0613.png" 
              alt="YAMA+" 
              className="h-12 w-auto"
            />
          </Link>
          <p className="text-xs text-muted-foreground mt-2">Administration</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = currentPage === item.id || 
              (currentPage === "admin" && item.id === "dashboard");
            return (
              <Link
                key={item.id}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 mb-3">
            <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center">
              <span className="text-white dark:text-black font-bold text-sm">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  );

  // Stats Card Component
  const StatsCard = ({ icon: Icon, title, value, change, trend, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-black/5 dark:border-white/5"
    >
      <div className="flex items-start justify-between">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", color)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            trend === "up" ? "text-green-500" : "text-red-500"
          )}>
            {trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {change}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold mt-4">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>
    </motion.div>
  );

  // Render Dashboard
  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={DollarSign}
          title="Chiffre d'affaires"
          value={formatPrice(stats?.total_revenue || 0)}
          change="+12%"
          trend="up"
          color="bg-green-500"
        />
        <StatsCard
          icon={ShoppingCart}
          title="Commandes"
          value={stats?.total_orders || 0}
          change="+8%"
          trend="up"
          color="bg-blue-500"
        />
        <StatsCard
          icon={Package}
          title="Produits"
          value={stats?.total_products || 0}
          color="bg-purple-500"
        />
        <StatsCard
          icon={Users}
          title="Clients"
          value={stats?.total_users || 0}
          change="+5%"
          trend="up"
          color="bg-orange-500"
        />
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden">
          <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Commandes récentes</h2>
            <Link to="/admin/orders" className="text-sm text-primary font-medium hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-black/5 dark:divide-white/5">
            {(Array.isArray(orders) ? orders : []).slice(0, 5).map((order) => (
              <div key={order.order_id} className="p-4 flex items-center gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  order.status === "delivered" ? "bg-green-100 text-green-600" :
                  order.status === "processing" ? "bg-blue-100 text-blue-600" :
                  order.status === "shipped" ? "bg-purple-100 text-purple-600" :
                  "bg-gray-100 text-gray-600"
                )}>
                  {order.status === "delivered" ? <CheckCircle className="w-5 h-5" /> :
                   order.status === "processing" ? <Clock className="w-5 h-5" /> :
                   <Package className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{order.order_id}</p>
                  <p className="text-xs text-muted-foreground">{order.shipping?.full_name || order.customer_name || 'Client'}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{formatPrice(order.total)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                </div>
              </div>
            ))}
            {(Array.isArray(orders) ? orders : []).length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Aucune commande récente
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/5 p-6">
          <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
          <div className="space-y-3">
            <button
              onClick={handleNewProduct}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Ajouter un produit</span>
            </button>
            <Link
              to="/admin/orders"
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium">Gérer les commandes</span>
            </Link>
            <Link
              to="/admin/flash-sales"
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <Zap className="w-5 h-5" />
              <span className="font-medium">Ventes Flash</span>
            </Link>
            <Link
              to="/admin/promo-codes"
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <Tag className="w-5 h-5" />
              <span className="font-medium">Codes Promo</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Products
  const renderProducts = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produits</h1>
          <p className="text-muted-foreground">{products.length} produits au total</p>
        </div>
        <button
          onClick={handleNewProduct}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Ajouter un produit
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5">
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Produit</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Catégorie</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Prix</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Stock</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Statut</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {filteredProducts.map((product) => (
                <tr key={product.product_id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                        <img
                          src={product.images?.[0] || "/placeholder.jpg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate max-w-[200px]">{product.name}</p>
                        {product.brand && (
                          <p className="text-xs text-muted-foreground">{product.brand}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-xs font-medium">
                      {getCategoryName(product.category)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-semibold text-sm">{formatPrice(product.price)}</p>
                      {product.original_price && product.original_price > product.price && (
                        <p className="text-xs text-muted-foreground line-through">{formatPrice(product.original_price)}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-xs font-medium",
                      product.stock > 10 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      product.stock > 0 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                      {product.stock} en stock
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {product.is_new && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold">
                          NEW
                        </span>
                      )}
                      {product.is_promo && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold">
                          PROMO
                        </span>
                      )}
                      {product.colors?.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-[10px] font-bold">
                          {product.colors.length} couleurs
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/produit/${product.product_id}`}
                        className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        title="Voir"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product.product_id)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors"
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
        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            Aucun produit trouvé
          </div>
        )}
      </div>
    </div>
  );

  // Render Orders
  const renderOrders = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Commandes</h1>
        <p className="text-muted-foreground">{orders.length} commandes au total</p>
      </div>

      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5">
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Commande</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Client</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Total</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Statut</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Paiement</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Date</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {orders.map((order) => (
                <tr key={order.order_id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <p className="font-mono text-sm font-medium">{order.order_id}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-sm">{order.shipping?.full_name || order.customer_name || '-'}</p>
                    <p className="text-xs text-muted-foreground">{order.shipping?.phone || order.customer_email || '-'}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold">{formatPrice(order.total)}</p>
                  </td>
                  <td className="p-4">
                    <select
                      value={order.order_status || order.status || 'pending'}
                      onChange={(e) => handleOrderStatusUpdate(order.order_id, e.target.value)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold border-0 cursor-pointer",
                        (order.order_status || order.status) === "delivered" ? "bg-green-100 text-green-700" :
                        (order.order_status || order.status) === "shipped" ? "bg-purple-100 text-purple-700" :
                        (order.order_status || order.status) === "processing" ? "bg-blue-100 text-blue-700" :
                        (order.order_status || order.status) === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      )}
                    >
                      <option value="pending">En attente</option>
                      <option value="processing">En préparation</option>
                      <option value="shipped">Expédié</option>
                      <option value="delivered">Livré</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-xs font-medium",
                      order.payment_status === "paid" ? "bg-green-100 text-green-700" :
                      order.payment_status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {getPaymentStatusDisplay(order.payment_status)?.label || order.payment_status}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-sm">{formatDate(order.created_at)}</p>
                  </td>
                  <td className="p-4">
                    <Link
                      to={`/order/${order.order_id}`}
                      className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors inline-flex"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            Aucune commande
          </div>
        )}
      </div>
    </div>
  );

  // Render Users
  const renderUsers = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <p className="text-muted-foreground">{users.length} utilisateurs inscrits</p>
      </div>

      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5">
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Utilisateur</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Email</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Rôle</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Inscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {users.map((u) => (
                <tr key={u.user_id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                        <span className="text-white dark:text-black font-bold text-sm">
                          {u.name?.[0]?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <p className="font-medium">{u.name}</p>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{u.email}</td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-xs font-bold",
                      u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                    )}>
                      {u.role === "admin" ? "Admin" : "Client"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Product Form Modal
  const ProductFormModal = () => (
    <AnimatePresence>
      {showProductForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8"
          onClick={() => setShowProductForm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-3xl mx-4 bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {editingProduct ? "Modifier le produit" : "Nouveau produit"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Remplissez les informations du produit
                </p>
              </div>
              <button
                onClick={() => setShowProductForm(false)}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-black/5 dark:border-white/5 px-6">
              {[
                { id: "general", label: "Général", icon: FileText },
                { id: "media", label: "Images", icon: ImageIcon },
                { id: "variants", label: "Options", icon: Palette },
                { id: "specs", label: "Spécifications", icon: Ruler },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFormTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                    activeFormTab === tab.id
                      ? "border-black dark:border-white text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleProductSubmit}>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {/* General Tab */}
                {activeFormTab === "general" && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom du produit *</label>
                      <input
                        type="text"
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 outline-none"
                        placeholder="Ex: iPhone 15 Pro Max"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Catégorie *</label>
                        <select
                          required
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 outline-none"
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Marque</label>
                        <input
                          type="text"
                          value={productForm.brand}
                          onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 outline-none"
                          placeholder="Ex: Apple, Samsung, Nike..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description courte *</label>
                      <input
                        type="text"
                        required
                        value={productForm.short_description}
                        onChange={(e) => setProductForm({ ...productForm, short_description: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 outline-none"
                        placeholder="Résumé en une phrase"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description complète *</label>
                      <textarea
                        required
                        rows={4}
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 outline-none resize-none"
                        placeholder="Description détaillée du produit..."
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Prix (FCFA) *</label>
                        <input
                          type="number"
                          required
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 outline-none"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Ancien prix</label>
                        <input
                          type="number"
                          value={productForm.original_price}
                          onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 outline-none"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Stock *</label>
                        <input
                          type="number"
                          required
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 outline-none"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={productForm.is_new}
                          onChange={(e) => setProductForm({ ...productForm, is_new: e.target.checked })}
                          className="w-5 h-5 rounded border-black/20 dark:border-white/20"
                        />
                        <span className="text-sm font-medium">Nouveau</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={productForm.is_promo}
                          onChange={(e) => setProductForm({ ...productForm, is_promo: e.target.checked })}
                          className="w-5 h-5 rounded border-black/20 dark:border-white/20"
                        />
                        <span className="text-sm font-medium">En promotion</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={productForm.featured}
                          onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                          className="w-5 h-5 rounded border-black/20 dark:border-white/20"
                        />
                        <span className="text-sm font-medium">Mis en avant</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Media Tab */}
                {activeFormTab === "media" && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-3">Images du produit</label>
                      <div className="grid grid-cols-3 gap-3">
                        {productForm.images.map((img, index) => (
                          <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 group">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            {index === 0 && (
                              <span className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/70 text-white text-xs font-medium">
                                Principal
                              </span>
                            )}
                          </div>
                        ))}
                        <label className="aspect-square rounded-xl border-2 border-dashed border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40 cursor-pointer flex flex-col items-center justify-center transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          {uploadingImage ? (
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                              <span className="text-xs text-muted-foreground">Ajouter</span>
                            </>
                          )}
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        La première image sera l'image principale. Formats: JPG, PNG, WebP
                      </p>
                    </div>
                  </div>
                )}

                {/* Variants Tab */}
                {activeFormTab === "variants" && (
                  <div className="space-y-6">
                    {/* Colors */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-3">
                        <Palette className="w-4 h-4" />
                        Couleurs disponibles
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {defaultColors.map((color) => (
                          <button
                            key={color.name}
                            type="button"
                            onClick={() => handleColorToggle(color.name)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                              productForm.colors.includes(color.name)
                                ? "border-black dark:border-white bg-black/5 dark:bg-white/5"
                                : "border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30"
                            )}
                          >
                            <div
                              className="w-5 h-5 rounded-full border border-black/20"
                              style={{ backgroundColor: color.value }}
                            />
                            <span className="text-sm">{color.name}</span>
                            {productForm.colors.includes(color.name) && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sizes */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-3">
                        <Ruler className="w-4 h-4" />
                        Tailles disponibles
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {defaultSizes.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleSizeToggle(size)}
                            className={cn(
                              "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                              productForm.sizes.includes(size)
                                ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black"
                                : "border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30"
                            )}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selected Options Summary */}
                    {(productForm.colors.length > 0 || productForm.sizes.length > 0) && (
                      <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5">
                        <p className="text-sm font-medium mb-2">Options sélectionnées:</p>
                        {productForm.colors.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Couleurs: {productForm.colors.join(", ")}
                          </p>
                        )}
                        {productForm.sizes.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Tailles: {productForm.sizes.join(", ")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Specs Tab */}
                {activeFormTab === "specs" && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-3">Spécifications techniques</label>
                      
                      {/* Existing specs */}
                      <div className="space-y-2 mb-4">
                        {Object.entries(productForm.specs).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2 p-3 rounded-xl bg-black/5 dark:bg-white/5">
                            <span className="font-medium text-sm flex-1">{key}</span>
                            <span className="text-sm text-muted-foreground flex-1">{value}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSpec(key)}
                              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add new spec */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSpecKey}
                          onChange={(e) => setNewSpecKey(e.target.value)}
                          placeholder="Caractéristique (ex: Poids)"
                          className="flex-1 px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-sm"
                        />
                        <input
                          type="text"
                          value={newSpecValue}
                          onChange={(e) => setNewSpecValue(e.target.value)}
                          placeholder="Valeur (ex: 200g)"
                          className="flex-1 px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleAddSpec}
                          className="px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-sm font-medium"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-muted-foreground mt-3">
                        Exemples: Poids, Dimensions, Matière, Capacité, Puissance, etc.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-black/5 dark:border-white/5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="px-6 py-2.5 rounded-xl border border-black/10 dark:border-white/10 font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={productFormLoading}
                  className="px-6 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {productFormLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingProduct ? "Enregistrer" : "Créer le produit"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render content based on current page
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    switch (currentPage) {
      case "admin":
      case "dashboard":
        return renderDashboard();
      case "products":
        return renderProducts();
      case "orders":
        return renderOrders();
      case "users":
        return renderUsers();
      case "analytics":
        return <AnalyticsDashboard />;
      case "flash-sales":
        return <FlashSalesAdminPage />;
      case "email":
        return <EmailCampaignsPage />;
      case "promo-codes":
        return <PromoCodesAdminPage />;
      case "abandoned-carts":
        return <AbandonedCartsAdminPage />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-black">
      <Sidebar />
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-[#1C1C1E] border-b border-black/5 dark:border-white/5 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
        >
          <Menu className="w-6 h-6" />
        </button>
        <img 
          src="https://customer-assets.emergentagent.com/job_premium-senegal/artifacts/xs5g0hsy_IMG_0613.png" 
          alt="YAMA+" 
          className="h-10 w-auto"
        />
        <div className="w-10" />
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-8">
          {renderContent()}
        </div>
      </main>

      {/* Product Form Modal */}
      <ProductFormModal />
    </div>
  );
}
