# Guide de contribution

## 🎯 Comment contribuer

### 1. Forker le projet

### 2. Cloner votre fork
```bash
git clone https://github.com/votre-user/react-express.git
cd react-express
```

### 3. Créer une branche
```bash
git checkout -b feature/ma-fonctionnalite
```

### 4. Installer les dépendances
```bash
./start.sh --dev --install
```

### 5. Développer

### 6. Tester
```bash
# Backend
cd backend
npm run db:seed  # Données de test

# Frontend
cd frontend
npm run dev
```

### 7. Commiter
```bash
git commit -m "feat: ajout de ma fonctionnalité"
```

### 8. Pusher
```bash
git push origin feature/ma-fonctionnalite
```

### 9. Ouvrir une Pull Request

---

## 📝 Conventions de commit

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage, style
- `refactor:` Refactoring
- `test:` Tests
- `chore:` Maintenance

---

## 🧪 Tests

```bash
# Backend
cd backend
npm run db:seed
npm run dev

# Frontend
cd frontend
npm run dev
```

---

## 📖 Structure du code

### Backend
- Controllers dans `backend/src/controllers/`
- Routes dans `backend/src/routes/`
- Middleware dans `backend/src/middleware/`
- Schema Prisma dans `backend/prisma/schema.prisma`

### Frontend
- Pages dans `frontend/src/pages/`
- Composants dans `frontend/src/components/`
- Contextes dans `frontend/src/context/`

---

## 🔍 Revue de code

- Code clair et lisible
- Commentaires si nécessaire
- Tests si applicable
- Respect des conventions

---

## 📞 Questions

Ouvrez une issue GitHub pour toute question.
