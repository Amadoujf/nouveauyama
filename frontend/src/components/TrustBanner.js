import { motion } from "framer-motion";
import { Truck, Shield, CreditCard, Headphones, RotateCcw, Clock } from "lucide-react";

const trustItems = [
  { icon: Truck, text: "Livraison rapide", subtext: "24-48h Dakar" },
  { icon: Shield, text: "Paiement sécurisé", subtext: "Wave, OM, CB" },
  { icon: RotateCcw, text: "Retour 7 jours", subtext: "Satisfait ou remboursé" },
  { icon: Headphones, text: "Support 24/7", subtext: "WhatsApp" },
];

export default function TrustBanner() {
  return (
    <section className="bg-[#F5F5F7] dark:bg-[#1C1C1E] py-6 border-y border-black/5 dark:border-white/5">
      <div className="container-lumina">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{item.text}</p>
                <p className="text-xs text-muted-foreground">{item.subtext}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrustBannerCompact() {
  return (
    <div className="flex flex-wrap justify-center gap-4 py-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <Truck className="w-4 h-4" /> Livraison 24-48h
      </span>
      <span className="flex items-center gap-1">
        <Shield className="w-4 h-4" /> Paiement sécurisé
      </span>
      <span className="flex items-center gap-1">
        <RotateCcw className="w-4 h-4" /> Retour 7 jours
      </span>
      <span className="flex items-center gap-1">
        <Headphones className="w-4 h-4" /> Support WhatsApp
      </span>
    </div>
  );
}
