# YAMA+ E-Commerce Platform - PRD

## Original Problem Statement
Plateforme e-commerce premium pour le marché sénégalais avec boutique en ligne, panneau d'administration, paiements (PayTech), authentification (JWT + Google), emails marketing, et fonctionnalités d'engagement.

## Technical Stack
- **Frontend**: React 18, TailwindCSS, Framer Motion, Shadcn/UI
- **Backend**: FastAPI (Python), APScheduler, MongoDB
- **Email**: MailerSend (transactionnel) + MailerLite (marketing)
- **Push**: Web Push Notifications (pywebpush, VAPID)
- **Auth**: JWT + Emergent Google Auth
- **Payments**: PayTech (production)

---

## Session: February 6, 2026 - Services Marketplace Complete ✅

### 🆕 NEW FEATURE: Services Marketplace

**Description**: Annuaire de prestataires professionnels au Sénégal (type Pages Jaunes modernes)

#### Backend APIs (Prefix: `/api/services/`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/categories` | GET | 10 catégories de services |
| `/locations` | GET | Villes du Sénégal + zones de Dakar |
| `/providers` | GET | Liste des prestataires (filtrable) |
| `/providers/{id}` | GET | Profil d'un prestataire |
| `/providers/{id}/reviews` | GET/POST | Avis sur un prestataire |
| `/requests` | POST | Créer une demande de service |
| `/requests/{id}` | GET | Suivre une demande |
| `/provider/me` | GET/PUT | Dashboard prestataire |

#### Admin APIs (Prefix: `/api/admin/`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/service-providers` | GET | Liste tous les prestataires |
| `/service-providers/{id}` | PUT/DELETE | Modifier/Supprimer un prestataire |
| `/service-requests` | GET | Liste toutes les demandes |
| `/service-requests/{id}` | PUT | Assigner/Modifier statut |

#### Frontend Pages
- `/services` - Page principale avec catégories et recherche
- `/provider/{id}` - Profil prestataire public
- `/services/request` - Formulaire de demande de service
- `/provider/register/{code}` - Inscription prestataire (privée)
- `/provider/dashboard` - Dashboard prestataire
- `/admin/service-providers` - Gestion admin des prestataires
- `/admin/service-requests` - Gestion admin des demandes

#### Catégories de Services
1. 🏠 Maison & Construction (Peintre, Maçon, Carreleur, Menuisier...)
2. ⚡ Électricité & Plomberie (Électricien, Plombier, Climatisation...)
3. 🚗 Auto & Mécanique (Mécanicien, Soudeur, Carrossier...)
4. 💅 Beauté & Bien-être (Coiffeur, Esthéticienne, Massage...)
5. 💻 Tech & Réparation (Informaticien, Réparateur téléphone...)
6. 🧹 Nettoyage & Maison (Femme de ménage, Jardinier...)
7. 🚚 Transport & Déménagement (Déménageur, Coursier...)
8. 🎉 Événements & Animation (DJ, Photographe, Traiteur...)
9. 📚 Éducation & Cours (Professeur, Coach, Traducteur...)
10. 🔧 Autres Services (Couturier, Serrurier, Forgeron...)

#### Codes d'Invitation Prestataires
- `YAMAPLUS2025`
- `PRESTATAIRE`
- `SERVICEPRO`

#### Sécurité Implémentée
- ✅ Mots de passe exclus des réponses API
- ✅ Inscription prestataire par invitation seulement
- ✅ Approbation admin requise avant visibilité
- ✅ Badge "Vérifié" contrôlé par admin

---

## Completed Features

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
- [x] Gestion produits
- [x] Gestion commandes
- [x] Gestion utilisateurs
- [x] Gestion rendez-vous
- [x] **Gestion prestataires** (NEW)
- [x] **Gestion demandes de services** (NEW)
- [x] Paniers abandonnés
- [x] Campagnes email

---

## Backlog / Future Tasks

### P1 - High Priority
- [ ] Upload de photos pour prestataires
- [ ] Système de notation/avis prestataires (côté client)
- [ ] Profils premium/sponsorisés (monétisation)

### P2 - Medium Priority
- [ ] Notifications push pour nouvelles demandes
- [ ] Statistiques avancées pour prestataires
- [ ] Intégration calendrier pour RDV prestataires

### P3 - Low Priority
- [ ] Application mobile prestataire
- [ ] Système de paiement pour services
- [ ] Chat direct client-prestataire

---

## Test Credentials
- **Admin**: admin@yama.sn / admin123
- **Preview URL**: https://pro-connect-42.preview.emergentagent.com

## Test Data
- **Provider**: PRV-FAB5D4AD (Mamadou Ndiaye - Plombier)
- **Service Request**: SR-3944A8AE
- **Invitation Codes**: YAMAPLUS2025, PRESTATAIRE, SERVICEPRO

---

*Last updated: February 6, 2026*
