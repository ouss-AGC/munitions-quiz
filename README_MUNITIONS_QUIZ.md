# Quiz Généralités sur les Munitions LASM 3

## 📋 Description

Application web interactive de quiz pour l'évaluation des connaissances en **Généralités sur les Munitions** destinée aux élèves-officiers et officiers-élèves de l'Académie Militaire.

**Créé par** : Lt Col Oussama Atoui - Instructeur Armes et Munitions

---

## ✨ Fonctionnalités

### Pour les Étudiants
- ✅ **57 questions à choix multiples** couvrant tous les aspects des munitions
- ✅ **Briefing vocal en français** avec voix féminine
- ✅ **Timer de 60 secondes** par question
- ✅ **Système de PIN** pour contrôler l'accès aux sessions
- ✅ **Certificats PDF professionnels** avec logo de l'Académie Militaire
- ✅ **Attestations de participation** pour les scores < 10/20
- ✅ **Classement en temps réel** (Top 10)
- ✅ **Interface responsive** (mobile, tablette, desktop)

### Pour l'Administrateur
- ✅ **Tableau de bord complet** avec statistiques
- ✅ **Rapports PDF détaillés** par étudiant avec graphiques
- ✅ **Rapport consolidé** (tous les étudiants en un seul PDF)
- ✅ **Export CSV** pour analyse Excel
- ✅ **Authentification sécurisée** (2FA optionnelle)
- ✅ **Gestion des codes PIN** avec expiration

---

## 🎯 Contenu du Quiz

### Thèmes Couverts (57 Questions)

1. **Définitions et Classification**
   - Qu'est-ce qu'une munition ?
   - Types de munitions
   - Nomenclature et désignation

2. **Lotissement et Marquage**
   - Système de lotissement
   - Codes de situation
   - Marquage et identification

3. **Emballage et Types**
   - Munitions encartouchées
   - Munitions semi-encartouchées
   - Munitions à gargousse

4. **Matériaux Énergétiques**
   - Explosifs primaires et secondaires
   - Propergols
   - Chaînes pyrotechniques

5. **Calibres et Munitions**
   - Calibres OTAN (5.56mm, 7.62mm, 9mm, etc.)
   - Munitions d'artillerie (105mm, 155mm)
   - Munitions de petit calibre

6. **Effets et Fonctionnement**
   - Munitions balistiques
   - Munitions explosives
   - Munitions perforantes
   - Grenades à main

7. **Sécurité et Instruction**
   - Munitions inertes
   - Munitions à blanc
   - Procédures de sécurité

---

## 🚀 Déploiement

### Option 1 : Render.com (Recommandé - Gratuit)

