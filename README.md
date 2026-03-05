# SESA - Sekoly Sabata Management Application

Application de gestion des écoles du Sabbat (Sekoly Sabata).

## 🚀 Démarrage rapide

### Prérequis

- **Node.js 18+**
- **npm** ou **yarn**

### Installation et démarrage

```bash
# Cloner le repository
git clone <url-du-repository>
cd react-express

# Installation et démarrage en mode développement
./start.sh --dev --install

# Avec données de test
./start.sh --dev --install --seed
```

### Autres commandes

```bash
# Mode développement (backend + frontend)
./start.sh --dev

# Mode production
./start.sh --prod

# Backend uniquement
./start.sh --backend

# Frontend uniquement
./start.sh --frontend

# Afficher l'aide
./start.sh --help
```

## 📁 Structure du projet

```
react-express/
├── backend/                 # API Express + Prisma + SQLite
│   ├── src/
│   │   ├── controllers/    # Contrôleurs API
│   │   ├── routes/         # Routes API
│   │   ├── middleware/     # Middleware (auth, etc.)
│   │   ├── config/         # Configuration
│   │   └── server.ts       # Point d'entrée
│   ├── prisma/
│   │   ├── schema.prisma   # Schéma de base de données
│   │   ├── seed.ts         # Script de données de test
│   │   └── cleanup.ts      # Script de nettoyage
│   └── package.json
│
├── frontend/                # Application React + Vite + Mantine
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── pages/          # Pages de l'application
│   │   ├── context/        # Contextes (Auth, etc.)
│   │   └── main.tsx        # Point d'entrée
│   └── package.json
│
├── start.sh                 # Script de démarrage
└── README.md
```

## 🛠️ Technologies

### Backend
- **Node.js** + **Express** - Serveur API
- **Prisma** - ORM
- **SQLite** - Base de données
- **JWT** - Authentification
- **bcryptjs** - Hachage de mots de passe

### Frontend
- **React 19** - Bibliothèque UI
- **Vite** - Build tool
- **Mantine 7** - Composants UI
- **React Router** - Navigation
- **Recharts** - Graphiques
- **Day.js** - Gestion des dates
- **XLSX** - Export Excel
- **jsPDF** - Export PDF

## 📊 Fonctionnalités

### Gestion des registres
- Enregistrement des présences par classe
- Suivi des indicateurs (mambra tonga, nianatra impito, etc.)
- Historique des sabbats

### Statistiques
- **Dashboard** avec KPI et tendances
- **Graphiques** (barres, lignes, camemberts)
- **Filtres** par période (sabata, mois, trimestre, semestre, année)
- **Comparaisons** avec période précédente
- **Exports** (CSV, Excel, PDF, Impression)
- **Rapports favoris** sauvegardés

### Classes (Kilasy)
- Ankizy
- Tanoza Zandriny
- Zatovo
- Tanora Zokiny
- Lehibe

## 🔐 Authentification

L'application utilise JWT pour l'authentification.

**Utilisateur par défaut (après seed):**
- Username: `raberia`
- Password: (défini lors de la création)

## 📝 Scripts de base de données

```bash
cd backend

# Générer les données de test
npm run db:seed

# Nettoyer la base de données
npm run db:cleanup

# Reset complet
npm run db:reset
```

## 🌐 URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Interface utilisateur |
| Backend API | http://localhost:3001 | API REST |
| Health Check | http://localhost:3001/api/health | État du serveur |

## 🔧 Configuration

### Backend (.env)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="votre-secret-key-min-32-caracteres"
PORT=3001
```

### Frontend

Le frontend utilise Vite et se configure via `vite.config.ts`.

## 📦 Installation manuelle

```bash
# Backend
cd backend
npm install
npm run db:generate
npm run db:push
npm run dev

# Frontend (dans un autre terminal)
cd frontend
npm install
npm run dev
```

## 🚀 Déploiement en production

```bash
# Build complet
./start.sh --prod

# Ou manuellement
cd backend
npm run build
npm start

cd ../frontend
npm run build
npm run preview
```

### Variables de production

- Changer `JWT_SECRET` avec une clé sécurisée
- Utiliser une base de données PostgreSQL (optionnel)
- Configurer HTTPS

## 📄 Licence

Propriétaire - Tous droits réservés

## 👥 Contributeurs

- SESA Team

## 📞 Support

Pour toute question ou problème, ouvrez une issue sur GitHub.
