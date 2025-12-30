import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Eye, Scale } from "lucide-react";
import { formatPrice, calculateDiscount, truncateText } from "../lib/utils";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useProductComparison } from "./ProductComparison";
import { cn } from "../lib/utils";

export default function ProductCard({ product, index = 0 }) {
  const { addToCart, loading: cartLoading } = useCart();
  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useProductComparison();
  
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="product-card group"
      data-testid={`product-card-${product.product_id}`}
    >
      {/* Image Container */}
      <Link
        to={`/product/${product.product_id}`}
        className="block relative aspect-[4/5] overflow-hidden bg-[#F5F5F7] dark:bg-[#2C2C2E]"
      >
        <img
          src={product.images?.[0] || "/placeholder.jpg"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.is_new && (
            <span className="badge-new">Nouveau</span>
          )}
          {product.is_promo && discount > 0 && (
            <span className="badge-promo">-{discount}%</span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product.product_id);
            }}
            disabled={cartLoading || product.stock === 0}
            className={cn(
              "w-full btn-primary justify-center py-3",
              product.stock === 0 && "opacity-50 cursor-not-allowed"
            )}
            data-testid={`add-to-cart-btn-${product.product_id}`}
          >
            <ShoppingBag className="w-4 h-4" />
            {product.stock === 0 ? "Rupture de stock" : "Ajouter au panier"}
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/product/${product.product_id}`}>
          <h3 className="font-medium text-[#1D1D1F] dark:text-white mb-1 line-clamp-1 group-hover:text-[#0071E3] transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {truncateText(product.short_description, 60)}
          </p>
        </Link>
        
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#1D1D1F] dark:text-white price-fcfa">
            {formatPrice(product.price)}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-sm text-muted-foreground line-through price-fcfa">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
