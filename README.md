# Secret Santa 🎅

Script Node.js pour organiser un tirage au sort Secret Santa avec envoi automatique d'emails.

## Table des matières

- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Fonctionnalités](#fonctionnalités)
- [Dépannage](#dépannage)
- [Sécurité](#sécurité)

## Installation

### Prérequis
- Node.js 14+ 
- npm

### Installation des dépendances
```bash
npm install
```

## Configuration

### 1. Configuration des participants
```bash
cp participants.example.json participants.json
```
Éditez `participants.json` et ajoutez vos participants avec leurs noms et emails.

### 2. Configuration email
```bash
cp .env.example .env
```
Remplissez le fichier `.env` avec vos identifiants email :

```env
EMAIL_SERVICE=gmail
EMAIL_USER=votre.email@gmail.com
EMAIL_PASSWORD=votre_mot_de_passe_app
ORGANIZER_NAME=Votre Nom
TEST_MODE=false
```

### 3. Configuration Gmail (recommandée)
Pour utiliser Gmail, créez un mot de passe d'application :

1. Allez sur https://myaccount.google.com/security
2. Activez la validation en 2 étapes
3. Allez dans "Mots de passe d'application"
4. Créez un mot de passe pour "Secret Santa"
5. Utilisez ce mot de passe dans `EMAIL_PASSWORD`

## Utilisation

### Mode production (envoi d'emails)
```bash
node secret-santa.js
```

### Mode test (sans envoi d'emails)
```bash
TEST_MODE=true node secret-santa.js
```
Ou modifiez `TEST_MODE=true` dans votre fichier `.env`.

## Fonctionnalités

- ✅ Tirage au sort intelligent (évite qu'une personne se tire elle-même)
- ✅ Gestion des contraintes (famille, couples)
- ✅ Templates d'emails personnalisés et aléatoires
- ✅ Mode test pour validation sans envoi
- ✅ Support de multiples services email
- ✅ Validation complète des données

## Dépannage

### Erreur d'authentification email
- Vérifiez que la validation en 2 étapes est activée
- Utilisez un mot de passe d'application, pas votre mot de passe habituel
- Vérifiez que `EMAIL_SERVICE` correspond à votre fournisseur

### Tirage au sort impossible
- Vérifiez qu'il y a au moins 3 participants
- Réduisez les contraintes si le tirage échoue après 1000 tentatives

## Sécurité

⚠️ **Important** : Ne commitez JAMAIS ces fichiers sensibles :
- `.env` (contient vos identifiants)
- `participants.json` (contient les emails personnels)

Ces fichiers sont dans `.gitignore` par sécurité.

## Structure du projet

```
secret-santa/
├── secret-santa.js         # Script principal
├── participants.json       # Liste des participants (à créer)
├── .env                    # Configuration email (à créer)
└── README.md               # Documentation
```

## Contribution

1. Forkez le projet
2. Créez une branche feature (`git checkout -b feature/amelioration`)
3. Commitez vos changements (`git commit -m 'Ajout fonctionnalité'`)
4. Poussez vers la branche (`git push origin feature/amelioration`)
5. Ouvrez une Pull Request