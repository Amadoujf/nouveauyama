# Guide de lancement en local - GROUPE YAMA+

## Problème résolu

Ce projet utilise une pile de dépendances spécifique pour éviter les conflits entre :
- **ajv** (validation JSON schema)
- **schema-utils** (utilisé par Webpack)
- **terser-webpack-plugin** (minification)

### Versions forcées (via `overrides` et `resolutions` dans package.json) :

| Package | Version |
|---------|---------|
| ajv | 6.12.6 |
| ajv-keywords | 3.5.2 |
| schema-utils | 2.7.1 |
| terser-webpack-plugin | 4.2.3 |

Ces versions sont nécessaires car :
- CRA/CRACO utilise ajv 6.x
- ajv-keywords 3.x est compatible uniquement avec ajv 6.x
- schema-utils 2.x fonctionne avec ajv 6.x
- terser-webpack-plugin 4.x utilise schema-utils 2.x

## Prérequis

- **Node.js** : Version 18 ou 20
- **npm** : Version 8 ou supérieure

Vérifier les versions :
```powershell
node --version
npm --version
```

## Commandes de lancement

### Étape 1 : Se placer dans le dossier frontend

```powershell
cd frontend
```

### Étape 2 : Nettoyer les anciennes installations

```powershell
# Supprimer node_modules
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# Supprimer les fichiers de lock
Remove-Item package-lock.json -ErrorAction SilentlyContinue
Remove-Item yarn.lock -ErrorAction SilentlyContinue
```

### Étape 3 : Installer les dépendances

```powershell
npm install --legacy-peer-deps
```

> **Note** : Le flag `--legacy-peer-deps` est nécessaire car React 19 a des conflits de peer dependencies avec certains packages.

### Étape 4 : Lancer le serveur de développement

```powershell
npm start
```

### Étape 5 : Ouvrir le site

Une fois que vous voyez **"Compiled successfully"** dans la console, ouvrez :

**http://localhost:3000**

## Script automatique

Un script `OUVRIR_SITE.bat` est disponible à la racine du projet pour automatiser ces étapes.

## Résolution des erreurs courantes

### Erreur : "Unknown keyword formatMinimum"
**Cause** : Conflit entre ajv v6 et v8
**Solution** : Les `overrides` dans package.json corrigent ce problème. Refaire l'installation propre.

### Erreur : "Cannot find module 'ajv/dist/compile/codegen'"
**Cause** : Mauvaise version de ajv installée
**Solution** : Supprimer `node_modules` et réinstaller avec `--legacy-peer-deps`

### Erreur : "validate is not a function"
**Cause** : Incompatibilité entre terser-webpack-plugin et schema-utils
**Solution** : Les versions forcées dans package.json règlent ce problème.

### Erreur ERESOLVE avec date-fns
**Cause** : react-day-picker exige date-fns ^2 ou ^3, pas v4
**Solution** : date-fns est maintenant fixé à ^3.6.0 dans package.json

## Configuration du backend

Le frontend a besoin du backend pour fonctionner. Voir le fichier `README.md` à la racine pour les instructions de configuration du backend.

## Variables d'environnement

Créer un fichier `.env` dans le dossier `frontend` :

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

Pour la production, remplacer par l'URL de votre serveur.
