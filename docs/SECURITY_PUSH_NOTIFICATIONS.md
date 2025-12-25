# 🔐 AVERTISSEMENT DE SÉCURITÉ - NOTIFICATIONS PUSH

## ⚠️ ATTENTION CRITIQUE

Ce fichier contient des informations **ESSENTIELLES** pour la sécurité de votre application.

---

## 🚨 CLÉS VAPID - NE JAMAIS COMMITER

Les clés VAPID sont des **secrets cryptographiques** qui permettent d'envoyer des notifications push. 

### **RÈGLES ABSOLUES**

1. ❌ **NE JAMAIS** commiter `VAPID_PRIVATE_KEY` dans Git
2. ❌ **NE JAMAIS** partager `VAPID_PRIVATE_KEY` publiquement
3. ❌ **NE JAMAIS** afficher `VAPID_PRIVATE_KEY` dans les logs
4. ✅ **TOUJOURS** stocker dans `.env` (qui est dans `.gitignore`)
5. ✅ **TOUJOURS** utiliser Vercel Environment Variables en production

---

## 🔑 Génération des Clés

**IMPORTANT** : Générez vos propres clés, n'utilisez JAMAIS des clés d'exemple !

```bash
node scripts/generate-vapid-keys.js
```

Cela générera :
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` : Peut être exposée (utilisée dans le navigateur)
- `VAPID_PRIVATE_KEY` : **DOIT rester secrète** (utilisée côté serveur uniquement)

---

## 📋 Checklist de Sécurité

Avant de commiter ou déployer :

- [ ] Le fichier `.env` est dans `.gitignore`
- [ ] Aucune clé VAPID n'est présente dans le code source
- [ ] Les clés sont uniquement dans `.env` (local) et Vercel (production)
- [ ] Les fichiers de documentation n'ont que des placeholders
- [ ] Vous avez généré vos propres clés (pas d'exemple)

---

## 🔒 Que Faire en Cas de Fuite

Si vous avez accidentellement commité ou exposé votre `VAPID_PRIVATE_KEY` :

1. **Régénérer immédiatement** de nouvelles clés :
   ```bash
   node scripts/generate-vapid-keys.js
   ```

2. **Mettre à jour** `.env` local avec les nouvelles clés

3. **Mettre à jour** Vercel Environment Variables

4. **Redéployer** l'application

5. **Supprimer l'historique Git** si la clé a été commitée :
   ```bash
   # Utiliser git-filter-repo ou BFG Repo-Cleaner
   # OU créer un nouveau repository
   ```

6. **Informer les utilisateurs** de réactiver les notifications push

---

## 📚 Références

- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [VAPID Specification](https://datatracker.ietf.org/doc/html/rfc8292)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

## ✅ Bonnes Pratiques

1. **Rotation des clés** : Changez vos clés VAPID tous les 6-12 mois
2. **Monitoring** : Surveillez les logs pour détecter les tentatives d'abus
3. **Accès limité** : Seuls les admins doivent avoir accès aux clés
4. **Documentation** : Ne documentez jamais les vraies clés
5. **Backup** : Sauvegardez vos clés dans un gestionnaire de mots de passe sécurisé

---

## 🆘 En Cas de Doute

**SI VOUS N'ÊTES PAS SÛR** que vos clés sont sécurisées :

1. Régénérez de nouvelles clés
2. Mettez à jour partout
3. Redéployez

**Mieux vaut être prudent que désolé !**

---

**Date de création** : 25 décembre 2025  
**Dernière mise à jour** : 25 décembre 2025