1. **Créer un compte** sur [Render.com](https://render.com)

2. **Créer un nouveau "Static Site"**
   - Cliquez sur "New +" → "Static Site"
   - Connectez votre dépôt GitHub ou uploadez le code

3. **Configuration Build**
   ```
   Build Command: cd client && npm install && npm run build
   Publish Directory: client/dist
   ```

4. **Variables d'environnement** (optionnelles)
   - Aucune variable requise pour la version de base

5. **Déployer**
   - Cliquez sur "Create Static Site"
   - Attendez 2-3 minutes
   - Votre site sera accessible à l'URL fournie

### Option 2 : Vercel (Très Simple - Gratuit)

1. **Installer Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Déployer depuis le dossier client**
   ```bash
   cd client
   vercel
   ```

3. **Suivre les instructions** à l'écran
   - Login avec GitHub/GitLab/Email
   - Confirmer les paramètres
   - Le site sera déployé automatiquement

### Option 3 : Netlify (Simple - Gratuit)

1. **Créer un compte** sur [Netlify.com](https://netlify.com)

2. **Glisser-déposer**
   - Allez dans "Sites"
   - Glissez le dossier `client/dist` (après build)
   - Ou connectez votre dépôt Git

3. **Configuration Build**
   ```
   Base directory: client
   Build command: npm run build
   Publish directory: client/dist
   ```

---

## 💻 Installation Locale (Développement)

### Prérequis
- Node.js 18+ installé
- npm ou pnpm

### Étapes

1. **Installer les dépendances**
   ```bash
   cd client
   npm install
   ```

2. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

3. **Ouvrir dans le navigateur**
   ```
   http://localhost:5173
   ```

4. **Build pour production**
   ```bash
   npm run build
   ```
   Les fichiers seront dans `client/dist/`

---

## 🔐 Accès Administrateur

### Identifiants par Défaut
```
Nom d'utilisateur : admin
Mot de passe : Munitions2025
```

### Accès au Panneau Admin
1. Aller sur `/admin-login`
2. Entrer les identifiants
3. Optionnel : Configurer 2FA pour plus de sécurité

### Fonctionnalités Admin
- **Générer un code PIN** : Cliquez sur "Générer nouveau PIN"
- **Voir les résultats** : Tableau avec tous les étudiants
- **Télécharger rapports** : PDF individuels ou consolidé
- **Export CSV** : Pour analyse dans Excel

---

## 📊 Système de Notation

### Conversion Automatique
- **Score brut** : X/57 questions correctes
- **Note finale** : Convertie sur 20 points
- **Formule** : `(Score / 57) × 20`

### Observations (Certificats)
- **EXCELLENT** : ≥ 18/20
- **TRÈS BIEN** : ≥ 16/20
- **BIEN** : ≥ 14/20
- **ASSEZ BIEN** : ≥ 12/20
- **MOYEN** : ≥ 10/20
- **INSUFFISANT** : < 10/20

### Documents Générés
- **Score ≥ 10/20** : Certificat de Réussite
- **Score < 10/20** : Attestation de Participation

---

## 📁 Structure du Projet

```
Munitions_Quiz_Package/
├── client/                          # Application frontend
│   ├── public/
│   │   ├── quiz_data_agc.json      # 57 questions Munitions
│   │   └── academie_militaire.jpg  # Logo académie
│   ├── src/
│   │   ├── components/             # Composants React
│   │   ├── pages/                  # Pages de l'application
│   │   ├── contexts/               # Gestion d'état
│   │   ├── utils/                  # Générateurs PDF
│   │   └── types/                  # Types TypeScript
│   ├── package.json
│   └── vite.config.ts
├── README_MUNITIONS_QUIZ.md        # Ce fichier
└── GUIDE_DEPLOIEMENT.md            # Guide détaillé
```

---

## 🎨 Personnalisation

### Changer le Mot de Passe Admin
Modifier dans `client/src/contexts/AuthContext.tsx` :
```typescript
const DEFAULT_PASSWORD = 'VotreNouveauMotDePasse';
```

### Modifier les Questions
Éditer le fichier `client/public/quiz_data_agc.json`

### Changer le Timer
Modifier dans `client/src/contexts/QuizContext.tsx` :
```typescript
const QUESTION_TIME_LIMIT = 60; // secondes
```

### Personnaliser les Couleurs
Modifier dans `client/src/index.css` les variables CSS

---

## 🐛 Dépannage

### Le site ne se charge pas
1. Vérifier que Node.js 18+ est installé
2. Supprimer `node_modules` et `package-lock.json`
3. Réinstaller : `npm install`
4. Rebuild : `npm run build`

### Les questions ne s'affichent pas
1. Vérifier que `quiz_data_agc.json` est dans `client/public/`
2. Vérifier la syntaxe JSON (pas d'erreurs)
3. Vider le cache du navigateur

### Le briefing vocal ne fonctionne pas
- Le navigateur doit supporter Web Speech API
- Fonctionne sur Chrome, Edge, Safari
- Peut ne pas fonctionner sur Firefox

### Les PDF ne se génèrent pas
1. Vérifier que `jspdf` et `html2canvas` sont installés
2. Tester sur un navigateur récent
3. Désactiver les bloqueurs de pop-up

---

## 📞 Support

Pour toute question ou problème :
- **Instructeur** : Lt Col Oussama Atoui
- **Email** : [Votre email]
- **Institution** : Académie Militaire - République Tunisienne

---

## 📝 Licence

© 2025 Académie Militaire - République Tunisienne
Tous droits réservés.

Application développée pour usage pédagogique interne.

---

## 🎓 Crédits

**Développement** : Créé avec Manus AI
**Instructeur** : Lt Col Oussama Atoui
**Institution** : Académie Militaire de Tunisie
**Module** : LASM 3 - Généralités sur les Munitions
**Année Académique** : 2025/2026

---

**Bonne chance aux étudiants ! 🎯**
