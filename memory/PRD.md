# YAMA+ E-Commerce Platform - PRD

## Original Problem Statement
Créer une plateforme e-commerce premium et minimaliste nommée "YAMA+" pour le marché sénégalais. L'application comprend une boutique en ligne complète avec panneau d'administration, système de paiement (PayTech), authentification multiple (JWT + Google), et de nombreuses fonctionnalités d'engagement utilisateur.

## User Personas
- **Clients finaux** : Utilisateurs sénégalais souhaitant acheter des produits électroniques, décoration et beauté
- **Administrateurs** : Gestionnaires de la boutique avec accès au panel admin
- **Propriétaire** : Gestion complète du catalogue, commandes et promotions

## Core Requirements
1. Boutique e-commerce complète avec catalogue produits
2. Panier d'achat et checkout
3. Système de paiement PayTech (actuellement en mode test)
4. Authentification JWT et Google OAuth
5. Panel d'administration complet
6. Programme de fidélité et engagement

## Technical Stack
- **Frontend**: React 18, TailwindCSS, Framer Motion, Shadcn/UI
- **Backend**: FastAPI (Python), APScheduler
- **Database**: MongoDB
- **Authentication**: JWT + Emergent Google Auth

## Implemented Features (as of Feb 2025)

### Core E-Commerce
- [x] Catalogue produits avec filtres et catégories
- [x] Panier d'achat persistant
- [x] Checkout complet
- [x] Gestion des commandes
- [x] Factures PDF automatiques
- [x] Wishlist et comparaison de produits

### Authentication & Users
- [x] Inscription/Connexion JWT
- [x] Google OAuth (Emergent-managed)
- [x] Profil utilisateur
- [x] Tableau de bord client (/account)

### Admin Panel
- [x] Gestion des produits (CRUD) avec options avancées (couleurs, tailles, marques)
- [x] Gestion des commandes
- [x] Gestion des codes promo
- [x] Gestion des paniers abandonnés
- [x] Dashboard analytics refait avec design professionnel

### Engagement Features
- [x] **Programme de fidélité** : Points et récompenses
- [x] **Roue de la Fortune** : Jeu pour gagner des réductions (-5%, -10%, -15%, -20%, livraison gratuite)
- [x] **Codes promo avancés** : Types percentage, fixed, free_shipping
- [x] **Section témoignages** : Avis clients sur la homepage
- [x] **Programme de parrainage** : Code référent et récompenses
- [x] **Widget chat en direct** : Support client (MOCKED - réponses automatiques)
- [x] **Bannière de notification** : Promotions site-wide
- [x] **Notifications de stock** : "Prévenez-moi quand disponible" pour produits en rupture

### UI/UX
- [x] Animations premium avec Framer Motion
- [x] Carrousel de confiance
- [x] Design minimaliste et moderne
- [x] Mode sombre/clair
- [x] Section Ventes Flash animée
- [x] Cartes produits compactes avec carrousel d'images

### Phase 1 Features (Completed Feb 2, 2025)
- [x] **Filtres avancés** sur CategoryPage (prix, couleur, taille, marque, disponibilité, tri)
- [x] **Page Suivi de commande** (/suivi-commande) avec timeline de statut
- [x] **Avis clients** affichés sur les pages produits avec statistiques
- [x] **Pages légales** : CGV, Confidentialité, Retours, Livraison

### Phase 2 Features (Completed Feb 2, 2025)
- [x] **Tableau de bord client** (historique commandes, adresses, favoris)
- [x] **Produits similaires** ("Vous aimerez aussi") sur pages produits
- [x] **Notifications de disponibilité** : Bouton "Prévenez-moi quand disponible" + modal email
- [x] **Alertes de prix** : Bouton "Alerte baisse de prix" avec modal pour définir un prix cible

