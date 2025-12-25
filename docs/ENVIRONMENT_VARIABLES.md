# 🔐 Variables d'Environnement - Viillaage

## 📋 Variables Requises

### **Base de Données (PostgreSQL)**

```env
# URL de connexion principale (avec pooling)
DATABASE_URL="postgresql://user:password@host:5432/database?pgbouncer=true"

# URL de connexion directe (sans pooling, pour les migrations)
DATABASE_URL_UNPOOLED="postgresql://user:password@host:5432/database"
```

### **Authentification (NextAuth.js)**

```env
# Secret pour signer les tokens JWT (générer avec: openssl rand -base64 32)
NEXTAUTH_SECRET="votre-secret-aleatoire-tres-long"

# URL de base de l'application
NEXTAUTH_URL="https://votre-domaine.vercel.app"
```

### **IA Générative (Google Gemini)**

```env
# Clé API Google Gemini pour les résumés IA
GEMINI_API_KEY="votre-cle-api-gemini"
```

### **Notifications Push (Web Push)**

```env
# Générez vos clés avec : node scripts/generate-vapid-keys.js

# Clé publique VAPID (exposée au client)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="<VOTRE_CLE_PUBLIQUE_VAPID>"

# Clé privée VAPID (SECRÈTE - ne jamais commiter)
VAPID_PRIVATE_KEY="<VOTRE_CLE_PRIVEE_VAPID>"

# Email de contact pour les notifications push
VAPID_SUBJECT="mailto:contact@viillaage.fr"
```

---

## 🚀 Configuration par Environnement

### **Développement Local**

1. Copier `.env.example` vers `.env`
2. Remplir toutes les variables
3. Générer les clés VAPID : `node scripts/generate-vapid-keys.js`

### **Production (Vercel)**

1. Aller sur [vercel.com](https://vercel.com) → Votre projet
2. **Settings** → **Environment Variables**
3. Ajouter toutes les variables ci-dessus
4. Sélectionner les environnements : **Production**, **Preview**, **Development**
5. Redéployer l'application

---

## 🔑 Génération des Clés

### **NEXTAUTH_SECRET**

```bash
openssl rand -base64 32
```

### **Clés VAPID**

```bash
node scripts/generate-vapid-keys.js
```

---

## ⚠️ Sécurité

### **Variables SECRÈTES (ne jamais commiter)**
- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `NEXTAUTH_SECRET`
- `GEMINI_API_KEY`
- `VAPID_PRIVATE_KEY` ⚠️

### **Variables PUBLIQUES (peuvent être exposées)**
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` ✅
- `NEXTAUTH_URL` ✅

---

## 📚 Documentation

- **Notifications Push** : [`docs/PUSH_NOTIFICATIONS_SETUP.md`](./docs/PUSH_NOTIFICATIONS_SETUP.md)
- **Guide Rapide** : [`docs/PUSH_NOTIFICATIONS_QUICKSTART.md`](./docs/PUSH_NOTIFICATIONS_QUICKSTART.md)

---

## ✅ Checklist de Configuration

- [ ] Variables de base de données configurées
- [ ] `NEXTAUTH_SECRET` généré et configuré
- [ ] `GEMINI_API_KEY` configuré
- [ ] Clés VAPID générées
- [ ] Variables VAPID ajoutées sur Vercel
- [ ] Application redéployée
- [ ] Notifications push testées

---

**Dernière mise à jour** : 25 décembre 2025
