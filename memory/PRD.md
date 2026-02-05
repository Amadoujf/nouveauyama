# YAMA+ E-Commerce Platform - PRD

## Original Problem Statement
Créer une plateforme e-commerce premium et minimaliste nommée "YAMA+" pour le marché sénégalais. L'application comprend une boutique en ligne complète avec panneau d'administration, système de paiement (PayTech), authentification multiple (JWT + Google), et de nombreuses fonctionnalités d'engagement utilisateur.

## User Personas
- **Clients finaux** : Utilisateurs sénégalais souhaitant acheter des produits électroniques, décoration et beauté
- **Administrateurs** : Gestionnaires de la boutique avec accès au panel admin
- **Propriétaire** : Gestion complète du catalogue, commandes et promotions

## Technical Stack
- **Frontend**: React 18, TailwindCSS, Framer Motion, Shadcn/UI
- **Backend**: FastAPI (Python), APScheduler
- **Database**: MongoDB
- **Authentication**: JWT + Emergent Google Auth
- **Email Service**: MailerSend (transactionnel) + MailerLite (marketing)

---

## Session: February 5, 2026 - Completed Work

### ✅ Bug Fixes Implemented

1. **Password Reset Flow - FIXED**
   - Added `SITE_URL` to backend/.env pointing to preview URL
   - Reset emails now contain correct links
   - Token expires in 1 hour as expected

2. **Profile Update - NEW FEATURE**
   - Added `PUT /api/auth/profile` endpoint
   - Users can update their name and phone
   - Frontend AccountPage.js now has edit/save buttons

3. **Phone Field in Auth APIs - FIXED**
   - `POST /api/auth/login` now returns phone
   - `POST /api/auth/register` now returns phone
   - `GET /api/auth/me` now returns phone

4. **MailerLite Integration - ENHANCED**
   - Service upgraded with multiple workflow groups support
   - Groups: abandoned_cart, welcome, post_purchase, vip, winback, wishlist, etc.
   - Auto-add to welcome flow on registration
   - Auto-add to post-purchase flow on order completion
   - Admin endpoint: `GET /api/admin/mailerlite/groups`

### ✅ Previous Session Fixes (Still Working)
- Cart uses localStorage + X-Cart-Session header (no more CORS issues)
- Welcome email function name conflict resolved
- Order confirmation with PDF invoice attachment
- Fortune Wheel responsive design
- Login page with logo and slogan

---

## Pending Items

### 🔴 External Requirements (User Action Needed)

1. **MailerSend** - Compte en mode trial
   - Action: Upgrader le compte pour envoyer à des emails externes
   - Status: Les emails internes fonctionnent

2. **PayTech** - Mode test uniquement
   - Action: Contacter PayTech pour activer le mode production

3. **URLs Réseaux Sociaux** - En attente
   - TikTok et Snapchat: Icônes présentes dans Footer.js, URLs placeholder
   - Action: L'utilisateur doit fournir les URLs de ses profils

4. **Google OAuth - Test en webview**
   - Le `disallowed_useragent` error survient quand on teste depuis l'app Emergent
   - Action: Tester dans un navigateur standard (Chrome/Safari) pas en webview

---

## Upcoming Tasks

### P1 - High Priority
- [ ] Finaliser le système de rendez-vous (appointment booking)
- [ ] Configurer les URLs TikTok/Snapchat dans le footer
- [ ] Tester le flux complet de réinitialisation de mot de passe côté utilisateur

### P2 - Medium Priority
- [ ] Web Push Notifications
- [ ] WhatsApp Business notifications
- [ ] Avis clients avec photos

### P3 - Future
- [ ] Cartes cadeaux
- [ ] Bundles produits
- [ ] Exit-intent popup newsletter

---

## Key API Endpoints

### Authentication
- `POST /api/auth/register` - Inscription (retourne phone)
- `POST /api/auth/login` - Connexion (retourne phone)
- `GET /api/auth/me` - Profil utilisateur (retourne phone)
- `PUT /api/auth/profile` - **NEW** Mise à jour profil (name, phone)
- `POST /api/auth/forgot-password` - Demande réinitialisation
- `POST /api/auth/reset-password` - Réinitialisation avec token

### Cart (localStorage-based)
- Header: `X-Cart-Session` (stocké dans localStorage)
- `GET /api/cart`
- `POST /api/cart/add`
- `PUT /api/cart/update`
- `DELETE /api/cart/remove/{product_id}`

### Email Marketing
- `GET /api/admin/email/workflows` - Liste des workflows
- `POST /api/admin/email/workflows/{workflow_id}/run` - Déclencher workflow
- `GET /api/admin/email/stats` - Statistiques
- `GET /api/admin/mailerlite/groups` - **NEW** Groupes MailerLite

### Orders
- `POST /api/orders` - Créer commande (envoie email + facture PDF)
- `GET /api/orders/{order_id}` - Détails commande (public)
- `GET /api/orders/{order_id}/invoice` - Télécharger facture PDF

---

## Test Credentials
- **Admin**: admin@yama.sn / admin123

## Test Reports
- `/app/test_reports/iteration_15.json` - All tests passed (100%)

---

## Project Health
- **Working**: E-commerce complet, panier, checkout, authentification, blog, profil
- **Mocked**: PayTech (mode test), Live Chat (auto-réponses)
- **External Limitations**: MailerSend (trial mode), Google OAuth (webview blocked)

---

## Architecture Notes
- `server.py` est volumineux (~7600 lignes) - Refactoring recommandé
- MailerLite service supporte multiples groupes d'automation
- Frontend utilise Sonner pour les toasts

---
*Last updated: February 5, 2026*
