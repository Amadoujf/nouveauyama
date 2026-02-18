# GROUPE YAMA+ - Product Requirements Document

## Project Summary

**GROUPE YAMA+** est une plateforme marketplace e-commerce complète pour le Sénégal, incluant:
- Vente de produits (électronique, électroménager, décoration, beauté, automobile)
- Services marketplace (prestataires)
- Gestion commerciale B2B (devis, factures, contrats)
- Paiements mobile money (Wave, Orange Money via PayTech)

## Current Status: ✅ ACTIF SUR EMERGENT

### Session du 17 Février 2026 - Restauration complète

#### Ce qui a été remis en place :

1. **Google OAuth Emergent** ✅
   - Bouton "Continuer avec Google" fonctionnel
   - Authentification via Emergent Auth Service

2. **emergentintegrations** ✅
   - Bibliothèque installée
   - `EMERGENT_LLM_KEY` configurée pour l'IA

3. **Toutes les fonctionnalités** ✅
   - Boutique e-commerce complète
   - Marketplace de services
   - Panel admin
   - Emails (MailerSend)
   - Notifications push

## Architecture Technique

```
/app/
├── backend/
│   ├── server.py           # API FastAPI
│   ├── requirements.txt    # Dépendances Python
│   └── .env                # Configuration
└── frontend/
    ├── src/
    │   ├── contexts/
    │   │   └── AuthContext.js  # Auth avec Google OAuth Emergent
    │   ├── pages/              # Pages React
    │   └── components/         # Composants UI
    └── package.json
```

## External Services

| Service | Status |
|---------|--------|
| MongoDB | ✅ Actif |
| Google OAuth (Emergent) | ✅ Actif |
| PayTech | ⚠️ Mode test (compte à activer) |
| MailerSend | ✅ Actif |
| MailerLite | ✅ Actif |
| OpenAI/Emergent LLM | ✅ Actif |

## Problème en suspens

### PayTech en mode test ⚠️
- Le code envoie `env=prod` correctement
- Le compte PayTech doit être activé pour la production
- **Action** : Contacter le support PayTech

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@yama.sn | admin123 |
| Provider | mamadou@provider.com | password123 |

## URLs

- **Preview** : https://image-upload-fix-26.preview.emergentagent.com
- **API** : https://image-upload-fix-26.preview.emergentagent.com/api

---

*Dernière mise à jour: 17 Février 2026*
*Status: Actif sur Emergent*
