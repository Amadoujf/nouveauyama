# YAMA+ E-Commerce Platform - PRD

## Original Problem Statement
Créer une plateforme e-commerce premium pour le marché sénégalais. L'application comprend une boutique en ligne avec panneau d'administration, système de paiement (PayTech), authentification (JWT + Google), emails marketing, et fonctionnalités d'engagement utilisateur.

## Technical Stack
- **Frontend**: React 18, TailwindCSS, Framer Motion, Shadcn/UI
- **Backend**: FastAPI (Python), APScheduler, MongoDB
- **Email**: MailerSend (transactionnel) + MailerLite (marketing)
- **Auth**: JWT + Emergent Google Auth

---

## Session: February 5, 2026 - Completed Work

### ✅ Corrections apportées

1. **Chat Widget Redesigné**
   - Bouton compact 48x48 pixels (comme WhatsApp)
   - Position en bas à gauche
   - Fenêtre de chat 320x384 pixels
   - Ne déforme plus le site lors de l'écriture

2. **Section Rendez-vous Admin (NOUVELLE)**
   - Menu "Rendez-vous" dans le sidebar admin
   - Page `/admin/appointments` avec tableau complet
   - Cartes statistiques (En attente, Confirmés, Terminés, Total)
   - Bouton "Confirmer" avec option WhatsApp
   - Lien WhatsApp auto-généré avec message prérempli
   - Alerte jaune sur le dashboard pour les RDV en attente

3. **Notifications Admin par Email**
   - Email admin changé: `amadoubourydiouf@gmail.com`
   - Notification à chaque nouvelle commande
   - Notification à chaque demande de rendez-vous

4. **Correction Statut Commande**
   - API PUT `/api/admin/orders/{id}/status` corrigée
   - Frontend envoie maintenant `order_status` (pas `status`)
   - Dropdown de statut fonctionne correctement

5. **Réinitialisation Mot de Passe**
   - `SITE_URL` configuré dans .env
   - Liens dans les emails pointent vers le bon domaine

6. **Mise à jour Profil Utilisateur**
   - Nouvelle API `PUT /api/auth/profile`
   - Édition nom et téléphone sur la page compte
   - APIs login/register retournent le champ `phone`

7. **Structure Backend Refactorisée (début)**
   - `/app/backend/services/email_service.py` - Service email isolé
   - `/app/backend/models/__init__.py` - Modèles Pydantic
   - `/app/backend/README.md` - Documentation architecture

---

## Tests Passés
- Iteration 15: 100% (18/18 tests)
- Iteration 16: 100% (12/12 tests backend + UI vérifié)

---

## Limitations Connues

### ⚠️ Mode Test
- **PayTech**: Paiements en mode TEST uniquement
- **MailerSend**: Mode trial avec limite de destinataires
- **Google OAuth**: Bloqué dans les webviews (tester dans Chrome/Safari)

---

## Upcoming Tasks

### P1 - High Priority
- [ ] Push Notifications Web
- [ ] Continuer le refactoring de `server.py`
- [ ] Tests e2e complets avec Playwright

### P2 - Medium Priority
- [ ] WhatsApp Business API pour confirmations
- [ ] Avis clients avec photos
- [ ] Exit-intent popup newsletter

### P3 - Future
- [ ] Cartes cadeaux
- [ ] Bundles produits
- [ ] Historique des prix

---

## URLs Importantes
- **Preview**: https://yamaplusfix.preview.emergentagent.com
- **Admin**: https://yamaplusfix.preview.emergentagent.com/admin
- **Production (DNS à configurer)**: https://groupeyamaplus.com

## Credentials Test
- **Admin**: admin@yama.sn / admin123

---
*Last updated: February 5, 2026*
