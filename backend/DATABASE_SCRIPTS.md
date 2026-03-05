# Scripts de gestion de base de données

## 📊 Script de Seed (Données de test)

Génère des données de test réalistes pour le développement.

### Ce qui est créé :
- **5 catégories** (KilasyLasitra) : Ankizy, Tanoza, Zatovo, Tanora, Lehibe
- **5 classes** (Kilasy) avec nombre de membres défini
- **Registres pour chaque samedi** sur les 3 derniers mois
- **Données réalistes** : présences, offrandes, apprentissage, etc.

### Commandes :
```bash
# Générer les données de test
npm run db:seed

# Ou avec npx
npx tsx prisma/seed.ts
```

### Configuration :
Dans `prisma/seed.ts`, modifiez :
- `START_DATE` : Date de début des données
- `TEST_MODE` : `true` pour nettoyer avant de créer (développement), `false` pour ajouter sans effacer

---

## 🧹 Script de Cleanup (Nettoyage)

Supprime toutes les données de test pour préparer la production.

### Ce qui est supprimé :
- Tous les registres
- Toutes les classes (Kilasy)
- Toutes les catégories (KilasyLasitra)
- **Les utilisateurs sont conservés**

### Commandes :
```bash
# Nettoyer la base de données
npm run db:cleanup

# Ou avec npx
npx tsx prisma/cleanup.ts
```

---

## 🔄 Reset Complet

Nettoie ET régénère les données :

```bash
npm run db:reset
```

---

## 📝 Workflow recommandé

### Pour le développement :
```bash
# 1. Générer des données de test
npm run db:seed

# 2. Tester l'application
npm run dev

# 3. Si besoin de rafraîchir les données
npm run db:reset
```

### Avant la production :
```bash
# 1. Nettoyer toutes les données de test
npm run db:cleanup

# 2. Vérifier que la base est vide
# (Le script affiche le nombre d'éléments supprimés)

# 3. Créer les vraies données via l'interface
```

---

## 📈 Statistiques générées

Le script de seed affiche un résumé :
- Nombre de classes créées
- Nombre de registres générés
- Période couverte
- Total des présences
- Moyenne par sabbat
- Total des offrandes
- Total des apprentissages

Exemple de sortie :
```
📊 Résumé des données créées:
  - 5 classes
  - 5 catégories
  - 65 registres
  - Période: 01/12/2025 au 05/03/2026

📈 Statistiques globales:
  - Total présences: 1549
  - Présence moyenne/sabbat: 24
  - Total offrandes: 2 936 463 Ar
  - Total apprentissage: 1193
```

---

## ⚠️ Attention

- Le script de cleanup **supprime définitivement** toutes les données
- Sauvegardez votre base de données avant de lancer en production
- Le `TEST_MODE` dans `seed.ts` doit être mis à `false` pour la production

---

## 🐛 Dépannage

### Problème : Les statistiques ne trouvent pas les registres pour une date

**Symptôme** : Quand tu sélectionnes une date dans l'interface Stats, aucun registre n'est trouvé même si la date existe en base.

**Cause** : Problème de décalage horaire UTC. Les dates sont stockées en UTC dans SQLite.

**Solution** : Le filtrage utilise maintenant `lt: jourSuivant` au lieu de `lte: dateFin` pour inclure toute la journée.

### Problème : Token JWT expiré

**Solution** : Se reconnecter via l'interface de login (/login)

### Problème : Base de données corrompue

```bash
# Reset complet
npm run db:reset
```
