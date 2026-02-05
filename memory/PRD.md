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
- **Email Service**: MailerSend

---

## Session: February 5, 2025 - Completed Work

### ✅ Critical Bugs Fixed

1. **Bug: Impossible d'ajouter un produit au panier** - CORRIGÉ
   - Cause: CORS bloquait les requêtes avec `withCredentials: true` et `allow_origins=["*"]`
   - Solution: CartContext utilise maintenant `localStorage` + header `X-Cart-Session` au lieu des cookies
   - Files: `/app/frontend/src/contexts/CartContext.js`, `/app/frontend/src/contexts/AuthContext.js`

2. **Bug: Email de bienvenue non fonctionnel** - CORRIGÉ
   - Cause: Deux fonctions `send_welcome_email` avec signatures différentes (conflit de noms)
   - Solution: Renommée la fonction newsletter en `send_newsletter_welcome_email`
   - File: `/app/backend/server.py`

3. **Bug: Navigation catégories** - VÉRIFIÉ FONCTIONNEL

### ✅ Email Marketing Workflows Implemented (6 workflows)

1. **Panier Abandonné** - Email automatique 1h après abandon
2. **Demande d'Avis Post-Achat** - Email 3 jours après livraison
3. **Récompenses VIP** - Code -20% pour clients ayant dépensé +500k FCFA/mois
4. **Reconquête Client (Winback)** - Code -15% pour clients inactifs 60+ jours
5. **Rappel Favoris (Wishlist)** - Rappel tous les 3 jours
6. **Suivi de Commande** - Notification d'expédition automatique

API Endpoints:
- `GET /api/admin/email/workflows` - Liste des workflows
- `POST /api/admin/email/workflows/{id}/run` - Déclencher un workflow manuellement
- `GET /api/admin/email/stats` - Statistiques email marketing

### ✅ UI Improvements

1. **Roue de la Fortune** - Nouvelle UI avec couleurs vibrantes
   - Dégradé orange/rose/violet dans le header
   - Badge "100% Gagnant !"
   - Nouvelles couleurs pour les segments: teal, violet, pink, amber, orange, blue, emerald
   - Grille de prix améliorée
   - File: `/app/frontend/src/components/SpinWheelGame.js`

2. **Page de Connexion** - Bouton Apple Sign-In ajouté (placeholder)
   - Bouton désactivé avec tooltip "Bientôt disponible"
   - File: `/app/frontend/src/pages/LoginPage.js`

3. **Catégorie renommée**: "Beauté" → "Accessoires mode et beauté"
   - Files: `/app/frontend/src/components/Navbar.js`, `/app/frontend/src/components/Footer.js`

---

## Pending Items

### 🔴 External Requirements (User Action Needed)

1. **MailerSend** - Compte en mode trial
   - Action: Upgrader le compte pour envoyer à des emails externes
   - Status: Les emails internes fonctionnent

2. **PayTech** - Mode test uniquement
   - Action: Contacter PayTech pour activer le mode production

3. **Apple Sign-In** - Configuration Apple Developer requise
   - Action: L'utilisateur doit créer un App ID, Service ID, et Private Key
   - Prérequis: Compte Apple Developer ($99/an)

4. **URLs Réseaux Sociaux** - En attente
   - TikTok et Snapchat: Icônes présentes, URLs à fournir

5. **Google OAuth** - Nouveaux identifiants à appliquer
   - Action: Fournir le nouveau Client ID et Secret

---

## Upcoming Tasks

### P0 - Immediate
- [ ] Configurer URLs TikTok/Snapchat dans le footer
- [ ] Mettre à jour Google OAuth avec nouveaux identifiants

### P1 - High Priority
- [ ] Apple Sign-In - Implémenter quand l'utilisateur fournit les identifiants Apple Developer
- [ ] Web Push Notifications

### P2 - Medium Priority
- [ ] Cartes cadeaux
- [ ] Bundles produits
- [ ] WhatsApp Business notifications
- [ ] Avis clients avec photos

---

## Key API Endpoints

### Cart (Updated)
- Header: `X-Cart-Session` (stocké dans localStorage)
- `GET /api/cart`
- `POST /api/cart/add`
- `PUT /api/cart/update`
- `DELETE /api/cart/remove/{product_id}`

### Email Marketing (New)
- `GET /api/admin/email/workflows`
- `POST /api/admin/email/workflows/{workflow_id}/run`
- `GET /api/admin/email/stats`

### Appointments
- `POST /api/appointments`
- `GET /api/admin/appointments`

---

## Test Credentials
- **Admin**: admin@yama.sn / admin123

## Test Reports
- `/app/test_reports/iteration_14.json` - All tests passed

---

## Project Health
- **Working**: E-commerce complet, panier, checkout, authentification, blog, rendez-vous
- **Mocked**: PayTech (mode test), Live Chat (auto-réponses)
- **External Limitations**: MailerSend (trial mode)

---
*Last updated: February 5, 2025*
