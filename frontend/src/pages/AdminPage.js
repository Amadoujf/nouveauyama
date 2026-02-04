import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import ProductFormModal from "../components/ProductFormModal";
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
  Sparkles,
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
    is_on_order: false,
    order_delivery_days: "",
  });

  // Stable form field update function to prevent re-renders
  const updateFormField = useCallback((field, value) => {
    setProductForm(prev => ({ ...prev, [field]: value }));
  }, []);

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
      is_on_order: false,
      order_delivery_days: "",
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

  // AI Image Analysis for product creation
  const handleAIAnalyzeImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image trop grande (max 10MB)");
      return;
    }

    setAnalyzingImage(true);
    toast.info("🤖 Analyse IA en cours...");

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_URL}/api/admin/analyze-product-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const product = response.data.product;
        
        // Update form with AI-extracted data
        setProductForm(prev => ({
          ...prev,
          name: product.name || prev.name,
          description: product.description || prev.description,
          short_description: product.short_description || prev.short_description,
          category: product.category || prev.category,
          brand: product.brand || prev.brand,
          price: product.estimated_price?.toString() || prev.price,
          colors: product.colors?.length > 0 ? product.colors : prev.colors,
          is_new: product.is_new ?? prev.is_new,
        }));

        // Upload the analyzed image
        const imageFormData = new FormData();
        imageFormData.append('file', file);
        
        try {
          const uploadResponse = await axios.post(`${API_URL}/api/upload/image`, imageFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            }
          });

          if (uploadResponse.data.success) {
            setProductForm(prev => ({
              ...prev,
              images: [...prev.images, uploadResponse.data.url]
            }));
          }
        } catch (uploadErr) {
          console.error("Upload error:", uploadErr);
        }

        const confidenceEmoji = product.confidence === 'high' ? '🎯' : product.confidence === 'medium' ? '✅' : '⚠️';
        toast.success(`${confidenceEmoji} Produit analysé avec succès !`);
        
        if (product.suggested_tags?.length > 0) {
          toast.info(`Tags suggérés: ${product.suggested_tags.join(', ')}`);
        }
      } else {
        toast.error(response.data.error || "Erreur d'analyse");
      }
    } catch (error) {
      console.error("AI analysis error:", error);
      toast.error(error.response?.data?.detail || "Erreur lors de l'analyse IA");
    } finally {
      setAnalyzingImage(false);
    }
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
      is_on_order: product.is_on_order || false,
      order_delivery_days: product.order_delivery_days?.toString() || "",
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
      // Validate minimum required fields
      if (!productForm.name || !productForm.name.trim()) {
        toast.error("Le nom du produit est obligatoire");
        setProductFormLoading(false);
        return;
      }

      if (!productForm.price || parseInt(productForm.price) <= 0) {
        toast.error("Le prix doit être supérieur à 0");
        setProductFormLoading(false);
        return;
      }

      // Add default image if no images provided
      const images = productForm.images.length > 0 
        ? productForm.images 
        : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"];

      const productData = {
        name: productForm.name.trim(),
        description: productForm.description?.trim() || productForm.name.trim(),
        short_description: productForm.short_description?.trim() || "",
        price: parseInt(productForm.price) || 0,
        original_price: productForm.original_price ? parseInt(productForm.original_price) : null,
        category: productForm.category || "electronique",
        subcategory: productForm.subcategory || null,
        images,
        stock: parseInt(productForm.stock) || 0,
        featured: productForm.featured || false,
        is_new: productForm.is_new || false,
        is_promo: productForm.is_promo || false,
        brand: productForm.brand?.trim() || null,
        colors: productForm.colors || [],
        sizes: productForm.sizes || [],
        specs: productForm.specs || {},
        is_on_order: productForm.is_on_order || false,
        order_delivery_days: productForm.order_delivery_days ? parseInt(productForm.order_delivery_days) : null,
      };

      const headers = { Authorization: `Bearer ${token}` };

      if (editingProduct) {
        await axios.put(
          `${API_URL}/api/products/${editingProduct.product_id}`,
          productData,
          { headers }
        );
        toast.success("Produit modifié avec succès");
      } else {
        await axios.post(
          `${API_URL}/api/products`,
          productData,
          { headers }
        );
        toast.success("Produit créé avec succès");
      }

      setShowProductForm(false);
      resetProductForm();
      fetchData();
    } catch (error) {
      console.error("Product submit error:", error);
      toast.error(error.response?.data?.detail || "Erreur lors de la sauvegarde");
    } finally {
      setProductFormLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/api/products/${productId}`, { headers });
      toast.success("Produit supprimé");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(
        `${API_URL}/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers }
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
  const renderProductFormModal = () => (
    <ProductFormModal
      isOpen={showProductForm}
      onClose={() => {
        setShowProductForm(false);
        setEditingProduct(null);
      }}
      editingProduct={editingProduct}
      token={token}
      onSuccess={fetchData}
    />
  );

  // Render content based on current page  // Render content based on current page
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
