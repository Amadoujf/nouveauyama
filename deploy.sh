#!/bin/bash

# ============================================================
# Script de déploiement GROUPE YAMA+ sur VPS
# ============================================================

set -e

echo "========================================"
echo "  GROUPE YAMA+ - Déploiement VPS"
echo "========================================"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérification des prérequis
check_prerequisites() {
    echo -e "${YELLOW}Vérification des prérequis...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Docker n'est pas installé. Installation...${NC}"
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        rm get-docker.sh
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}Docker Compose n'est pas installé. Installation...${NC}"
        sudo apt install docker-compose -y
    fi
    
    echo -e "${GREEN}✓ Prérequis OK${NC}"
}

# Vérification des fichiers .env
check_env_files() {
    echo -e "${YELLOW}Vérification des fichiers .env...${NC}"
    
    if [ ! -f "backend/.env" ]; then
        echo -e "${RED}ERREUR: backend/.env n'existe pas!${NC}"
        echo "Créez le fichier backend/.env avec vos variables d'environnement."
        echo "Voir backend/.env.example pour un modèle."
        exit 1
    fi
    
    if [ ! -f "frontend/.env" ]; then
        echo -e "${RED}ERREUR: frontend/.env n'existe pas!${NC}"
        echo "Créez le fichier frontend/.env avec REACT_APP_BACKEND_URL"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Fichiers .env trouvés${NC}"
}

# Construction et démarrage
deploy() {
    echo -e "${YELLOW}Construction des images Docker...${NC}"
    docker-compose build --no-cache
    
    echo -e "${YELLOW}Démarrage des services...${NC}"
    docker-compose up -d
    
    echo -e "${GREEN}✓ Services démarrés${NC}"
}

# Vérification de santé
health_check() {
    echo -e "${YELLOW}Vérification de santé...${NC}"
    
    sleep 10
    
    # Vérifier MongoDB
    if docker-compose exec -T mongodb mongosh --eval "db.stats()" &> /dev/null; then
        echo -e "${GREEN}✓ MongoDB OK${NC}"
    else
        echo -e "${RED}✗ MongoDB ERREUR${NC}"
    fi
    
    # Vérifier Backend
    if curl -s http://localhost:8001/api/health | grep -q "healthy"; then
        echo -e "${GREEN}✓ Backend OK${NC}"
    else
        echo -e "${RED}✗ Backend ERREUR${NC}"
    fi
    
    # Vérifier Frontend
    if curl -s http://localhost:80 | grep -q "html"; then
        echo -e "${GREEN}✓ Frontend OK${NC}"
    else
        echo -e "${RED}✗ Frontend ERREUR${NC}"
    fi
}

# Menu principal
main() {
    case "$1" in
        deploy)
            check_prerequisites
            check_env_files
            deploy
            health_check
            ;;
        start)
            docker-compose up -d
            ;;
        stop)
            docker-compose down
            ;;
        restart)
            docker-compose restart
            ;;
        logs)
            docker-compose logs -f
            ;;
        status)
            docker-compose ps
            health_check
            ;;
        *)
            echo "Usage: $0 {deploy|start|stop|restart|logs|status}"
            echo ""
            echo "Commandes:"
            echo "  deploy  - Déploiement complet (build + start)"
            echo "  start   - Démarrer les services"
            echo "  stop    - Arrêter les services"
            echo "  restart - Redémarrer les services"
            echo "  logs    - Voir les logs en temps réel"
            echo "  status  - Voir l'état des services"
            exit 1
            ;;
    esac
}

main "$@"
