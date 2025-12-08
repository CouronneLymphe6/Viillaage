# Guide de Sécurité - Village App

## 🔒 Mesures de Sécurité Implémentées

### 1. Authentification et Autorisation

#### Protection contre la Force Brute
- **Lockout automatique**: 5 tentatives échouées = verrouillage 15 minutes
- **Rate limiting**: 5 tentatives de connexion par 15 minutes par IP
- **Audit logging**: Toutes les tentatives de connexion sont enregistrées

#### Gestion des Sessions
- **Durée**: 24 heures maximum
- **JWT sécurisés**: Tokens signés avec NEXTAUTH_SECRET
- **Refresh automatique**: Les données utilisateur sont rafraîchies à chaque requête

### 2. Protection des Entrées

#### Validation avec Zod
Tous les endpoints API valident les entrées avec des schémas Zod stricts:
- **Emails**: Format valide + vérification avec validator.js
- **Mots de passe**: Min 12 caractères, majuscule, minuscule, chiffre, caractère spécial
- **Coordonnées GPS**: Plage valide (-90/90, -180/180)
- **Descriptions**: Max 500 caractères, détection de spam

#### Sanitization XSS
- **DOMPurify**: Nettoyage de tout contenu HTML utilisateur
- **Détection de patterns**: Blocage des scripts, iframes, événements JS
- **Encodage**: Échappement automatique des caractères spéciaux

### 3. Rate Limiting

Limites par endpoint:
- **Login**: 5 tentatives / 15 min
- **Register**: 3 inscriptions / heure
- **Upload**: 10 fichiers / heure
- **Alerts**: 20 alertes / heure
- **Messages**: 60 messages / minute
- **API générale**: 100 requêtes / minute

### 4. Upload de Fichiers Sécurisé

#### Vérifications Multi-Niveaux
1. **Taille**: Max 2MB
2. **MIME type**: Whitelist (JPEG, PNG, WebP uniquement)
3. **Magic numbers**: Vérification de la signature réelle du fichier
4. **Nom de fichier**: Génération aléatoire sécurisée

#### Exemple de Magic Numbers
```typescript
JPEG: [0xFF, 0xD8, 0xFF]
PNG:  [0x89, 0x50, 0x4E, 0x47]
WebP: [0x52, 0x49, 0x46, 0x46]
```

### 5. Headers de Sécurité

Tous configurés dans `next.config.ts`:
- **X-Frame-Options**: DENY (anti-clickjacking)
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: 1; mode=block
- **Strict-Transport-Security**: HSTS activé
- **Content-Security-Policy**: Politique stricte
- **Permissions-Policy**: Restrictions caméra, micro, paiement

### 6. Protection CSRF

- **Double Submit Cookie**: Token CSRF dans cookie + header
- **Vérification d'origine**: Validation du header Origin/Referer
- **SameSite cookies**: Protection contre CSRF cross-site

### 7. Audit Logging

Événements enregistrés:
- ✅ Connexions (succès/échec)
- ✅ Inscriptions
- ✅ Création de contenu (alertes, messages, événements)
- ✅ Uploads de fichiers
- ✅ Violations de sécurité (rate limit, XSS, CSRF)
- ✅ Accès non autorisés

Format: JSON structuré avec timestamp, userId, IP, action, résultat

## 🛡️ Bonnes Pratiques

### Pour les Développeurs

1. **Toujours valider les entrées**
   ```typescript
   const validation = schema.safeParse(data);
   if (!validation.success) {
     return error(validation.error.issues[0].message);
   }
   ```

2. **Sanitizer le contenu utilisateur**
   ```typescript
   import { sanitizeText } from '@/lib/security/xss-protection';
   const clean = sanitizeText(userInput);
   ```

3. **Appliquer le rate limiting**
   ```typescript
   const rateLimitResponse = await checkRateLimit(
     request,
     RATE_LIMITS.YOUR_ENDPOINT,
     userId
   );
   if (rateLimitResponse) return rateLimitResponse;
   ```

4. **Logger les événements importants**
   ```typescript
   await logContentCreation(
     AuditEventType.ALERT_CREATED,
     userId,
     contentId,
     ipAddress
   );
   ```

### Pour les Administrateurs

1. **Rotation des secrets**
   - Changer NEXTAUTH_SECRET tous les 90 jours
   - Commande: `openssl rand -base64 32`

2. **Monitoring**
   - Surveiller les logs d'audit quotidiennement
   - Alertes sur pics de tentatives échouées
   - Vérifier les dépassements de rate limit

3. **Mises à jour**
   - `npm audit` régulièrement
   - Mettre à jour les dépendances de sécurité
   - Suivre les CVE des packages utilisés

## 🚨 Que Faire en Cas d'Incident

### Compte Compromis
1. Réinitialiser le mot de passe utilisateur
2. Révoquer toutes les sessions
3. Vérifier les logs d'audit pour activité suspecte
4. Notifier l'utilisateur

### Tentative d'Intrusion Détectée
1. Bloquer l'IP source (firewall)
2. Analyser les logs pour comprendre l'attaque
3. Vérifier l'intégrité des données
4. Renforcer les règles de rate limiting si nécessaire

### Fuite de Données Suspectée
1. **IMMÉDIAT**: Isoler le système
2. Analyser les logs d'accès
3. Identifier les données exposées
4. Notifier les utilisateurs concernés (RGPD)
5. Changer tous les secrets

## 📊 Métriques de Sécurité à Surveiller

- Nombre de tentatives de connexion échouées / jour
- Taux de dépassement de rate limit
- Nombre de fichiers rejetés à l'upload
- Tentatives d'injection XSS détectées
- Accès non autorisés aux endpoints admin

## 🔄 Améliorations Futures Recommandées

### Phase 2 (Recommandé)
- [ ] Authentification à deux facteurs (2FA)
- [ ] Chiffrement des données sensibles au repos
- [ ] Migration vers Redis pour rate limiting distribué
- [ ] Scan antivirus des uploads (ClamAV)
- [ ] Détection d'anomalies avec ML

### Phase 3 (Optionnel)
- [ ] WAF (Web Application Firewall)
- [ ] DDoS protection (Cloudflare)
- [ ] Pen testing régulier
- [ ] Bug bounty program
- [ ] SOC 2 compliance

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Zod Documentation](https://zod.dev/)
- [DOMPurify](https://github.com/cure53/DOMPurify)
