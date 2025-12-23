import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { cn } from "../lib/utils";

const navItems = [
  { name: "Électronique", href: "/category/electronique" },
  { name: "Électroménager", href: "/category/electromenager" },
  { name: "Décoration", href: "/category/decoration" },
  { name: "Beauté", href: "/category/beaute" },
  { name: "Nouveautés", href: "/nouveautes" },
  { name: "Promotions", href: "/promotions" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(false);
  
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { cartCount, setIsOpen: setCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const isActive = (href) => location.pathname === href;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "glass-nav shadow-subtle" : "bg-transparent"
        )}
      >
        <nav className="container-lumina">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3"
              data-testid="nav-logo"
            >
              <img 
                src="https://customer-assets.emergentagent.com/job_premium-senegal/artifacts/5wsfuon7_6BCAC1FE-93B6-4459-AE63-2C81996A6325.png" 
                alt="Groupe YAMA+" 
                className="h-10 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "nav-link",
                    isActive(item.href) && "nav-link-active"
                  )}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                aria-label="Rechercher"
                data-testid="nav-search-btn"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                aria-label="Mode sombre"
                data-testid="nav-dark-mode-btn"
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors hidden md:flex"
                aria-label="Favoris"
                data-testid="nav-wishlist-btn"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                aria-label="Panier"
                data-testid="nav-cart-btn"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-black dark:bg-white text-white dark:text-black text-xs font-medium rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {isAuthenticated ? (
                <Link
                  to={isAdmin ? "/admin" : "/account"}
                  className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors hidden md:flex items-center gap-2"
                  data-testid="nav-account-btn"
                >
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex btn-primary text-sm py-2 px-5"
                  data-testid="nav-login-btn"
                >
                  Connexion
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                aria-label="Menu"
                data-testid="nav-mobile-menu-btn"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white dark:bg-black"
          >
            <div className="container-lumina py-6">
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-medium">Rechercher</span>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
                  data-testid="close-search-btn"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Que recherchez-vous ?"
                  className="w-full text-4xl md:text-6xl font-light bg-transparent border-none outline-none placeholder:text-muted-foreground/30"
                  autoFocus
                  data-testid="search-input"
                />
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-white dark:bg-black lg:hidden"
          >
            <div className="container-lumina py-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <img 
                  src="https://customer-assets.emergentagent.com/job_premium-senegal/artifacts/5wsfuon7_6BCAC1FE-93B6-4459-AE63-2C81996A6325.png" 
                  alt="Groupe YAMA+" 
                  className="h-8 w-auto"
                />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
                  data-testid="close-mobile-menu-btn"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex flex-col gap-1 flex-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "py-4 text-2xl font-medium border-b border-black/5 dark:border-white/10",
                      isActive(item.href)
                        ? "text-[#0071E3]"
                        : "text-[#1D1D1F] dark:text-white"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <Link
                  to="/a-propos"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-4 text-2xl font-medium border-b border-black/5 dark:border-white/10 text-[#1D1D1F] dark:text-white"
                >
                  À propos
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-4 text-2xl font-medium border-b border-black/5 dark:border-white/10 text-[#1D1D1F] dark:text-white"
                >
                  Contact
                </Link>
                <Link
                  to="/aide"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-4 text-2xl font-medium border-b border-black/5 dark:border-white/10 text-[#1D1D1F] dark:text-white"
                >
                  Aide / FAQ
                </Link>
              </nav>

              <div className="pt-6 border-t border-black/5 dark:border-white/10">
                {isAuthenticated ? (
                  <Link
                    to={isAdmin ? "/admin" : "/account"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-4"
                  >
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-black/10 dark:bg-white/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {isAdmin ? "Administrateur" : "Mon compte"}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="flex gap-3">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 btn-primary justify-center"
                    >
                      Connexion
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 btn-secondary justify-center"
                    >
                      Inscription
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
