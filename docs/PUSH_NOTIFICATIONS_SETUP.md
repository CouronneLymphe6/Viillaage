# 📱 Guide de Configuration des Notifications Push - Viillaage

## 🎯 Vue d'ensemble

Ce guide vous explique comment configurer les **notifications push natives** pour l'application Viillaage. Les notifications push permettent d'envoyer des alertes directement sur le téléphone de l'utilisateur, même lorsque l'application n'est pas ouverte.

---

## ✅ Ce qui a été implémenté

### 1. **Infrastructure Backend**
- ✅ Modèle `PushSubscription` dans Prisma (déjà existant)
- ✅ Utilitaire `pushNotifications.ts` pour gérer l'envoi
- ✅ Intégration automatique avec `notificationHelper.ts`
- ✅ API `/api/push/subscribe` pour enregistrer les abonnements
- ✅ API `/api/push/send` pour envoyer manuellement (admin uniquement)

### 2. **Infrastructure Frontend**
- ✅ Service Worker (`public/sw.js`) configuré
- ✅ Composant `PushNotificationManager` pour demander la permission
- ✅ Intégration dans le layout principal de l'application

### 3. **Fonctionnalités**
- ✅ Envoi automatique de notifications push à chaque notification créée
- ✅ Respect des préférences utilisateur (`enablePush`)
- ✅ Nettoyage automatique des abonnements invalides
- ✅ Support multi-appareils (un utilisateur peut avoir plusieurs abonnements)
- ✅ Fire-and-forget (n'affecte pas les performances)

---

## 🚀 Configuration Étape par Étape

### **Étape 1 : Générer les clés VAPID**

Les clés VAPID sont nécessaires pour authentifier les notifications push.

```bash
# Dans le dossier du projet
node scripts/generate-vapid-keys.js
```

Vous obtiendrez un résultat comme :

```
🔐 Generating VAPID keys for Web Push notifications...

✅ VAPID keys generated successfully!

📋 Add these to your .env file:

─────────────────────────────────────────────────────────────
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKxxx...xxxxx
VAPID_PRIVATE_KEY=xxx...xxxxx
VAPID_SUBJECT=mailto:contact@viillaage.fr
─────────────────────────────────────────────────────────────
```

### **Étape 2 : Ajouter les clés à votre fichier `.env`**

Copiez les trois variables dans votre fichier `.env` local :

```env
# Push Notifications (Web Push)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKxxx...xxxxx
VAPID_PRIVATE_KEY=xxx...xxxxx
VAPID_SUBJECT=mailto:contact@viillaage.fr
```

⚠️ **IMPORTANT** :
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` : Clé publique (peut être exposée au client)
- `VAPID_PRIVATE_KEY` : Clé privée (DOIT rester secrète, ne jamais la commiter)
- `VAPID_SUBJECT` : Email de contact (utilisé par les navigateurs)

### **Étape 3 : Configurer Vercel**

1. Allez sur [vercel.com](https://vercel.com) et ouvrez votre projet
2. Allez dans **Settings** → **Environment Variables**
3. Ajoutez les trois variables :

| Variable | Valeur | Environnements |
|----------|--------|----------------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Votre clé publique | Production, Preview, Development |
| `VAPID_PRIVATE_KEY` | Votre clé privée | Production, Preview, Development |
| `VAPID_SUBJECT` | `mailto:contact@viillaage.fr` | Production, Preview, Development |

4. **Redéployez** votre application pour que les variables prennent effet

### **Étape 4 : Tester en local**

```bash
# Démarrer le serveur de développement
npm run dev
```

1. Ouvrez l'application dans votre navigateur
2. Vous devriez voir une bannière verte en haut : **"Activez les notifications pour ne rien rater du village !"**
3. Cliquez sur **"Activer"**
4. Acceptez la permission dans la popup du navigateur
5. Testez en créant une alerte, un message, etc.

---

## 🔧 Comment ça fonctionne

### **Flux d'activation**

```
1. Utilisateur clique sur "Activer" dans PushNotificationManager
   ↓
2. Le navigateur demande la permission
   ↓
3. Si accepté, un abonnement push est créé
   ↓
4. L'abonnement est envoyé à /api/push/subscribe
   ↓
5. L'abonnement est stocké dans la base de données
```

### **Flux d'envoi**

```
1. Une action se produit (nouveau message, alerte, etc.)
   ↓
2. createNotification() est appelé dans notificationHelper.ts
   ↓
3. La notification est créée en base de données
   ↓
4. sendPushNotification() est appelé automatiquement (fire-and-forget)
   ↓
5. Les préférences utilisateur sont vérifiées (enablePush)
   ↓
6. Si activé, la notification est envoyée via web-push
   ↓
7. Le service worker reçoit la notification
   ↓
8. La notification s'affiche sur l'appareil de l'utilisateur
```

---

## 📱 Compatibilité

### **Navigateurs supportés**
- ✅ Chrome (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Edge (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile iOS 16.4+)
- ✅ Opera (Desktop & Mobile)

### **Systèmes d'exploitation**
- ✅ Windows 10+
- ✅ macOS 10.14+
- ✅ Android 5.0+
- ✅ iOS 16.4+ (Safari uniquement)

---

## 🎛️ Gestion des préférences utilisateur

Les utilisateurs peuvent activer/désactiver les notifications push dans leur profil :

1. Aller dans **Mon Compte**
2. Section **🔔 Préférences de Notifications**
3. Toggle **"Notifications Push"**

Quand désactivé, aucune notification push ne sera envoyée, même si l'abonnement existe.

---

## 🧪 Tests

### **Test manuel**

1. **Activer les notifications** via la bannière
2. **Créer une alerte** dans l'application
3. **Vérifier** que vous recevez une notification push

### **Test avec l'API admin**

```bash
# Envoyer une notification de test (nécessite un token admin)
curl -X POST https://votre-app.vercel.app/api/push/send \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "userId": "USER_ID",
    "title": "Test de notification",
    "body": "Ceci est un test",
    "url": "/dashboard"
  }'