### Bug Fixes (Feb 2, 2025)
- [x] **Dashboard Admin corrigé** : Les stats (chiffre d'affaires, commandes, produits, clients) s'affichent maintenant correctement
- [x] **Navigation Admin corrigée** : Tous les liens du menu latéral fonctionnent (Commandes, Utilisateurs, etc.)
- [x] **Noms clients corrigés** : Affichage correct des noms dans les commandes récentes (shipping.full_name)

### AI-Powered Features (Feb 2, 2025)
- [x] **IA Auto-remplir produit** : Bouton magique dans le formulaire de création de produit qui analyse une image et remplit automatiquement le nom, description, catégorie, marque, couleurs et prix estimé

### Product Management Features (Feb 4, 2025)
- [x] **Correction création produit** : Fixed authentication issues (withCredentials → Bearer token)
- [x] **Produits sur commande** : Option "Sur commande" avec délai de livraison estimé en jours
- [x] **Badge "Sur commande"** : Affiché sur les cartes produits et pages produits avec icône horloge et délai

### Blog & SEO Features (Feb 4, 2025)
- [x] **Blog YAMA+** : Section blog complète avec articles SEO
  - Page liste des articles (/blog) avec hero, recherche, filtres par catégorie
  - Page article individuel (/blog/:slug) avec contenu riche, partage social
  - 6 articles de démonstration (guides d'achat, conseils, tendances, nouveautés)
  - API backend complète (GET /api/blog/posts, GET /api/blog/posts/:slug)
  - Administration des articles (création, modification, suppression)
- [x] **Google Analytics 4** : Suivi des pages et événements
- [x] **Facebook Pixel** : Tracking marketing pour les conversions
- [x] **PWA Ready** : Application web progressive avec manifest.json

## Pending Issues (Blocked on User Action)

### P1 - Resend Domain Verification
- **Status**: BLOCKED
- **Action requise**: Utilisateur doit vérifier le domaine `groupeyamaplus.com` sur Resend

### P2 - PayTech Production Mode
- **Status**: BLOCKED  
- **Action requise**: Utilisateur doit contacter PayTech pour activer le compte en production

### P2 - Custom Domain Configuration
- **Status**: USER VERIFICATION PENDING
- **Action requise**: Confirmer la configuration DNS sur Hostinger

## Project Health
- **Broken**: Aucun
- **Mocked**: 
  - PayTech (mode test - montants incorrects de 100 FCFA)
  - Live Chat Widget (réponses automatiques uniquement)
- **Incomplete**: Phase 3 (cartes cadeaux, bundles, fidélité avancée)

## Upcoming Tasks (Phase 3 - P2)
- [ ] Système de cartes cadeaux (achat & remboursement)
- [ ] Bundles/Packs ("Achetez ensemble et économisez")
- [ ] Points de fidélité avancés
- [ ] Boutons de partage social sur produits
- [ ] Notifications WhatsApp Business

## Key API Endpoints
- `GET /api/products` - Liste produits avec filtres (brand, colors, sizes)
- `GET /api/orders/track?order_id=X&email=Y` - Suivi de commande public
- `POST /api/products/{id}/notify-stock` - Inscription notification stock
- `POST /api/products/{id}/price-alert` - Inscription alerte baisse de prix
- `GET /api/products/{id}/reviews` - Avis produit avec statistiques
- `GET /api/admin/stats` - Statistiques dashboard admin
- `POST /api/admin/analyze-product-image` - Analyse IA d'image pour création produit
- `GET /api/blog/posts` - Liste des articles de blog (filtrable par catégorie)
- `GET /api/blog/posts/{slug}` - Article de blog individuel
- `POST /api/admin/blog/posts` - Créer un article de blog (admin)
- `PUT /api/admin/blog/posts/{post_id}` - Modifier un article de blog (admin)
- `DELETE /api/admin/blog/posts/{post_id}` - Supprimer un article de blog (admin)

## API Keys Required
- `PAYTECH_API_KEY` & `PAYTECH_API_SECRET` - Paiements
- `RESEND_API_KEY` - Emails transactionnels  
- `MAILERLITE_API_KEY` - Marketing automation

## Test Credentials
- **Admin**: admin@yama.sn / admin123

---
*Last updated: February 4, 2025*
