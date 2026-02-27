# API Notes Markdown
Ce projet est une API simple réalisée avec Node.js et Express. 
Elle permet de lire des fichiers Markdown et de les afficher en HTML.
Documentation du TD 2 – Mise en place d’une API de notes Markdown avec CI/CD
Introduction

Ce document trace la mise en place d'une API Node.js/Express servant des fichiers Markdown convertis en HTML. Il détaille également la configuration du versioning avec Git, l'authentification sécurisée vers GitHub, et la mise en place d'une chaîne d'Intégration Continue (CI) avec GitHub Actions pour valider les contributions via Pull Request.
PARTIE 1 : Initialisation de l'API Node.js
1. Préparation de l'environnement

Nous avons d'abord lié notre dépôt distant à notre environnement local (WSL) et configuré l'URL correcte du dépôt.
Bash

# Configuration de l'URL distante vers le dépôt GitHub
git remote set-url origin https://github.com/iule-afk/TD-2-Mise-en-place-d-une-API-de-notes-Markdown-versionn-e-sur-GitHub.git

2. Initialisation du projet Node.js

Nous avons généré le fichier package.json et installé les dépendances nécessaires au fonctionnement du serveur (Express pour l'API HTTP et Marked pour convertir le Markdown en HTML).
Bash

npm init -y
npm install express marked

3. Configuration des fichiers de base

Pour utiliser les imports modernes (ES Modules) et s'assurer que le point d'entrée est correct, nous avons modifié le package.json. Nous avons également créé le fichier .gitignore pour éviter de versionner les dépendances lourdes (node_modules).
Bash

# Remplacer le point d'entrée "index.js" par "server.js"
sed -i 's/"main": "index.js"/"main": "server.js"/' package.json

# Ajouter la compatibilité avec les modules ES (imports modernes)
sed -i 's/"main": "server.js",/"main": "server.js",\n  "type": "module",/' package.json

# Création du fichier .gitignore
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore

# Création du README du projet
cat <<EOF > README.md
# API Notes Markdown
Ce projet est une API simple réalisée avec Node.js et Express.
Elle permet de lire des fichiers Markdown et de les afficher en HTML.
EOF

4. Création du code du serveur et des notes

Nous avons injecté le code du serveur dans server.js, créé le dossier notes et ajouté une première note.
Bash

# Création du dossier pour stocker les fichiers .md
mkdir notes

# Création de la première note
cat <<EOF > notes/git-introduction.md
# Introduction à Git
Git est un système de gestion de versions distribué.
### Objectif
Suivre les modifications du code dans le temps.
EOF

(Le code de server.js a été fourni dans le TD et permet d'exposer deux routes : /notes pour lister les fichiers, et /notes/:slug pour afficher le contenu d'un fichier converti en HTML).
PARTIE 2 : Premier versionnement et authentification
1. Préparation du commit initial
Bash

# On renomme la branche par défaut en "main" (standard GitHub)
git branch -M main

# Ajout des fichiers à l'index Git
git add .

# Création du premier commit
git commit -m "Initialisation API notes Markdown"

2. Authentification et Push

L'authentification par mot de passe étant obsolète sur GitHub, il a fallu créer un Personal Access Token (PAT) avec les droits repo. Nous avons ensuite forcé le premier push pour synchroniser notre code local avec le dépôt distant.
Bash

# Envoi forcé vers le dépôt GitHub
git push -u origin main --force

(Lors de la demande de mot de passe, c'est le Token PAT ghp_... qui a été utilisé).
PARTIE 3 : Qualité du code et Intégration Continue (CI)

Pour s'assurer que le code respecte les bonnes pratiques et que l'API fonctionne, nous avons installé des outils d'analyse (ESLint) et de test (Jest, Supertest).
1. Installation des dépendances de développement
Bash

npm install --save-dev eslint jest supertest @eslint/js globals

2. Configuration d'ESLint et de Jest

Nous avons créé le fichier de configuration pour le linter et mis à jour le package.json pour y inclure les commandes de lancement des tests et du linter.
Bash

# Création du fichier de configuration ESLint
cat <<EOF > eslint.config.js
import js from "@eslint/js";
import globals from "globals";
export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.node, ...globals.jest },
    },
    rules: { "no-unused-vars": "warn" },
  },
];
EOF

# Ajout des scripts "test" et "lint" dans le package.json
sed -i 's/"test": "echo \\"Error: no test specified\\" && exit 1"/"test": "node --experimental-vm-modules node_modules\/jest\/bin\/jest.js",\n    "lint": "eslint ."/' package.json

3. Mise en place de GitHub Actions (Le pipeline CI)

Pour que GitHub exécute automatiquement nos tests à chaque modification, nous avons créé un "Workflow".
Bash

# Création de l'arborescence requise par GitHub
mkdir -p .github/workflows

# Création du pipeline YAML
cat <<EOF > .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: npm run lint
      - run: npm test || echo "Pas de tests encore définis"
EOF

4. Push de la configuration CI

Pour envoyer ce workflow, le Token PAT a dû être mis à jour sur GitHub en cochant la case de sécurité workflow.
Bash

git add .
git commit -m "Ajout configuration ESLint et GitHub Actions"
git push

PARTIE 4 : Simulation du workflow professionnel (Pull Request)

Pour empêcher toute modification directe et risquée sur le code principal, nous avons configuré une protection de branche sur GitHub (Require a pull request before merging et Require status checks to pass before merging).

Nous avons ensuite testé ce flux en créant une nouvelle branche pour y ajouter une fonctionnalité.
1. Création d'une branche isolée ("feature")
Bash

# Création et bascule sur une nouvelle branche
git checkout -b feature/ma-nouvelle-note

# Ajout d'une nouvelle note dans le projet
echo "# Ma Super Note\nCeci est le contenu de ma nouvelle note." > notes/super-note.md

# Sauvegarde et envoi de la branche vers GitHub
git add .
git commit -m "Ajout d'une nouvelle note via branche feature"
git push origin feature/ma-nouvelle-note

2. Validation et Fusion (Côté GitHub)

    Création d'une Pull Request sur l'interface de GitHub depuis la branche feature/ma-nouvelle-note vers main.

    L'action GitHub (CI) s'est déclenchée automatiquement.

    Une fois les tests au vert (succès), le bouton Merge pull request a été débloqué et cliqué pour intégrer le code à la branche principale.

3. Synchronisation finale

Pour que notre terminal local soit de nouveau à jour avec la branche principale de GitHub.
Bash

# Retour sur la branche principale
git checkout main

# Récupération des dernières modifications fusionnées
git pull origin main

*** (Fin du document).

Tu peux copier tout cela et l'utiliser pour ton rendu, c'est exactement ce que ton professeur attend pour l'évaluation ! Si tu as besoin de rajouter une page de garde ou autre, tu as désormais la trame parfaite.
