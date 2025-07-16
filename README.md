# site-rms-group
# Site Web de RMS International Group

![Logo RMS](https://www.grouperms.com/images/rms.jpg)

Bienvenue sur le dépôt du code source du site officiel de **RMS International Group**. Ce projet est un site vitrine statique moderne, entièrement responsive et bilingue, conçu pour présenter les services, l'expertise et les valeurs de l'entreprise.

**➡️ Voir le site en direct : [www.grouperms.com](https://www.grouperms.com)**

---

## 🚀 Fonctionnalités

* **Site Multi-pages** : Une page d'accueil complète et des pages dédiées pour chaque service offert.
* **Entièrement Responsive** : Design optimisé pour une consultation parfaite sur mobiles, tablettes et ordinateurs de bureau.
* **Bilingue (FR/EN)** : Un sélecteur de langue permet de basculer dynamiquement tout le contenu du site sans recharger la page.
* **Composants Dynamiques** : L'en-tête et le pied de page sont chargés dynamiquement avec JavaScript pour une maintenance simplifiée.
* **Formulaire de Contact Fonctionnel** :
    * Protection anti-spam avec Google reCAPTCHA v2.
    * Backend serverless utilisant **AWS Lambda** et **API Gateway**.
    * Envoi des notifications par e-mail via **Amazon SES**.
* **Formulaire de Newsletter Fonctionnel** :
    * Utilise également un backend serverless sur AWS pour une gestion unifiée.
* **Optimisations Modernes** :
    * Date de copyright dans le footer mise à jour automatiquement.
    * Fonctionnalités PWA de base via un `manifest.json`.
    * Optimisé pour le référencement (SEO) avec des balises méta complètes et un `sitemap.xml`.

---

## 🛠️ Stack Technique

Ce site a été construit avec des technologies web standard, en privilégiant la performance et la simplicité de maintenance.

#### ### Frontend
* HTML5 (Sémantique)
* CSS3 (avec variables pour une gestion facile des thèmes)
* JavaScript (ES6+) pour toute l'interactivité

#### ### Backend (Serverless sur AWS)
* **AWS Lambda** : Deux fonctions distinctes (Node.js) pour gérer les soumissions du formulaire de contact et de la newsletter.
* **Amazon API Gateway** : Expose les fonctions Lambda de manière sécurisée sur internet.
* **Amazon SES (Simple Email Service)** : Gère l'envoi des e-mails de notification.

#### ### Hébergement
* **AWS S3** : Pour l'hébergement des fichiers statiques du site.
* **Amazon CloudFront** : Utilisé comme CDN pour distribuer le contenu rapidement et gérer le HTTPS.
* **AWS Certificate Manager** : Pour le certificat SSL/TLS gratuit.

#### ### Services Tiers
* **Google reCAPTCHA v2** : Pour la protection des formulaires.
* **Google Fonts** : Pour le chargement des polices 'Montserrat' et 'Roboto'.
* **Font Awesome** : Pour les icônes.

---

## ⚙️ Déploiement

Le déploiement se fait en synchronisant les fichiers locaux du projet avec le bucket S3 configuré pour l'hébergement statique.

La commande utilisée est :
```bash
aws s3 sync . s3://[www.grouperms.com](https://www.grouperms.com) --delete
