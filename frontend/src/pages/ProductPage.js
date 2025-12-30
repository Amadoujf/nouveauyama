import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  ChevronRight,
  Heart,
  ShoppingBag,
  Truck,
  Shield,
  RotateCcw,
  MessageCircle,
  Minus,
  Plus,
  ChevronDown,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import {
  formatPrice,
  calculateDiscount,
  getCategoryName,
  generateWhatsAppLink,
  generateOrderMessage,
} from "../lib/utils";
import { cn } from "../lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import ProductReviews from "../components/ProductReviews";
import SimilarProducts from "../components/SimilarProducts";
import SEO from "../components/SEO";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const WHATSAPP_NUMBER = "+221770000000";

export default function ProductPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { addToCart, loading: cartLoading } = useCart();
  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/products/${productId}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <main className="min-h-screen pt-20">
        <div className="container-lumina py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square rounded-3xl skeleton" />
            <div className="space-y-6">
              <div className="h-8 w-32 rounded skeleton" />
              <div className="h-12 w-3/4 rounded skeleton" />
              <div className="h-6 w-full rounded skeleton" />
              <div className="h-6 w-2/3 rounded skeleton" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Produit non trouvé</h1>
          <Link to="/" className="btn-primary">
            Retour à l'accueil
          </Link>
        </div>
      </main>
    );
  }

  const discount = calculateDiscount(product.original_price, product.price);
  const inWishlist = isInWishlist(product.product_id);

  const handleAddToCart = () => {
    addToCart(product.product_id, quantity);
  };

  const handleWhatsAppOrder = () => {
    const items = [
      {
        name: product.name,
        price: product.price,
        quantity: quantity,
      },
    ];
    const message = generateOrderMessage(items, product.price * quantity, null);
    window.open(generateWhatsAppLink(WHATSAPP_NUMBER, message), "_blank");
  };

  return (
    <main className="min-h-screen pt-20" data-testid="product-page">
      <SEO 
        title={product.name}
        description={product.short_description || product.description?.slice(0, 160)}
        image={product.images?.[0]}
        url={`/product/${product.product_id}`}
        type="product"
        product={product}
      />
      {/* Breadcrumb */}
      <div className="bg-[#F5F5F7] dark:bg-[#1C1C1E] py-4">
        <div className="container-lumina">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link
              to={`/category/${product.category}`}
              className="text-muted-foreground hover:text-foreground"
            >
              {getCategoryName(product.category)}
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Content */}
      <section className="py-12 md:py-16">
        <div className="container-lumina">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="aspect-square rounded-3xl overflow-hidden bg-[#F5F5F7] dark:bg-[#1C1C1E]"
              >
                <img
                  src={product.images?.[selectedImage] || "/placeholder.jpg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all",
                        selectedImage === index
                          ? "border-black dark:border-white"
                          : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              {/* Badges */}
              <div className="flex gap-2 mb-4">
                {product.is_new && <span className="badge-new">Nouveau</span>}
                {product.is_promo && discount > 0 && (
                  <span className="badge-promo">-{discount}%</span>
                )}
              </div>

              {/* Title */}
              <h1
                className="text-3xl md:text-4xl font-semibold tracking-tight mb-4"
                data-testid="product-name"
              >
                {product.name}
              </h1>

              {/* Short Description */}
              <p className="text-body-lg mb-6">{product.short_description}</p>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-8">
                <span
                  className="text-3xl font-semibold price-fcfa"
                  data-testid="product-price"
                >
                  {formatPrice(product.price)}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-xl text-muted-foreground line-through price-fcfa">
                    {formatPrice(product.original_price)}
                  </span>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Quantité</label>
                <div className="flex items-center border border-black/10 dark:border-white/10 rounded-xl w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="quantity-btn rounded-l-xl"
                    aria-label="Diminuer la quantité"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    disabled={quantity >= product.stock}
                    className="quantity-btn rounded-r-xl"
                    aria-label="Augmenter la quantité"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {product.stock <= 5 && product.stock > 0 && (
                  <p className="text-sm text-orange-500 mt-2">
                    Plus que {product.stock} en stock
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading || product.stock === 0}
                  className={cn(
                    "btn-primary w-full justify-center py-4 text-base",
                    product.stock === 0 && "opacity-50 cursor-not-allowed"
                  )}
                  data-testid="add-to-cart-btn"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {product.stock === 0 ? "Rupture de stock" : "Ajouter au panier"}
                </button>

                <button
                  onClick={handleWhatsAppOrder}
                  className="btn-secondary w-full justify-center py-4 text-base bg-[#25D366] border-[#25D366] text-white hover:bg-[#25D366]/90"
                  data-testid="whatsapp-order-btn"
                >
                  <MessageCircle className="w-5 h-5" />
                  Commander via WhatsApp
                </button>

                <button
                  onClick={() => toggleWishlist(product.product_id)}
                  disabled={wishlistLoading}
                  className={cn(
                    "btn-secondary w-full justify-center py-4 text-base",
                    inWishlist && "bg-red-50 border-red-200 text-red-600"
                  )}
                  data-testid="wishlist-btn"
                >
                  <Heart className={cn("w-5 h-5", inWishlist && "fill-current")} />
                  {inWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 py-6 border-y border-black/10 dark:border-white/10 mb-8">
                <div className="text-center">
                  <Truck className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Livraison rapide</p>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Garantie</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Retour facile</p>
                </div>
              </div>

              {/* Description & Specs */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="description">
                  <AccordionTrigger className="text-base font-medium">
                    Description
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  </AccordionContent>
                </AccordionItem>

                {product.specs && Object.keys(product.specs).length > 0 && (
                  <AccordionItem value="specs">
                    <AccordionTrigger className="text-base font-medium">
                      Caractéristiques techniques
                    </AccordionTrigger>
                    <AccordionContent>
                      <dl className="space-y-3">
                        {Object.entries(product.specs).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <dt className="text-muted-foreground capitalize">
                              {key.replace(/_/g, " ")}
                            </dt>
                            <dd className="font-medium">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </AccordionContent>
                  </AccordionItem>
                )}

                <AccordionItem value="shipping">
                  <AccordionTrigger className="text-base font-medium">
                    Livraison & Retours
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        <strong className="text-foreground">Livraison Dakar :</strong>{" "}
                        24-48h - 2 500 FCFA
                      </p>
                      <p>
                        <strong className="text-foreground">Livraison Régions :</strong>{" "}
                        3-5 jours - 3 500 FCFA
                      </p>
                      <p>
                        <strong className="text-foreground">Retours :</strong> 7 jours
                        pour retourner votre produit
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Similar Products Section */}
        <div className="container-lumina">
          <SimilarProducts productId={productId} category={product?.category} />
        </div>

        {/* Reviews Section */}
        <div className="container-lumina pb-24 lg:pb-16">
          <ProductReviews productId={productId} />
        </div>
      </section>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white dark:bg-[#1C1C1E] border-t border-black/10 dark:border-white/10 p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground line-clamp-1">{product.name}</p>
            <p className="font-bold text-lg">{formatPrice(product.price)}</p>
          </div>
          <button
            onClick={() => toggleWishlist(product.product_id)}
            className={cn(
              "p-3 rounded-xl border transition-colors flex-shrink-0",
              inWishlist
                ? "border-red-500 text-red-500"
                : "border-black/10 dark:border-white/10"
            )}
          >
            <Heart className={cn("w-5 h-5", inWishlist && "fill-current")} />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={cartLoading || product.stock === 0}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            {product.stock === 0 ? "Rupture" : "Ajouter"}
          </button>
        </div>
      </div>
    </main>
  );
}