```

---

## 🔍 Débogage

### **Les notifications ne s'affichent pas**

1. **Vérifier les clés VAPID** :
   ```bash
   # Dans la console du navigateur
   console.log(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
   ```

2. **Vérifier les permissions** :
   - Ouvrir les paramètres du navigateur
   - Chercher "Notifications"
   - Vérifier que votre site est autorisé

3. **Vérifier les logs serveur** :
   ```bash
   # Sur Vercel, aller dans Deployments > Functions > Logs
   # Chercher "Failed to send push notification"
   ```

4. **Vérifier l'abonnement** :
   ```sql
   -- Dans Prisma Studio ou votre DB
   SELECT * FROM "PushSubscription" WHERE "userId" = 'YOUR_USER_ID';
   ```

### **Erreur "VAPID keys not configured"**

Les clés VAPID ne sont pas définies. Suivez l'Étape 1 et 2 ci-dessus.

### **Erreur 410 Gone ou 404 Not Found**

L'abonnement est invalide (navigateur désinstallé, cache vidé, etc.). Le système le supprime automatiquement.

---

## 📊 Monitoring

### **Métriques à surveiller**

- **Taux d'activation** : Combien d'utilisateurs activent les notifications push
- **Taux de livraison** : Combien de notifications sont effectivement livrées
- **Abonnements invalides** : Combien d'abonnements sont supprimés (erreur 410/404)

### **Logs importants**

```typescript
// Dans pushNotifications.ts
console.warn('⚠️ VAPID keys not configured. Push notifications disabled.');
console.error('Failed to send push notification to subscription...');

// Dans notificationHelper.ts
console.error('Failed to send push notification:', error);
```

---

## ⚡ Performance

### **Impact sur les performances**

- ✅ **Aucun impact** sur le temps de réponse des API
- ✅ **Fire-and-forget** : L'envoi est asynchrone
- ✅ **Pas de blocage** : Les erreurs d'envoi n'affectent pas le flux principal
- ✅ **Nettoyage automatique** : Les abonnements invalides sont supprimés

### **Optimisations**

- Les notifications push sont envoyées **après** la création en base de données
- Les préférences utilisateur sont vérifiées **avant** l'envoi
- Les abonnements invalides sont supprimés **automatiquement**
- Pas de retry automatique (évite la surcharge)

---

## 🔐 Sécurité

### **Bonnes pratiques**

- ✅ Clé privée VAPID jamais exposée au client
- ✅ API d'envoi protégée par authentification admin
- ✅ Validation des abonnements avant stockage
- ✅ Respect des préférences utilisateur
- ✅ HTTPS obligatoire (requis par les navigateurs)

### **RGPD**

- ✅ Consentement explicite requis (popup navigateur)
- ✅ Possibilité de désactiver à tout moment
- ✅ Suppression automatique des abonnements invalides
- ✅ Pas de tracking ou analytics dans les notifications

---

## 📚 Ressources

- [Web Push API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Workers (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [VAPID Protocol](https://datatracker.ietf.org/doc/html/rfc8292)
- [web-push library](https://github.com/web-push-libs/web-push)

---

## ✨ Prochaines étapes (optionnel)

- [ ] Ajouter des actions dans les notifications (répondre, voir, etc.)
- [ ] Personnaliser les icônes par type de notification
- [ ] Ajouter des statistiques d'engagement
- [ ] Implémenter des notifications planifiées
- [ ] Ajouter le support des notifications riches (images, etc.)

---

**Développé avec ❤️ pour Viillaage**  
*Connecter les villages, une notification à la fois* 🔔
