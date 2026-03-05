#!/bin/bash

################################################################################
# SESA - Sekoly Sabata Management Application
# Script de démarrage
# 
# Usage: ./start.sh [options]
#
# Options:
#   --dev         Mode développement (démarre backend + frontend avec hot-reload)
#   --prod        Mode production (build + start)
#   --backend     Démarre uniquement le backend
#   --frontend    Démarre uniquement le frontend
#   --install     Installe les dépendances avant de démarrer
#   --seed        Génère les données de test après installation
#   --help        Affiche cette aide
#
# Exemples:
#   ./start.sh --dev              # Démarre en mode développement
#   ./start.sh --dev --install    # Installe et démarre en dev
#   ./start.sh --dev --seed       # Démarre en dev avec données de test
################################################################################

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Chemins
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Options
MODE="dev"
INSTALL=false
SEED=false
BACKEND_ONLY=false
FRONTEND_ONLY=false

################################################################################
# Functions
################################################################################

print_help() {
    cat << EOF
SESA - Sekoly Sabata Management Application

Usage: $0 [options]

Options:
  --dev         Mode développement (démarre backend + frontend avec hot-reload)
  --prod        Mode production (build + start)
  --backend     Démarre uniquement le backend
  --frontend    Démarre uniquement le frontend
  --install     Installe les dépendances avant de démarrer
  --seed        Génère les données de test après installation
  --help        Affiche cette aide

Exemples:
  $0 --dev              # Démarre en mode développement
  $0 --dev --install    # Installe et démarre en dev
  $0 --dev --seed       # Démarre en dev avec données de test
  $0 --prod             # Mode production
EOF
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_node() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé. Veuillez installer Node.js 18+"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js 18+ requis. Version actuelle: $(node -v)"
        exit 1
    fi
    
    log_success "Node.js $(node -v) détecté"
}

install_dependencies() {
    log_info "Installation des dépendances..."
    
    log_info "Backend..."
    cd "$BACKEND_DIR"
    npm install --silent
    
    log_info "Frontend..."
    cd "$FRONTEND_DIR"
    npm install --silent
    
    cd "$SCRIPT_DIR"
    log_success "Dépendances installées"
}

seed_database() {
    log_info "Génération des données de test..."
    cd "$BACKEND_DIR"
    
    # Vérifier si la base existe déjà
    if [ -f "prisma/dev.db" ]; then
        log_warning "Base de données existante détectée"
        read -p "Voulez-vous la supprimer et recréer les données ? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            npm run db:cleanup --silent
            npm run db:seed --silent
            log_success "Données de test générées"
        else
            log_info "Données existantes conservées"
        fi
    else
        npm run db:seed --silent
        log_success "Données de test générées"
    fi
    
    cd "$SCRIPT_DIR"
}

start_backend() {
    cd "$BACKEND_DIR"
    
    # Vérifier .env
    if [ ! -f ".env" ]; then
        log_warning ".env non trouvé. Création d'un fichier par défaut..."
        cat > .env << EOF
DATABASE_URL="file:./dev.db"
JWT_SECRET="sesa-secret-key-change-in-production-min-32-chars"
PORT=3001
EOF
        log_success ".env créé"
    fi
    
    # Générer Prisma Client
    if [ ! -d "node_modules/@prisma/client" ] || [ ! -f "prisma/dev.db" ]; then
        log_info "Initialisation de la base de données..."
        npm run db:generate --silent
        npm run db:push --silent
    fi
    
    if [ "$MODE" = "prod" ]; then
        log_info "Démarrage du backend en mode production..."
        npm run build --silent
        npm start
    else
        log_info "Démarrage du backend en mode développement..."
        npm run dev
    fi
}

start_frontend() {
    cd "$FRONTEND_DIR"
    
    if [ "$MODE" = "prod" ]; then
        log_info "Build du frontend en mode production..."
        npm run build --silent
        npm run preview
    else
        log_info "Démarrage du frontend en mode développement..."
        npm run dev
    fi
}

################################################################################
# Parse arguments
################################################################################

while [[ $# -gt 0 ]]; do
    case $1 in
        --dev)
            MODE="dev"
            shift
            ;;
        --prod)
            MODE="prod"
            shift
            ;;
        --backend)
            BACKEND_ONLY=true
            shift
            ;;
        --frontend)
            FRONTEND_ONLY=true
            shift
            ;;
        --install)
            INSTALL=true
            shift
            ;;
        --seed)
            SEED=true
            shift
            ;;
        --help|-h)
            print_help
            exit 0
            ;;
        *)
            log_error "Option inconnue: $1"
            print_help
            exit 1
            ;;
    esac
done

################################################################################
# Main
################################################################################

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   SESA - Sekoly Sabata Management Application             ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

check_node

if [ "$INSTALL" = true ]; then
    install_dependencies
fi

if [ "$SEED" = true ]; then
    seed_database
fi

# Démarrage des services
if [ "$BACKEND_ONLY" = true ]; then
    start_backend
elif [ "$FRONTEND_ONLY" = true ]; then
    start_frontend
else
    # Mode: Backend + Frontend
    log_info "Démarrage de l'application complète..."
    echo ""
    
    # Démarrer le backend en background
    cd "$BACKEND_DIR"
    
    # Vérifier .env
    if [ ! -f ".env" ]; then
        cat > .env << EOF
DATABASE_URL="file:./dev.db"
JWT_SECRET="sesa-secret-key-change-in-production-min-32-chars"
PORT=3001
EOF
    fi
    
    # Générer Prisma Client si nécessaire
    if [ ! -d "node_modules/@prisma/client" ] || [ ! -f "prisma/dev.db" ]; then
        log_info "Initialisation de la base de données..."
        npm run db:generate --silent
        npm run db:push --silent
    fi
    
    if [ "$MODE" = "prod" ]; then
        npm run build --silent
        npm start &
    else
        npm run dev &
    fi
    
    BACKEND_PID=$!
    
    # Attendre que le backend démarre
    sleep 3
    
    # Démarrer le frontend
    cd "$FRONTEND_DIR"
    if [ "$MODE" = "prod" ]; then
        npm run build --silent
        npm run preview
    else
        npm run dev
    fi
    
    # Gérer l'arrêt propre
    trap "kill $BACKEND_PID 2>/dev/null" EXIT
fi
