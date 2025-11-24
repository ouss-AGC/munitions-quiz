# Guide de Déploiement Détaillé - Quiz Munitions LASM 3

## 🎯 Objectif

Ce guide vous accompagne **pas à pas** pour déployer votre application de quiz sur internet, **gratuitement**, sans compétences techniques avancées.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :
- ✅ Un ordinateur avec connexion internet
- ✅ Un compte email valide
- ✅ Le dossier `Munitions_Quiz_Package` complet

---

## 🚀 Méthode 1 : Render.com (Recommandée)

### Pourquoi Render ?
- ✅ **100% gratuit** pour les sites statiques
- ✅ **Très simple** à utiliser
- ✅ **SSL automatique** (HTTPS)
- ✅ **Déploiement rapide** (3-5 minutes)
- ✅ **URL personnalisable**

### Étapes Détaillées

#### Étape 1 : Créer un Compte Render

1. Allez sur [https://render.com](https://render.com)
2. Cliquez sur **"Get Started"** ou **"Sign Up"**
3. Inscrivez-vous avec :
   - Votre email professionnel
   - Ou votre compte GitHub/GitLab
4. Confirmez votre email

#### Étape 2 : Créer un Dépôt GitHub (Optionnel mais Recommandé)

1. Allez sur [https://github.com](https://github.com)
2. Créez un compte si vous n'en avez pas
3. Cliquez sur **"New Repository"**
4. Nommez-le : `munitions-quiz`
5. Cochez **"Public"** ou **"Private"**
6. Cliquez sur **"Create Repository"**

#### Étape 3 : Uploader le Code sur GitHub

**Option A : Via l'interface web**
1. Sur votre dépôt GitHub, cliquez sur **"Add file"** → **"Upload files"**
2. Glissez tous les fichiers du dossier `Munitions_Quiz_Package`
3. Cliquez sur **"Commit changes"**

**Option B : Via Git (ligne de commande)**
```bash
cd Munitions_Quiz_Package
git init
git add .
git commit -m "Initial commit - Munitions Quiz"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/munitions-quiz.git
git push -u origin main
```

#### Étape 4 : Connecter Render à GitHub

1. Sur Render.com, cliquez sur **"New +"** → **"Static Site"**
2. Cliquez sur **"Connect a repository"**
3. Autorisez Render à accéder à GitHub
4. Sélectionnez votre dépôt `munitions-quiz`

#### Étape 5 : Configuration du Build

Remplissez les champs suivants :

| Champ | Valeur |
|-------|--------|
| **Name** | `munitions-quiz` (ou votre choix) |
| **Branch** | `main` |
| **Root Directory** | `client` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

#### Étape 6 : Variables d'Environnement (Optionnel)

Pour cette version de base, **aucune variable n'est requise**.

#### Étape 7 : Déployer

1. Cliquez sur **"Create Static Site"**
2. Attendez 2-5 minutes pendant le build
3. Une fois terminé, vous verrez :
   - ✅ **Status : Live**
   - 🌐 **URL publique** : `https://munitions-quiz.onrender.com`

#### Étape 8 : Personnaliser l'URL (Optionnel)

1. Dans les paramètres du site
2. Section **"Settings"** → **"Custom Domain"**
3. Ajoutez votre propre domaine si vous en avez un

---

## 🌐 Méthode 2 : Vercel (Alternative Simple)

### Pourquoi Vercel ?
- ✅ **Déploiement ultra-rapide**
- ✅ **Interface moderne**
- ✅ **Excellent pour React**
- ✅ **Gratuit pour usage personnel**

### Étapes Détaillées

#### Étape 1 : Créer un Compte Vercel

1. Allez sur [https://vercel.com](https://vercel.com)
2. Cliquez sur **"Sign Up"**
3. Connectez-vous avec GitHub (recommandé)

#### Étape 2 : Uploader le Code sur GitHub

Suivez les mêmes étapes que pour Render (Méthode 1, Étape 3)

#### Étape 3 : Importer le Projet

1. Sur Vercel, cliquez sur **"Add New..."** → **"Project"**
2. Sélectionnez votre dépôt `munitions-quiz`
3. Cliquez sur **"Import"**

#### Étape 4 : Configuration

| Champ | Valeur |
|-------|--------|
| **Framework Preset** | Vite |
| **Root Directory** | `client` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

#### Étape 5 : Déployer

1. Cliquez sur **"Deploy"**
2. Attendez 1-2 minutes
3. Votre site est en ligne ! 🎉

---

## 📦 Méthode 3 : Netlify (Glisser-Déposer)

### Pourquoi Netlify ?
- ✅ **Le plus simple** (drag & drop)
- ✅ **Pas besoin de GitHub**
- ✅ **Gratuit**
- ✅ **Parfait pour les débutants**

### Étapes Détaillées

#### Étape 1 : Build Local

1. Ouvrez un terminal
2. Naviguez vers le dossier client :
   ```bash
   cd Munitions_Quiz_Package/client
   ```
3. Installez les dépendances :
   ```bash
   npm install
   ```
4. Créez le build de production :
   ```bash
   npm run build
   ```
5. Un dossier `dist` sera créé

#### Étape 2 : Créer un Compte Netlify

1. Allez sur [https://netlify.com](https://netlify.com)
2. Cliquez sur **"Sign Up"**
3. Inscrivez-vous avec email ou GitHub

#### Étape 3 : Déployer par Glisser-Déposer

1. Sur Netlify, allez dans **"Sites"**
2. Glissez le dossier **`dist`** dans la zone de dépôt
3. Attendez 30 secondes
4. Votre site est en ligne ! 🚀

#### Étape 4 : Personnaliser l'URL

1. Cliquez sur **"Site settings"**
2. **"Change site name"**
3. Choisissez : `munitions-quiz-lasm3`
4. Votre URL : `https://munitions-quiz-lasm3.netlify.app`

---

## 🔧 Configuration Post-Déploiement

### Tester le Site

1. **Page d'accueil** : Vérifiez que le titre s'affiche
2. **Briefing vocal** : Cliquez sur "Écouter"
3. **Formulaire** : Testez l'entrée du nom et PIN
4. **Admin** : Allez sur `/admin-login` et connectez-vous

### Générer le Premier Code PIN

1. Allez sur `VOTRE_URL/admin-login`
2. Connectez-vous :
   - Username : `admin`
   - Password : `Munitions2025`
3. Cliquez sur **"Générer nouveau PIN"**
4. Notez le code PIN (6 chiffres)
5. Partagez-le avec vos étudiants

### Partager avec les Étudiants

Envoyez-leur :
- 🌐 **L'URL du site** : `https://votre-site.com`
- 🔢 **Le code PIN** : `123456` (exemple)
- 📋 **Instructions** : Entrer nom complet, classe, numéro de registre

---

## 📊 Utilisation Quotidienne

### Avant Chaque Session

1. **Connectez-vous** à l'admin
2. **Générez un nouveau PIN** (expire après 4h)
3. **Affichez le PIN** sur l'écran de la classe
4. **Attendez** que les étudiants rejoignent
5. **Démarrez** la session pour tous

### Pendant la Session

- Les étudiants répondent aux 57 questions
- Timer de 60 secondes par question
- Progression visible en temps réel

### Après la Session

1. **Consultez les résultats** dans l'admin
2. **Téléchargez les certificats** (PDF individuels)
3. **Générez le rapport consolidé** (tous les étudiants)
4. **Exportez en CSV** pour archivage

---

## 🔐 Sécurité et Maintenance

### Changer le Mot de Passe Admin

**Important** : Changez le mot de passe par défaut !

1. Ouvrez le fichier : `client/src/contexts/AuthContext.tsx`
2. Trouvez la ligne :
   ```typescript
   const DEFAULT_PASSWORD = 'Munitions2025';
   ```
3. Remplacez par votre nouveau mot de passe :
   ```typescript
   const DEFAULT_PASSWORD = 'VotreMotDePasseSecurise2025!';
   ```
4. Sauvegardez et redéployez

### Activer 2FA (Authentification à Deux Facteurs)

1. Connectez-vous à l'admin
2. Allez dans **"Paramètres"** ou **"Sécurité"**
3. Cliquez sur **"Activer 2FA"**
4. Scannez le QR code avec Google Authenticator
5. Entrez le code de vérification

### Sauvegardes Régulières

- **Résultats** : Exportez en CSV chaque semaine
- **Rapports** : Téléchargez les PDF consolidés
- **Code source** : Gardez une copie locale

---

## 🐛 Résolution de Problèmes Courants

### Problème : Le site ne se charge pas

**Solutions** :
1. Vérifiez l'URL (pas d'erreur de frappe)
2. Videz le cache du navigateur (Ctrl+F5)
3. Testez sur un autre navigateur
4. Vérifiez les logs de déploiement

### Problème : Les questions ne s'affichent pas

**Solutions** :
1. Vérifiez que `quiz_data_agc.json` est dans `client/public/`
2. Vérifiez la syntaxe JSON (utilisez jsonlint.com)
3. Redéployez le site

### Problème : Le briefing vocal ne fonctionne pas

**Cause** : Navigateur incompatible

**Solutions** :
- Utilisez Chrome, Edge ou Safari
- Activez les permissions audio
- Testez avec un casque/haut-parleurs

### Problème : Code PIN invalide

**Solutions** :
1. Vérifiez que le PIN n'a pas expiré (4h max)
2. Générez un nouveau PIN
3. Vérifiez qu'il n'y a pas d'espaces dans le code

### Problème : Les PDF ne se téléchargent pas

**Solutions** :
1. Désactivez les bloqueurs de pop-up
2. Autorisez les téléchargements dans le navigateur
3. Testez sur un autre navigateur

---

## 📞 Support Technique

### Ressources en Ligne

- **Documentation Render** : [https://render.com/docs](https://render.com/docs)
- **Documentation Vercel** : [https://vercel.com/docs](https://vercel.com/docs)
- **Documentation Netlify** : [https://docs.netlify.com](https://docs.netlify.com)

### Contact

Pour assistance technique :
- **Instructeur** : Lt Col Oussama Atoui
- **Institution** : Académie Militaire

---

## ✅ Checklist de Déploiement

Avant de partager le site avec les étudiants :

- [ ] Site déployé et accessible
- [ ] Page d'accueil s'affiche correctement
- [ ] Briefing vocal fonctionne
- [ ] Questions se chargent (57 au total)
- [ ] Timer fonctionne (60 secondes)
- [ ] Formulaire d'entrée fonctionne
- [ ] Système de PIN fonctionne
- [ ] Admin accessible (`/admin-login`)
- [ ] Mot de passe admin changé
- [ ] Premier PIN généré
- [ ] Certificats PDF se génèrent
- [ ] Rapport consolidé fonctionne
- [ ] Export CSV fonctionne
- [ ] Site testé sur mobile
- [ ] URL partagée avec les étudiants

---

## 🎓 Conseils Pédagogiques

### Première Utilisation

1. **Session test** : Faites un test avec 2-3 étudiants
2. **Vérifiez** que tout fonctionne
3. **Ajustez** si nécessaire
4. **Lancez** la vraie session

### Pendant l'Évaluation

- Affichez le PIN sur un écran visible
- Surveillez le tableau de bord admin
- Soyez disponible pour les questions techniques
- Notez les problèmes éventuels

### Après l'Évaluation

- Téléchargez immédiatement tous les résultats
- Générez les certificats
- Archivez les rapports
- Analysez les statistiques de classe

---

**Bon déploiement ! 🚀**

Si vous rencontrez des difficultés, n'hésitez pas à consulter ce guide ou à demander de l'aide.
