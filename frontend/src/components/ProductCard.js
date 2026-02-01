import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Eye, Scale, Check } from "lucide-react";
import { formatPrice, calculateDiscount, truncateText } from "../lib/utils";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useProductComparison } from "./ProductComparison";
import { cn } from "../lib/utils";

export default function ProductCard({ product, index = 0 }) {
  const { addToCart, loading: cartLoading } = useCart();
  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useProductComparison();
  const [addedToCart, setAddedToCart] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const discount = calculateDiscount(product.original_price, product.price);
  const inWishlist = isInWishlist(product.product_id);
  const inCompare = isInCompare(product.product_id);

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(product.product_id);
    } else {
      addToCompare(product);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product.product_id, 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1]
      }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="product-card group relative"
      data-testid={`product-card-${product.product_id}`}
    >
      {/* Image Container */}
      <Link
        to={`/product/${product.product_id}`}
        className="block relative aspect-[4/5] overflow-hidden bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-2xl"
      >
        <motion.img
          src={product.images?.[0] || "/placeholder.jpg"}
          alt={product.name}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.08 : 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          loading="lazy"
        />

        {/* Gradient overlay on hover */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.is_new && (
            <motion.span 
              className="badge-new"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Nouveau
            </motion.span>
          )}
          {product.is_promo && discount > 0 && (
            <motion.span 
              className="badge-promo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              -{discount}%
            </motion.span>
          )}
        </div>

        {/* Quick Actions */}
        <motion.div 
          className="absolute top-4 right-4 flex flex-col gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.product_id);
            }}
            disabled={wishlistLoading}
            className={cn(
              "p-2.5 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-sm shadow-lg transition-all hover:scale-110",
              inWishlist && "text-red-500"
            )}
            aria-label={inWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
            data-testid={`wishlist-btn-${product.product_id}`}
          >
            <Heart className={cn("w-5 h-5", inWishlist && "fill-current")} />
          </button>
          <button
            onClick={handleCompareClick}
            className={cn(
              "p-2.5 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-sm shadow-lg transition-all hover:scale-110",
              inCompare && "text-primary bg-primary/10"
            )}
            aria-label={inCompare ? "Retirer de la comparaison" : "Comparer"}
            data-testid={`compare-btn-${product.product_id}`}
          >
            <Scale className="w-5 h-5" />
          </button>
          <Link
            to={`/product/${product.product_id}`}
            className="p-2.5 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-sm shadow-lg transition-all hover:scale-110"
            aria-label="Voir le produit"
            data-testid={`view-btn-${product.product_id}`}
          >
            <Eye className="w-5 h-5" />
          </Link>
        </div>

        {/* Add to Cart - Bottom */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 p-4"
          initial={{ y: "100%" }}
          animate={{ y: isHovered ? 0 : "100%" }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.button
            onClick={handleAddToCart}
            disabled={cartLoading || product.stock === 0}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "w-full btn-primary justify-center py-3 btn-ripple",
              product.stock === 0 && "opacity-50 cursor-not-allowed",
              addedToCart && "bg-green-500 hover:bg-green-600"
            )}
            data-testid={`add-to-cart-btn-${product.product_id}`}
          >
            {addedToCart ? (
              <>
                <Check className="w-4 h-4 animate-bounce-in" />
                Ajouté !
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                {product.stock === 0 ? "Rupture de stock" : "Ajouter au panier"}
              </>
            )}
          </motion.button>
        </motion.div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/product/${product.product_id}`} className="block">
          <motion.h3 
            className="font-medium text-[#1D1D1F] dark:text-white mb-1 line-clamp-1 transition-colors"
            whileHover={{ color: "#0071E3" }}
          >
            {product.name}
          </motion.h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {truncateText(product.short_description, 60)}
          </p>
        </Link>
        
        <div className="flex items-center gap-2">
          <motion.span 
            className="font-semibold text-[#1D1D1F] dark:text-white price-fcfa"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {formatPrice(product.price)}
          </motion.span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-sm text-muted-foreground line-through price-fcfa">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>
      </div>

      {/* Hover shadow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={{ boxShadow: "0 0 0 rgba(0,0,0,0)" }}
        animate={{ 
          boxShadow: isHovered 
            ? "0 25px 50px -12px rgba(0,0,0,0.25)" 
            : "0 0 0 rgba(0,0,0,0)" 
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}
