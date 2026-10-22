<div align="center">
  <img src="https://via.placeholder.com/150x150.png?text=Labyrinthe+Icon" alt="Labyrinthe Logo" width="120" height="120">
  
  <h1>🧭 Labyrinthe</h1>

  <p><strong>Application desktop avancée de génération, d'exploration et de gestion de labyrinthes.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Electron-41.3.0-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron Version">
    <img src="https://img.shields.io/badge/Node.js-%3E%3D14.0.0-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js Version">
    <img src="https://img.shields.io/badge/SQLite-12.9.0-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite Version">
    <img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" alt="License ISC">
  </p>
</div>

---

## 📖 À propos du projet

**Labyrinthe** est une solution complète développée en JavaScript s'appuyant sur le framework **Electron**. Elle offre une expérience riche mêlant la génération procédurale de labyrinthes, une interface d'exploration interactive et un système complet de gestion des utilisateurs.

Ce projet se distingue par son approche modulaire et ses algorithmes de génération dynamique adaptés au niveau de difficulté choisi.

---

## ✨ Fonctionnalités Clés

Nous avons structuré les fonctionnalités en plusieurs catégories distinctes pour répondre aux besoins de chaque type d'utilisateur.

### 🎮 Expérience de Jeu (Joueurs)
* **Génération Procédurale** : Chaque labyrinthe est unique.
* **10 Niveaux de Difficulté** : D'une balade de santé (Niveau 1) à un défi d'orientation extrême (Niveau 10).
* **Exploration Interactive** : Contrôles fluides pour naviguer du point d'entrée à la sortie.
* **Tableau de Bord Personnel** : Suivi de vos statistiques, de vos parties et de vos temps de résolution.

### ⚙️ Administration (Gestionnaires)
* **Panneau d'Administration Dédié** : Interface sécurisée pour gérer la plateforme.
* **Gestion des Utilisateurs** : Visualisation, édition et suppression des comptes.
* **Statistiques Globales** : Vue d'ensemble de l'utilisation de l'application.

### 🛡️ Sécurité & Système
* **Authentification Complète** : Système de connexion et d'inscription avec persistance de session.
* **Isolation Electron** : Utilisation de scripts `preload` sécurisés pour la communication inter-processus (IPC).
* **Persistance Locale** : Base de données SQLite embarquée (`better-sqlite3`) pour une sauvegarde rapide et fiable des données.

---

## 🏗️ Architecture Technique

Le projet repose sur une architecture moderne séparant clairement la logique métier, l'accès aux données et l'interface utilisateur.

### 🖥️ Frontend (Renderer Process)
Interface utilisateur réactive et intuitive développée en technologies web standard (HTML, CSS, JS).
* `renderer/index.html` : Point d'entrée des vues (Login, Dashboard, Éditeur, Admin).
* `renderer/app.js` : Logique applicative côté client et communication IPC.
* `renderer/style.css` : Design system moderne et responsive.

### ⚙️ Backend (Main Process)
Logique principale propulsée par Node.js via Electron.
* `main.js` : Gestion du cycle de vie de l'application et des fenêtres.
* `auth.js` : Contrôleurs d'authentification et gestion des sessions.
* `admin.js` : Contrôleurs pour les fonctionnalités d'administration.

### 🧠 Moteur Algorithmique
* `labyrinth.js` : Cœur du système. Implémente divers algorithmes selon la difficulté :
  * **Algorithme de Prim** : Pour les niveaux simples (1-3).
  * **Recursive Backtracker** : Pour les niveaux intermédiaires (4-7).
  * **Hybride / Impasses complexes** : Pour les niveaux difficiles (8-10).

### 💾 Base de données
* `database.js` : Interface avec SQLite gérant la persistance des utilisateurs et des scores de manière synchrone et performante.

---

## 🚀 Installation & Démarrage

### Prérequis
* [Node.js](https://nodejs.org/) (Version 14.0.0 ou supérieure)
* npm (inclus avec Node.js) ou yarn

### Guide pas à pas

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/Michi-esc/Labyrinthe.git
   cd Labyrinthe
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Lancer l'application**
   ```bash
   npm start
   ```
   *L'application va compiler et lancer la fenêtre Electron.*

---

## 📁 Structure du Répertoire

```text
Labyrinthe/
├── package.json          # Dépendances et configuration npm
├── main.js               # Entrée Electron (Main Process)
├── preload.js            # Script pont sécurisé (IPC)
├── labyrinth.js          # Moteur de génération des labyrinthes
├── auth.js               # Gestionnaire d'authentification
├── admin.js              # Gestionnaire du panel administrateur
├── database.js           # Configuration SQLite
├── labyrinthe.db         # Fichier de base de données (généré)
└── renderer/             # Fichiers de l'interface (Frontend)
    ├── index.html
    ├── app.js
    └── style.css
```

---

## 🗺️ Feuille de Route (Roadmap)

Nous avons de grandes ambitions pour l'évolution de **Labyrinthe**. Voici les prochaines étapes prévues :

* **[Sécurité]** Implémentation du hachage `bcrypt` pour les mots de passe.
* **[Gameplay]** Ajout d'un chronomètre et d'un système de scoring mondial.
* **[Fonctionnalité]** Possibilité d'exporter (PNG/JSON) et d'importer des labyrinthes personnalisés.
* **[UI/UX]** Support de thèmes (Sombre/Clair/Haut Contraste).
* **[Multijoueur]** Mode "Course de Labyrinthe" en réseau local.

---

## 🤝 Contribution

Les contributions font la force de la communauté open source ! Si vous souhaitez améliorer Labyrinthe, voici comment procéder :

1. Faites un Fork du projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/IncroyableFonctionnalite`)
3. Commitez vos changements (`git commit -m 'Ajout d'une IncroyableFonctionnalite'`)
4. Poussez vers la branche (`git push origin feature/IncroyableFonctionnalite`)
5. Ouvrez une **Pull Request**

N'hésitez pas à ouvrir une *Issue* pour discuter des changements majeurs que vous souhaitez apporter.

---

## 📄 Licence

Ce projet est distribué sous la licence **ISC**. Consultez le fichier `package.json` pour plus d'informations.

---

<div align="center">
  <b>Développé avec ❤️ par la communauté.</b><br>
  <a href="https://github.com/Michi-esc/Labyrinthe/issues">Signaler un bug</a> • 
  <a href="https://github.com/Michi-esc/Labyrinthe">Voir le code source</a>
</div>

## 👤 Auteur

Konaté Adama (@DaskoStudio) — Ynov Campus
