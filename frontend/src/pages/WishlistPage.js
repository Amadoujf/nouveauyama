import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { formatPrice } from "../lib/utils";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen pt-20 flex items-center justify-center bg-[#F5F5F7] dark:bg-[#0B0B0B]">
        <div className="text-center px-6">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-semibold mb-4">Connectez-vous</h1>
          <p className="text-muted-foreground mb-6">
            Connectez-vous pour voir vos produits favoris
          </p>
          <Link to="/login" className="btn-primary">
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20" data-testid="wishlist-page">
      {/* Header */}
      <section className="py-12 md:py-16 bg-[#F5F5F7] dark:bg-[#1C1C1E]">
        <div className="container-lumina">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="heading-section mb-4">Mes Favoris</h1>
            <p className="text-body-lg">
              {wishlist.items.length} produit{wishlist.items.length > 1 ? "s" : ""} dans votre liste
            </p>
          </motion.div>
        </div>
      </section>

      {/* Wishlist Items */}
      <section className="section-padding bg-white dark:bg-[#0B0B0B]">
        <div className="container-lumina">
          {wishlist.items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-4">Aucun favori</h2>
              <p className="text-muted-foreground mb-6">
                Vous n'avez pas encore ajouté de produits à vos favoris
              </p>
              <Link to="/" className="btn-primary">
                Découvrir les produits
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlist.items.map((item, index) => (
                <motion.div
                  key={item.product_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white dark:bg-[#1C1C1E] rounded-3xl overflow-hidden shadow-subtle"
                >
                  <Link
                    to={`/product/${item.product_id}`}
                    className="block aspect-square bg-[#F5F5F7] dark:bg-[#2C2C2E]"
                  >
                    <img
                      src={item.image || "/placeholder.jpg"}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <div className="p-4">
                    <Link to={`/product/${item.product_id}`}>
                      <h3 className="font-medium mb-1 line-clamp-1 group-hover:text-[#0071E3] transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="font-semibold mb-4">{formatPrice(item.price)}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(item.product_id)}
                        disabled={item.stock === 0}
                        className="flex-1 btn-primary py-2 text-sm justify-center"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        {item.stock === 0 ? "Rupture" : "Ajouter"}
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.product_id)}
                        disabled={loading}
                        className="p-2 border border-black/10 dark:border-white/10 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                        aria-label="Retirer des favoris"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
