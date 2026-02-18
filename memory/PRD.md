# GROUPE YAMA+ - Product Requirements Document

## Project Summary

**GROUPE YAMA+** est une plateforme marketplace e-commerce complète pour le Sénégal, incluant:
- Vente de produits (électronique, électroménager, décoration, beauté, automobile)
- Services marketplace (prestataires)
- Gestion commerciale B2B (devis, factures, contrats)
- Paiements mobile money (Wave, Orange Money via PayTech)

## Current Status: ✅ ACTIF SUR EMERGENT

### Session du 18 Février 2026 - Corrections de bugs critiques

#### Bugs corrigés :

1. **Images uploadées cassées** ✅ CORRIGÉ
   - Problème: Les URLs d'images pointaient vers un domaine incorrect
   - Solution: Le backend retourne maintenant des URLs relatives (`/api/uploads/filename.ext`) 
   - Le frontend convertit ces URLs en URLs absolues en utilisant `REACT_APP_BACKEND_URL`
   - Fichiers modifiés: `backend/server.py`, `AdminPage.js`, `ProductFormModal.js`, `ProviderDashboardPage.js`

2. **Déconnexion au rafraîchissement** ✅ CORRIGÉ
   - Problème: L'utilisateur était redirigé vers /login quand il rafraîchissait la page
   - Solution: Les pages protégées affichent un spinner pendant que `authLoading` est `true`
   - Fichiers modifiés: `AdminPage.js`, `ProviderDashboardPage.js`

## Architecture Technique

```
/app/
├── backend/
│   ├── server.py           # API FastAPI monolithique
│   ├── uploads/            # Dossier des images uploadées
│   ├── requirements.txt    # Dépendances Python
│   └── .env                # Configuration (Paytech, MailerSend, etc.)
└── frontend/
    ├── src/
    │   ├── contexts/
    │   │   ├── AuthContext.js    # Gestion auth avec loading state
    │   │   ├── CartContext.js    # Panier
    │   │   └── WishlistContext.js
    │   ├── pages/                 # Pages React
    │   └── components/            # Composants UI (dont ProductFormModal.js)
    └── package.json
```

## External Services

| Service | Status |
|---------|--------|
| MongoDB | ✅ Actif |
| Google OAuth (Emergent) | ✅ Actif |
| PayTech | ⚠️ Clés production ajoutées (à vérifier avec transaction réelle) |
| MailerSend | ✅ Actif |
| MailerLite | ✅ Actif |
| OpenAI/Emergent LLM | ✅ Actif |

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@yama.sn | admin123 |
| Provider | mamadou@provider.com | password123 |

## URLs

- **Preview** : https://image-upload-fix-26.preview.emergentagent.com
- **Production** : https://groupeyamaplus.com
- **API** : /api (prefix requis pour toutes les routes backend)

## Key Endpoints

- `POST /api/auth/login` - Connexion utilisateur
- `GET /api/auth/me` - Vérification session
- `POST /api/upload/image` - Upload d'image (retourne URL relative)
- `GET /api/uploads/{filename}` - Servir les images uploadées
- `GET /api/products` - Liste des produits
- `POST /api/products` - Créer un produit (admin)

## Bugs en attente de vérification utilisateur

1. **PayTech Production** - Les clés ont été mises à jour, une transaction réelle doit être testée
2. **Descriptions IA** - Le prompt a été amélioré, à vérifier par l'utilisateur

## Tâches futures

### P1 - Haute priorité
- Guide utilisateur pour Google Search Console

### P2 - Moyenne priorité
- Système d'abonnement pour prestataires
- Système de notation et avis

### P3 - Refactoring
- Diviser server.py en routes séparées
- Nettoyage des fichiers dupliqués

---

*Dernière mise à jour: 18 Février 2026*
*Status: Bugs critiques corrigés, en attente de validation utilisateur*
