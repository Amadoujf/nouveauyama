# GROUPE YAMA+ - Marketplace E-commerce

Une plateforme marketplace complète pour le Sénégal avec gestion des produits, services, prestataires, et paiements mobile money (Wave, Orange Money).

## 📋 Table des matières

- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation locale](#installation-locale)
- [Configuration](#configuration)
- [Déploiement VPS](#déploiement-vps)
- [Base de données](#base-de-données)
- [Fonctionnalités](#fonctionnalités)
- [APIs externes](#apis-externes)

## 🏗️ Architecture

```
/app/
├── backend/                 # API FastAPI (Python 3.11+)
│   ├── server.py           # Point d'entrée principal
│   ├── routes/             # Routes additionnelles
│   ├── services/           # Services (email, PDF)
│   ├── models/             # Modèles Pydantic
│   ├── uploads/            # Fichiers uploadés
│   └── requirements.txt
│
├── frontend/               # Application React
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   └── contexts/       # Contextes React
│   ├── public/
│   │   └── assets/images/  # Images statiques
│   └── package.json
│
└── database_backup.json    # Sauvegarde des données
```

## 📦 Prérequis

- **Python** 3.11 ou supérieur
- **Node.js** 18 ou supérieur
- **MongoDB** 6.0 ou supérieur
- **Yarn** (recommandé) ou npm

## 🚀 Installation locale

### 1. Cloner le projet

```bash
git clone <votre-repo> yama-marketplace
cd yama-marketplace
```

### 2. Backend

```bash
cd backend

# Créer un environnement virtuel
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Installer les dépendances
pip install -r requirements.txt

# Copier et configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Lancer le serveur de développement
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Frontend

```bash
cd frontend

# Installer les dépendances
yarn install
# ou
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Lancer le serveur de développement
yarn start
# ou
npm start
```

## ⚙️ Configuration

### Variables d'environnement Backend (.env)

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `MONGO_URL` | URL de connexion MongoDB | ✅ |
| `DB_NAME` | Nom de la base de données | ✅ |
| `JWT_SECRET` | Clé secrète pour les tokens JWT | ✅ |
| `SITE_URL` | URL du site (production) | ✅ |
| `MAILERSEND_API_KEY` | Clé API MailerSend | ✅ |
| `PAYTECH_API_KEY` | Clé API PayTech | ✅ |
| `PAYTECH_API_SECRET` | Secret API PayTech | ✅ |
| `VAPID_PUBLIC_KEY` | Clé publique VAPID | ⚠️ Notifications |
| `VAPID_PRIVATE_KEY` | Clé privée VAPID | ⚠️ Notifications |
| `OPENAI_API_KEY` | Clé API OpenAI | ❌ Optionnel |

### Variables d'environnement Frontend (.env)

| Variable | Description |
|----------|-------------|
| `REACT_APP_BACKEND_URL` | URL de l'API backend |
| `REACT_APP_VAPID_PUBLIC_KEY` | Clé VAPID pour notifications |

## 🖥️ Déploiement VPS (Hostinger)

### 1. Préparation du serveur

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer les dépendances
sudo apt install -y python3.11 python3.11-venv python3-pip nodejs npm nginx certbot python3-certbot-nginx

# Installer MongoDB
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/mongodb-6.gpg
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Installer Yarn
npm install -g yarn

# Installer PM2 pour la gestion des processus
npm install -g pm2
```

### 2. Déployer le code

```bash
# Créer le dossier de l'application
sudo mkdir -p /var/www/yama-marketplace
sudo chown -R $USER:$USER /var/www/yama-marketplace
cd /var/www/yama-marketplace

# Cloner le projet
git clone <votre-repo> .

# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Éditer .env

# Frontend
cd ../frontend
yarn install
yarn build
```

### 3. Configuration PM2 (Backend)

```bash
# Créer le fichier ecosystem
cat > /var/www/yama-marketplace/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'yama-backend',
    cwd: '/var/www/yama-marketplace/backend',
    script: 'venv/bin/uvicorn',
    args: 'server:app --host 0.0.0.0 --port 8001',
    interpreter: 'none',
    env: {
      NODE_ENV: 'production',
    }
  }]
}
EOF

# Démarrer avec PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Configuration Nginx

```nginx
# /etc/nginx/sites-available/yama-marketplace
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React build)
    root /var/www/yama-marketplace/frontend/build;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # API Backend proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # File upload size limit
        client_max_body_size 10M;
    }

    # Static files (uploads)
    location /api/uploads/ {
        alias /var/www/yama-marketplace/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # React SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/yama-marketplace /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL avec Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 5. Commandes de maintenance

```bash
# Voir les logs
pm2 logs yama-backend

# Redémarrer le backend
pm2 restart yama-backend

# Mettre à jour le code
cd /var/www/yama-marketplace
git pull
cd backend && source venv/bin/activate && pip install -r requirements.txt
cd ../frontend && yarn install && yarn build
pm2 restart yama-backend
sudo systemctl reload nginx
```

## 🗄️ Base de données

### Structure MongoDB

Collections principales :
- `users` - Utilisateurs et administrateurs
- `products` - Catalogue de produits
- `orders` - Commandes clients
- `service_providers` - Prestataires de services
- `service_requests` - Demandes de services
- `quotes` - Devis commerciaux
- `invoices` - Factures
- `contracts` - Contrats de partenariat
- `partners` - Partenaires commerciaux
- `appointments` - Rendez-vous
- `blog_posts` - Articles de blog
- `push_subscriptions` - Abonnements push

### Importer les données initiales

```bash
# Importer la sauvegarde
cd /var/www/yama-marketplace
mongoimport --db yama_marketplace --collection products --file database_backup.json --jsonArray
```

## ✨ Fonctionnalités

### E-commerce
- ✅ Catalogue produits avec catégories
- ✅ Panier et checkout
- ✅ Paiement PayTech (Wave, Orange Money)
- ✅ Gestion des commandes
- ✅ Codes promo
- ✅ Ventes flash

### Services Marketplace
- ✅ Inscription prestataires
- ✅ Demandes de services
- ✅ Rendez-vous en ligne
- ✅ Galerie photos prestataires

### Gestion Commerciale (B2B)
- ✅ Création de devis PDF
- ✅ Génération de factures
- ✅ Contrats avec signature digitale
- ✅ Gestion des partenaires
- ✅ Partage WhatsApp/Email

### Administration
- ✅ Dashboard analytics
- ✅ Gestion utilisateurs
- ✅ Gestion produits
- ✅ Notifications push
- ✅ Blog intégré

## 🔌 APIs externes

| Service | Utilisation | Documentation |
|---------|-------------|---------------|
| **PayTech** | Paiements mobile money | [paytech.sn](https://paytech.sn/) |
| **MailerSend** | Emails transactionnels | [mailersend.com](https://www.mailersend.com/) |
| **MailerLite** | Marketing automation | [mailerlite.com](https://www.mailerlite.com/) |
| **OpenAI** (optionnel) | Descriptions IA | [openai.com](https://openai.com/) |

## 🔒 Sécurité

- Authentification JWT avec expiration
- Hashage des mots de passe (bcrypt)
- Protection CORS configurée
- Validation des données (Pydantic)
- Rate limiting recommandé avec Nginx

## 📝 Notes de migration

### Remplacements effectués

Les URLs Emergent CDN ont été remplacées par des fichiers locaux dans `/public/assets/images/`:
- `logo_yama.png` - Logo principal
- `category_*.png/jpeg` - Images de catégories
- `payment_*.png/webp` - Icônes de paiement

### Fonctionnalités non incluses

- **Google Auth Emergent** : Remplacé par un système JWT standard. Si vous souhaitez Google OAuth, implémentez avec `passport-google-oauth20` ou `python-social-auth`.

## 📞 Support

Pour toute question technique :
- Email: contact@groupeyamaplus.com
- Téléphone: +221 78 382 75 75

---

**Version**: 1.0.0  
**Dernière mise à jour**: Février 2026
