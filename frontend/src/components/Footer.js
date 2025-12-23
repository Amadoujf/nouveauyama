import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

const footerLinks = {
  shop: [
    { name: "Électronique", href: "/category/electronique" },
    { name: "Électroménager", href: "/category/electromenager" },
    { name: "Décoration", href: "/category/decoration" },
    { name: "Beauté", href: "/category/beaute" },
    { name: "Nouveautés", href: "/nouveautes" },
    { name: "Promotions", href: "/promotions" },
  ],
  company: [
    { name: "À propos", href: "/a-propos" },
    { name: "Contact", href: "/contact" },
    { name: "Aide / FAQ", href: "/aide" },
  ],
  legal: [
    { name: "Conditions générales", href: "/cgv" },
    { name: "Politique de confidentialité", href: "/privacy" },
    { name: "Politique de retour", href: "/returns" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#F5F5F7] dark:bg-[#1C1C1E] pt-16 pb-8">
      <div className="container-lumina">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <img 
                src="https://customer-assets.emergentagent.com/job_premium-senegal/artifacts/xs5g0hsy_IMG_0613.png" 
                alt="Groupe YAMA+" 
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Le shopping, autrement. Électronique, maison et essentiels du
              quotidien, sélectionnés avec exigence.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold mb-6 text-sm tracking-wider uppercase">
              Boutique
            </h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-6 text-sm tracking-wider uppercase">
              Entreprise
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="font-semibold mb-4 mt-8 text-sm tracking-wider uppercase">
              Légal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-6 text-sm tracking-wider uppercase">
              Contact
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:+221770000000"
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <span>+221 77 000 00 00</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@lumina.sn"
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <span>contact@lumina.sn</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>
                  Dakar, Sénégal
                  <br />
                  Almadies, Ngor
                </span>
              </li>
            </ul>

            {/* Payment Methods */}
            <h3 className="font-semibold mb-4 mt-8 text-sm tracking-wider uppercase">
              Paiement
            </h3>
            <div className="flex flex-wrap gap-3">
              <div className="px-3 py-2 bg-white dark:bg-black/50 rounded-lg text-sm font-medium">
                Wave
              </div>
              <div className="px-3 py-2 bg-white dark:bg-black/50 rounded-lg text-sm font-medium">
                Orange Money
              </div>
              <div className="px-3 py-2 bg-white dark:bg-black/50 rounded-lg text-sm font-medium">
                Visa
              </div>
              <div className="px-3 py-2 bg-white dark:bg-black/50 rounded-lg text-sm font-medium">
                Mastercard
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-black/10 dark:border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Groupe YAMA+. Tous droits réservés.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Livraison</span>
              <span className="w-1 h-1 bg-current rounded-full" />
              <span>Dakar & Régions</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
