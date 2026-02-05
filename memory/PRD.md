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
7. Système d'email marketing avec MailerSend

## Technical Stack
- **Frontend**: React 18, TailwindCSS, Framer Motion, Shadcn/UI
- **Backend**: FastAPI (Python), APScheduler
- **Database**: MongoDB
- **Authentication**: JWT + Emergent Google Auth
- **Email Service**: MailerSend (remplace Resend)

---

## Implemented Features

### Core E-Commerce
- [x] Catalogue produits avec filtres et catégories
- [x] Panier d'achat persistant (localStorage + X-Cart-Session header)
- [x] Checkout complet avec calcul de livraison
- [x] Gestion des commandes
- [x] Factures PDF automatiques
- [x] Wishlist et comparaison de produits

### Authentication & Users
- [x] Inscription/Connexion JWT
- [x] Google OAuth (Emergent-managed)
- [x] Profil utilisateur
- [x] Tableau de bord client (/account)
- [x] Réinitialisation de mot de passe

### Admin Panel
- [x] Gestion des produits (CRUD) avec options avancées
- [x] Gestion des commandes
- [x] Gestion des codes promo
- [x] Gestion des paniers abandonnés
- [x] Dashboard analytics

### Engagement Features
- [x] Programme de fidélité avec points et récompenses
- [x] Roue de la Fortune (jeu promo)
- [x] Codes promo avancés
- [x] Section témoignages
- [x] Programme de parrainage
- [x] Widget chat en direct (MOCKED - auto-réponses)
- [x] Bannière de notification

### Blog & SEO
- [x] Section blog complète (/blog)
- [x] Pages articles individuels (/blog/:slug)
- [x] Google Analytics 4
- [x] Facebook Pixel
- [x] PWA Ready

### Système de Rendez-vous (NEW - Feb 2025)
- [x] Modal AppointmentModal pour réserver une visite
- [x] API /api/appointments pour créer des rendez-vous
- [x] Notifications email admin et client
- [x] Catégories supportées: automobile, mobilier, électroménager

### Email Marketing (MailerSend)
- [x] Email de bienvenue à l'inscription
- [x] Email de confirmation de commande
- [x] Email de panier abandonné (schedulé)
- [x] Email de notification admin

---

## Bug Fixes (February 5, 2025)

### Critical Bugs Fixed
1. **Impossible d'ajouter un produit au panier** - CORRIGÉ
   - Cause: CORS bloquait les requêtes avec `withCredentials: true` et `allow_origins=["*"]`
   - Solution: Utiliser localStorage + header `X-Cart-Session` au lieu des cookies

2. **Email de bienvenue non envoyé** - CORRIGÉ
   - Cause: Deux fonctions `send_welcome_email` avec signatures différentes (conflit de noms)
   - Solution: Renommer la deuxième en `send_newsletter_welcome_email`

3. **Liens de catégories qui redirigent vers le footer** - VÉRIFIÉ FONCTIONNEL
   - Les liens de navigation fonctionnent correctement

### UI Improvements
- [x] Catégorie "Beauté" renommée en "Accessoires mode et beauté"
- [x] Chat widget mobile: hauteur ajustée pour ne pas obscurcir la conversation
- [x] Logo et slogan visibles sur la page de connexion
- [x] Icônes TikTok et Snapchat ajoutées au footer

---

## Pending Issues

### P1 - MailerSend Trial Limitation
- **Status**: EXTERNE - Action utilisateur requise
- **Problème**: Compte MailerSend en mode trial avec limite de destinataires atteinte
- **Solution**: L'utilisateur doit upgrader son compte MailerSend ou activer le domaine `groupeyamaplus.com`

### P2 - PayTech Production Mode
- **Status**: EXTERNE - Action utilisateur requise
- **Problème**: PayTech en mode test (montants incorrects)
- **Solution**: Contacter PayTech pour activer le mode production

### P2 - URLs Réseaux Sociaux
- **Status**: En attente d'info utilisateur
- **Problème**: TikTok et Snapchat ont des icônes mais pas de liens réels
- **Action**: Demander les URLs des profils à l'utilisateur

---

## Upcoming Tasks (P0-P1)

### P0 - Email Marketing Complet
- [ ] Workflow Abandoned Cart automatique
- [ ] Workflow Post-Purchase (follow-up)
- [ ] Workflow VIP customers
- [ ] Workflow Winback (clients inactifs)

### P1 - Connexion iCloud (Apple Sign-In)
- [ ] Intégrer Apple Sign-In pour l'authentification
- [ ] Nécessite recherche sur l'API Apple

### P1 - Mettre à jour Google OAuth
- [ ] Appliquer les nouveaux Client ID et Secret fournis par l'utilisateur

### P1 - Améliorer la Roue de la Fortune
- [ ] Refonte UI selon les préférences utilisateur

---

## Future Tasks (P2)

- [ ] Cartes cadeaux (achat et remboursement)
- [ ] Bundles/Packs produits
- [ ] Notifications WhatsApp Business
- [ ] Avis clients avec photos
- [ ] Web Push notifications
- [ ] Exit-intent popup newsletter

---

## Key API Endpoints

### Cart
- `GET /api/cart` - Récupérer le panier (avec header X-Cart-Session)
- `POST /api/cart/add` - Ajouter au panier
- `PUT /api/cart/update` - Mettre à jour quantité
- `DELETE /api/cart/remove/{product_id}` - Retirer du panier

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/session` - Traiter callback Google OAuth
- `GET /api/auth/me` - Utilisateur courant

### Appointments (NEW)
- `POST /api/appointments` - Créer un rendez-vous
- `GET /api/admin/appointments` - Liste des rendez-vous (admin)

### Blog
- `GET /api/blog/posts` - Liste des articles
- `GET /api/blog/posts/{slug}` - Article individuel

---

## Test Credentials
- **Admin**: admin@yama.sn / admin123

## Project Health
- **Broken**: Aucun (bugs critiques corrigés)
- **Mocked**: 
  - PayTech (mode test)
  - Live Chat (auto-réponses)
- **External Limitations**:
  - MailerSend (trial mode, limite destinataires)

---
*Last updated: February 5, 2025*
