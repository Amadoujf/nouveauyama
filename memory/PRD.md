# GROUPE YAMA+ - Product Requirements Document

## Project Summary

**GROUPE YAMA+** est une plateforme marketplace e-commerce complète pour le Sénégal, incluant:
- Vente de produits (électronique, électroménager, décoration, beauté, automobile)
- Services marketplace (prestataires)
- Gestion commerciale B2B (devis, factures, contrats)
- Paiements mobile money (Wave, Orange Money via PayTech)

## Current Status: ✅ READY FOR EXPORT

### Session du 17 Février 2026

#### Corrections appliquées :

1. **Package.json** ✅
   - `date-fns` downgrade de ^4.1.0 vers ^3.6.0 (compatibilité react-day-picker)
   - Note: Les overrides ajv ne fonctionnent pas avec yarn sur ce projet

2. **Documentation créée** ✅
   - `frontend/LANCER_EN_LOCAL.md` - Guide de lancement local
   - `OUVRIR_SITE.bat` - Script Windows de lancement automatique
   - `MODIFICATIONS_PROJET.md` - Récapitulatif de toutes les modifications

3. **ScrollToTop amélioré** ✅
   - Support multi-navigateurs avec `requestAnimationFrame`
   - Gestion des hash (ancres) dans les URLs

### Problèmes analysés :

#### PayTech en mode test ⚠️ BLOQUÉ
- **Symptôme** : Paiements traités pour 104 FCFA au lieu du montant réel
- **Code vérifié** : `env=prod` est correctement envoyé à l'API
- **Conclusion** : Le compte PayTech n'est pas entièrement activé pour la production
- **Action requise** : Contacter le support PayTech

#### Liens internes cassés ✅ NON REPRODUIT
- **Analyse** : Les liens utilisent correctement React Router `<Link to="...">`
- **Test** : Navigation vers /a-propos fonctionne avec scroll position = 0
- **Conclusion** : Bug non reproductible dans les tests

## Files Created for Migration

```
/app/
├── README.md                  # Documentation complète
├── MODIFICATIONS_PROJET.md    # Récapitulatif des modifications (nouveau)
├── OUVRIR_SITE.bat            # Script de lancement Windows (nouveau)
├── docker-compose.yml         # Configuration Docker
├── database_backup.json       # Sauvegarde des données
├── backend/
│   ├── .env.example          # Variables d'environnement
│   ├── Dockerfile            # Image Docker backend
│   ├── backup_database.py    # Script de sauvegarde
│   └── restore_database.py   # Script de restauration
└── frontend/
    ├── .env.example          # Variables d'environnement
    ├── LANCER_EN_LOCAL.md    # Guide de lancement local (nouveau)
    ├── Dockerfile            # Image Docker frontend
    ├── nginx.conf            # Configuration Nginx
    └── public/assets/images/ # Images locales
```

## External Services Required

| Service | Purpose | Status |
|---------|---------|--------|
| MongoDB | Database | ✅ Actif |
| PayTech | Payments | ⚠️ Mode test (compte à activer) |
| MailerSend | Emails | ✅ Actif |
| MailerLite | Marketing | ✅ Actif |
| OpenAI | AI Features | ✅ Actif |

## Features Not Exportable (Post-migration)

1. **Google OAuth via Emergent** - Doit être reconfiguré via Google Cloud Console
2. **Emergent Preview URL** - Utiliser votre propre domaine

## Next Steps for User

1. **Export code** via "Save to Github"
2. **Clone repo** sur VPS
3. **Configure** les variables d'environnement (.env)
4. **Import** la sauvegarde de base de données
5. **Configurer** les webhooks PayTech avec votre URL de production
6. **Contacter PayTech** pour activer le mode production
7. **Configurer** DNS et SSL

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@yama.sn | admin123 |
| Provider | mamadou@provider.com | password123 |

---

*Dernière mise à jour: 17 Février 2026*
*Status: Prêt pour le déploiement en production*
