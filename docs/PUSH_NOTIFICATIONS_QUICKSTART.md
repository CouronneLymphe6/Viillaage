# 🚀 Démarrage Rapide - Notifications Push

## ⚡ Configuration en 3 minutes

### 1️⃣ Générer les clés VAPID

```bash
node scripts/generate-vapid-keys.js
```

### 2️⃣ Copier les clés dans `.env`

Ajoutez les 3 lignes affichées dans votre fichier `.env` :

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKxxx...
VAPID_PRIVATE_KEY=xxx...
VAPID_SUBJECT=mailto:contact@viillaage.fr
```

### 3️⃣ Configurer Vercel

1. Allez sur [vercel.com](https://vercel.com) → Votre projet → **Settings** → **Environment Variables**
2. Ajoutez les 3 variables ci-dessus
3. Redéployez l'application

---

## ✅ C'est tout !

Les notifications push sont maintenant actives. Les utilisateurs verront une bannière pour les activer.

---

## 🧪 Tester

1. Ouvrez l'application
2. Cliquez sur **"Activer"** dans la bannière verte
3. Acceptez la permission du navigateur
4. Créez une alerte ou envoyez un message
5. Vous devriez recevoir une notification push ! 🎉

---

## 📖 Documentation complète

Pour plus de détails, consultez : [`PUSH_NOTIFICATIONS_SETUP.md`](./PUSH_NOTIFICATIONS_SETUP.md)

---

## ⚠️ Important

- **Ne commitez JAMAIS** la clé `VAPID_PRIVATE_KEY` dans git
- Les notifications push nécessitent **HTTPS** (automatique sur Vercel)
- Compatible avec **Chrome, Firefox, Edge, Safari (iOS 16.4+)**
