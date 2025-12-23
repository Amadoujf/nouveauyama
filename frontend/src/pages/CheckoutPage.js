import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  ChevronRight,
  Truck,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  MessageCircle,
  Tag,
  X,
  Loader2,
  FileText,
  Download,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import {
  formatPrice,
  generateWhatsAppLink,
  generateOrderMessage,
} from "../lib/utils";
import { toast } from "sonner";
import { cn } from "../lib/utils";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const WHATSAPP_NUMBER = "+221770000000";

const paymentMethods = [
  { 
    id: "wave", 
    name: "Wave", 
    logo: "https://customer-assets.emergentagent.com/job_senegal-shop-4/artifacts/ky9m7h4h_IMG_0626.jpeg"
  },
  { 
    id: "orange_money", 
    name: "Orange Money", 
    color: "bg-[#FF6600]",
    textColor: "text-white",
    letter: "OM"
  },
  { 
    id: "card", 
    name: "Carte bancaire", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png",
    logo2: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png"
  },
  { 
    id: "cash", 
    name: "Paiement à la livraison", 
    icon: "💵" 
  },
];

const regions = [
  "Dakar",
  "Thiès",
  "Saint-Louis",
  "Diourbel",
  "Fatick",
  "Kaolack",
  "Kolda",
  "Louga",
  "Matam",
  "Tambacounda",
  "Ziguinchor",
  "Kaffrine",
  "Kédougou",
  "Sédhiou",
];

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  
  const [formData, setFormData] = useState({
    full_name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: "",
    city: "",
    region: "Dakar",
    notes: "",
    payment_method: "wave",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: user.name || prev.full_name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const shippingCost = formData.region === "Dakar" ? 2500 : 3500;
  const subtotal = cart.total;
  const discount = appliedPromo ? Math.round(subtotal * (appliedPromo.discount_percent / 100)) : 0;
  const total = subtotal - discount + shippingCost;

  // Apply promo code
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    
    setPromoLoading(true);
    setPromoError("");
    
    try {
      const response = await axios.get(`${API_URL}/api/newsletter/validate/${promoCode.trim()}`);
      setAppliedPromo({
        code: promoCode.trim(),
        discount_percent: response.data.discount_percent,
      });
      toast.success(`Code promo appliqué ! -${response.data.discount_percent}%`);
    } catch (error) {
      setPromoError(error.response?.data?.detail || "Code promo invalide");
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep1 = () => {
    if (!formData.full_name || !formData.phone || !formData.address || !formData.city) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep1()) return;
    
    setLoading(true);
    
    try {
      const orderData = {
        items: cart.items.map((item) => ({
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        shipping: {
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          region: formData.region,
          notes: formData.notes,
        },
        payment_method: formData.payment_method,
        subtotal,
        shipping_cost: shippingCost,
        discount,
        total,
        promo_code: appliedPromo?.code || null,
      };

      const response = await axios.post(`${API_URL}/api/orders`, orderData, {
        withCredentials: true,
      });

      const newOrderId = response.data.order_id;

      // For Wave, Orange Money, or Card payments - redirect to PayTech
      if (['wave', 'orange_money', 'card'].includes(formData.payment_method)) {
        try {
          const currentUrl = window.location.origin;
          const paytechResponse = await axios.post(`${API_URL}/api/payments/paytech/initiate`, {
            order_id: newOrderId,
            success_url: `${currentUrl}/checkout?order_id=${newOrderId}&payment=success`,
            cancel_url: `${currentUrl}/checkout?order_id=${newOrderId}&payment=cancel`,
          });

          if (paytechResponse.data.success && paytechResponse.data.checkout_url) {
            // Redirect to PayTech payment page
            window.location.href = paytechResponse.data.checkout_url;
            return;
          }
        } catch (paytechError) {
          console.error("PayTech error:", paytechError);
          // If PayTech fails, still show order confirmation but notify about payment
          toast.error(paytechError.response?.data?.detail || "Le paiement en ligne n'est pas disponible. Veuillez payer à la livraison.");
        }
      }

      // For cash on delivery or if PayTech failed
      setOrderId(newOrderId);
      setOrderComplete(true);
      clearCart();
      toast.success("Commande passée avec succès !");
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Erreur lors de la commande. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Handle payment callback from PayTech
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const orderIdFromUrl = urlParams.get('order_id');

    if (paymentStatus && orderIdFromUrl) {
      if (paymentStatus === 'success') {
        setOrderId(orderIdFromUrl);
        setOrderComplete(true);
        clearCart();
        toast.success("Paiement effectué avec succès !");
        // Clean URL
        window.history.replaceState({}, '', '/checkout');
      } else if (paymentStatus === 'cancel') {
        toast.error("Paiement annulé. Votre commande est en attente de paiement.");
        setOrderId(orderIdFromUrl);
        setOrderComplete(true);
        clearCart();
        window.history.replaceState({}, '', '/checkout');
      }
    }
  }, [clearCart]);

  const handleWhatsAppOrder = () => {
    const message = generateOrderMessage(cart.items, total, {
      full_name: formData.full_name,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      region: formData.region,
      notes: formData.notes,
    });
    window.open(generateWhatsAppLink(WHATSAPP_NUMBER, message), "_blank");
  };

  if (cart.items.length === 0 && !orderComplete) {
    return (
      <main className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Votre panier est vide</h1>
          <Link to="/" className="btn-primary">
            Continuer mes achats
          </Link>
        </div>
      </main>
    );
  }

  if (orderComplete) {
    return (
      <main className="min-h-screen pt-20 flex items-center justify-center bg-[#F5F5F7] dark:bg-[#0B0B0B]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-semibold mb-4">Commande confirmée !</h1>
          <p className="text-muted-foreground mb-6">
            Merci pour votre commande. Vous recevrez une confirmation par WhatsApp.
          </p>
          <p className="font-medium text-lg mb-8">
            N° de commande : <span className="text-[#0071E3]">{orderId}</span>
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={`${API_URL}/api/orders/${orderId}/invoice`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary justify-center flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Télécharger ma facture
            </a>
            <Link to="/" className="btn-secondary justify-center">
              Continuer mes achats
            </Link>
            {isAuthenticated && (
              <Link to="/account/orders" className="text-[#0071E3] font-medium text-center">
                Voir mes commandes
              </Link>
            )}
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20 bg-[#F5F5F7] dark:bg-[#0B0B0B]" data-testid="checkout-page">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-[#1C1C1E] py-4">
        <div className="container-lumina">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Commande</span>
          </nav>
        </div>
      </div>

      <div className="container-lumina py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Shipping Info */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 md:p-8 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center font-semibold">
                    1
                  </div>
                  <h2 className="text-xl font-semibold">Informations de livraison</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      className="w-full h-12 px-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:border-black dark:focus:border-white outline-none transition-colors"
                      data-testid="checkout-name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+221 77 XXX XX XX"
                      className="w-full h-12 px-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:border-black dark:focus:border-white outline-none transition-colors"
                      data-testid="checkout-phone"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full h-12 px-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:border-black dark:focus:border-white outline-none transition-colors"
                      data-testid="checkout-email"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Adresse *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="Rue, quartier, point de repère"
                      className="w-full h-12 px-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:border-black dark:focus:border-white outline-none transition-colors"
                      data-testid="checkout-address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Ville *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full h-12 px-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:border-black dark:focus:border-white outline-none transition-colors"
                      data-testid="checkout-city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Région *</label>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="w-full h-12 px-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:border-black dark:focus:border-white outline-none transition-colors"
                      data-testid="checkout-region"
                    >
                      {regions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Notes (optionnel)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Instructions de livraison supplémentaires"
                      className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:border-black dark:focus:border-white outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center font-semibold">
                    2
                  </div>
                  <h2 className="text-xl font-semibold">Mode de paiement</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                        formData.payment_method === method.id
                          ? "border-black dark:border-white bg-black/5 dark:bg-white/5"
                          : "border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30"
                      )}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.id}
                        checked={formData.payment_method === method.id}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      {method.color ? (
                        <div className={`w-10 h-10 ${method.color} ${method.textColor} rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                          {method.letter}
                        </div>
                      ) : method.logo ? (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <img 
                            src={method.logo} 
                            alt={method.name} 
                            className="h-8 w-auto object-contain"
                          />
                          {method.logo2 && (
                            <img 
                              src={method.logo2} 
                              alt="Visa" 
                              className="h-6 w-auto object-contain"
                            />
                          )}
                        </div>
                      ) : (
                        <span className="text-2xl flex-shrink-0">{method.icon}</span>
                      )}
                      <span className="font-medium text-sm sm:text-base">{method.name}</span>
                    </label>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground mt-4">
                  * Paiement sécurisé via PayTech
                </p>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 md:p-8 sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Récapitulatif</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-black/10 dark:border-white/10">
                {cart.items.map((item) => (
                  <div key={item.product_id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F5F5F7] dark:bg-[#2C2C2E] flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.jpg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qté: {item.quantity}
                      </p>
                      <p className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Code promo</label>
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-700 dark:text-green-400">
                        {appliedPromo.code}
                      </span>
                      <span className="text-sm text-green-600 dark:text-green-500">
                        (-{appliedPromo.discount_percent}%)
                      </span>
                    </div>
                    <button
                      onClick={removePromo}
                      className="p-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-green-600" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase());
                        setPromoError("");
                      }}
                      placeholder="Entrez votre code"
                      className="flex-1 h-12 px-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:border-black dark:focus:border-white outline-none transition-colors"
                      data-testid="promo-code-input"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !promoCode.trim()}
                      className="px-4 h-12 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:bg-black/90 dark:hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="apply-promo-btn"
                    >
                      {promoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Appliquer"}
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-sm text-red-500 mt-2">{promoError}</p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction ({appliedPromo.discount_percent}%)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span>{formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-3 border-t border-black/10 dark:border-white/10">
                  <span>Total</span>
                  <span className="price-fcfa">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary w-full justify-center py-4 mb-3"
                data-testid="place-order-btn"
              >
                {loading ? "Traitement..." : "Confirmer la commande"}
              </button>

              <button
                onClick={handleWhatsAppOrder}
                className="btn-secondary w-full justify-center py-4 bg-[#25D366] border-[#25D366] text-white hover:bg-[#25D366]/90"
              >
                <MessageCircle className="w-5 h-5" />
                Commander via WhatsApp
              </button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                En confirmant, vous acceptez nos conditions générales de vente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
