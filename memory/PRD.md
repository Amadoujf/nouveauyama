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
- [ ] Blog/Section actualités

## Future Tasks (Phases 4 & 5)
- [ ] Custom Reporting Engine
- [ ] Segment integration
- [ ] Heatmap & Session Recording (Hotjar)
- [ ] A/B Testing framework
- [ ] Full E2E testing
- [ ] Performance audit
- [ ] Security scan

## Key API Endpoints
- `GET /api/products` - Liste produits avec filtres (brand, colors, sizes)
- `GET /api/orders/track?order_id=X&email=Y` - Suivi de commande public
- `POST /api/products/{id}/notify-stock` - Inscription notification stock
- `POST /api/products/{id}/price-alert` - Inscription alerte baisse de prix
- `GET /api/products/{id}/reviews` - Avis produit avec statistiques
- `GET /api/admin/stats` - Statistiques dashboard admin

## API Keys Required
- `PAYTECH_API_KEY` & `PAYTECH_API_SECRET` - Paiements
- `RESEND_API_KEY` - Emails transactionnels  
- `MAILERLITE_API_KEY` - Marketing automation

## Test Credentials
- **Admin**: admin@yama.sn / admin123

---
*Last updated: February 2, 2025*
