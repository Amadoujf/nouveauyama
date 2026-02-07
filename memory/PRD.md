# YAMA+ E-Commerce Platform - PRD

## Original Problem Statement
Plateforme e-commerce premium pour le marché sénégalais avec boutique en ligne, panneau d'administration, paiements (PayTech), authentification (JWT + Google), emails marketing, et fonctionnalités d'engagement.

## Technical Stack
- **Frontend**: React 18, TailwindCSS, Framer Motion, Shadcn/UI
- **Backend**: FastAPI (Python), APScheduler, MongoDB, ReportLab (PDF)
- **Email**: MailerSend (transactionnel) + MailerLite (marketing)
- **Push**: Web Push Notifications (pywebpush, VAPID)
- **Auth**: JWT + Emergent Google Auth
- **Payments**: PayTech (production)

---

## Session: February 6, 2026 - Complete ✅

### 🆕 Feature 1: Services Marketplace

**Description**: Annuaire de prestataires professionnels au Sénégal (type Pages Jaunes modernes)

#### Backend APIs (Prefix: `/api/services/`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/categories` | GET | 10 catégories de services |
| `/locations` | GET | Villes du Sénégal + zones de Dakar |
| `/providers` | GET | Liste des prestataires (filtrable) |
| `/providers/{id}` | GET | Profil d'un prestataire |
| `/requests` | POST | Créer une demande de service |
| `/provider/me` | GET/PUT | Dashboard prestataire |

#### Frontend Pages
- `/services` - Page principale avec catégories et recherche
- `/provider/{id}` - Profil prestataire public
- `/services/request` - Formulaire de demande de service
- `/provider/register/{code}` - Inscription prestataire (privée)
- `/admin/service-providers` - Gestion admin des prestataires
- `/admin/service-requests` - Gestion admin des demandes

---

### 🆕 Feature 2: Module Commercial (Gestion Commerciale)

**Description**: Outil complet de gestion commerciale pour GROUPE YAMA PLUS

#### Informations Entreprise (Auto sur tous documents)
```
GROUPE YAMA PLUS
Dakar – Sénégal
Email : contact@groupeyamaplus.com | Tel : 78 382 75 75
NINEA : 012808210 | RCCM : SN DKR 2026 A 4814
TVA non applicable
```

#### Backend APIs (Prefix: `/api/commercial/`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/partners` | GET/POST | Gestion des partenaires |
| `/partners/{id}` | GET/PUT/DELETE | Détails partenaire |
| `/quotes` | GET/POST | Gestion des devis |
| `/quotes/{id}` | GET/PUT | Détails devis |
| `/quotes/{id}/pdf` | GET | Télécharger PDF devis |
| `/quotes/{id}/convert-to-invoice` | POST | Convertir en facture |
| `/invoices` | GET/POST | Gestion des factures |
| `/invoices/{id}` | GET/PUT | Détails facture |
| `/invoices/{id}/pdf` | GET | Télécharger PDF facture |
| `/contracts` | GET/POST | Gestion des contrats |
| `/contracts/{id}` | GET/PUT | Détails contrat |
| `/contracts/{id}/pdf` | GET | Télécharger PDF contrat |
| `/contracts/templates` | GET | Modèles de contrats |
| `/dashboard` | GET | Statistiques commerciales |

#### Numérotation Automatique
- Devis: `YMP-DEV-2026-001`
- Factures: `YMP-FAC-2026-001`
- Pro forma: `YMP-PRO-2026-001`
- Contrats: `YMP-CTR-2026-001`

#### Statuts
- **Devis**: En attente / Accepté / Refusé
- **Factures**: Impayée / Partiellement payée / Payée
- **Contrats**: Brouillon / En cours / Signé / Expiré

#### Modèles de Contrats Pré-remplis
1. **Partenariat Commercial** - 8 articles avec clauses standards
2. **Sponsoring** - 7 articles
3. **Vendeur/Fournisseur** - 8 articles

---

### 🆕 Feature 3: Amélioration Module Produits

**Ajouts**:
- ✅ Onglet SEO dans le formulaire produit
- ✅ Champ Meta Title (60 car. max)
- ✅ Champ Meta Description (160 car. max)
- ✅ Aperçu Google en temps réel

---

## Completed Features Summary

### E-Commerce Core
- [x] Catalogue produits avec catégories
- [x] Panier et checkout
- [x] Paiements PayTech (production)
- [x] Gestion des commandes
- [x] Système de wishlist
- [x] Comparaison de produits
- [x] Avis clients

### Marketing & Engagement
- [x] Email marketing (MailerLite)
- [x] Push notifications web
- [x] Programme de fidélité
- [x] Parrainage
- [x] Codes promo
- [x] Ventes flash
- [x] Newsletter

### Administration
- [x] Dashboard analytique
- [x] Gestion produits (avec SEO)
- [x] Gestion commandes
- [x] Gestion utilisateurs
- [x] Gestion rendez-vous
- [x] **Gestion prestataires** (NEW)
- [x] **Gestion demandes de services** (NEW)
- [x] **Gestion commerciale** (NEW)
  - [x] Partenaires
  - [x] Devis avec PDF
  - [x] Factures avec PDF
  - [x] Contrats avec modèles et PDF
  - [x] **Envoi documents par email** (Feb 7, 2026)
- [x] Paniers abandonnés
- [x] Campagnes email

### Services Marketplace
- [x] Page Services avec design restauré et animations
- [x] 10 catégories avec emojis
- [x] Recherche et filtres par ville
- [x] Cartes prestataires avec actions
- [x] **Galerie photos prestataires** (Feb 7, 2026)

---

## Backlog / Future Tasks

### P1 - High Priority
- [ ] Signatures digitales pour contrats
- [ ] CRUD complet produits admin (toutes les fonctionnalités)
- [ ] Système de notation/avis prestataires

### P2 - Medium Priority
- [ ] Profils premium/sponsorisés (monétisation marketplace)
- [ ] Statistiques avancées pour prestataires
- [ ] Historique des paiements sur factures

### P3 - Low Priority
- [ ] Application mobile prestataire
- [ ] Système de paiement pour services
- [ ] Chat direct client-prestataire
- [ ] Export Excel des documents commerciaux

---

## Test Credentials
- **Admin**: admin@yama.sn / admin123
- **Preview URL**: https://service-hub-design.preview.emergentagent.com

## Test Data Created
- **Provider**: PRV-FAB5D4AD (Mamadou Ndiaye - Plombier)
- **Partner**: PART-C073D456 (Tech Solutions Sénégal)
- **Quote**: DEV-B65205FC (YMP-DEV-2026-001)
- **Invoice**: INV-E89A3766 (YMP-FAC-2026-001)
- **Contract**: CTR-0B5A17A8 (YMP-CTR-2026-001)

---

*Last updated: February 6, 2026*
