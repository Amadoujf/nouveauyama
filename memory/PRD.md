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

### Admin Panel
- [x] Gestion des produits (CRUD)
- [x] Gestion des commandes
- [x] Gestion des codes promo
- [x] Gestion des paniers abandonnés
- [x] Dashboard analytics

### Engagement Features
- [x] **Programme de fidélité** : Points et récompenses
- [x] **Roue de la Fortune** : Jeu pour gagner des réductions (-5%, -10%, -15%, -20%, livraison gratuite)
- [x] **Codes promo avancés** : Types percentage, fixed, free_shipping
- [x] **Section témoignages** : Avis clients sur la homepage
- [x] **Programme de parrainage** : Code référent et récompenses
- [x] **Widget chat en direct** : Support client (MOCKED - réponses automatiques)
- [x] **Bannière de notification** : Promotions site-wide

### UI/UX
- [x] Animations premium avec Framer Motion
- [x] Carrousel de confiance
- [x] Design minimaliste et moderne
- [x] Mode sombre/clair

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
- **Incomplete**: Phases 3, 4, 5 du roadmap

## Upcoming Tasks (Phase 3)
- [ ] Gift Card system (achat & remboursement)
- [ ] Product Bundles ("Shop the Look")
- [ ] Social Sharing Analytics
- [ ] Affiliate Marketing Dashboard

## Future Tasks (Phases 4 & 5)
- [ ] Custom Reporting Engine
- [ ] Segment integration
- [ ] Heatmap & Session Recording (Hotjar)
- [ ] A/B Testing framework
- [ ] Full E2E testing
- [ ] Performance audit
- [ ] Security scan

## API Keys Required
- `PAYTECH_API_KEY` & `PAYTECH_API_SECRET` - Paiements
- `RESEND_API_KEY` - Emails transactionnels  
- `MAILERLITE_API_KEY` - Marketing automation

## Test Credentials
- **Admin**: admin@yama.sn / admin123

---
*Last updated: February 1, 2025*
