# Ajouter des pièces jointes au Panneau Officiel

## 🎯 Objectif
Permettre aux administrateurs de joindre **un fichier** (photo ou PDF multi-pages) aux annonces du Panneau Officiel pour partager les avis officiels de la mairie.

## 📋 Plan d'implémentation

### Phase 1 : Modification de la base de données
**Fichier** : `prisma/schema.prisma`

**Actions** :
1. Modifier le modèle `Alert` pour ajouter :
   - `attachmentUrl` (String?, optionnel) - URL du fichier joint
   - `attachmentType` (String?, optionnel) - Type de fichier : "IMAGE" ou "PDF"
   - Renommer/réutiliser `photoUrl` existant OU le remplacer par `attachmentUrl`

**Migration** :
```bash
npx prisma migrate dev --name add_attachment_to_alerts
npx prisma generate
```

---

### Phase 2 : Étendre l'API d'upload
**Fichier** : `src/app/api/upload/route.ts`

**Actions** :
1. Ajouter le support des PDF dans `ALLOWED_IMAGE_TYPES` :
   ```typescript
   const ALLOWED_FILE_TYPES = {
       'image/jpeg': [0xFF, 0xD8, 0xFF],
       'image/png': [0x89, 0x50, 0x4E, 0x47],
       'image/webp': [0x52, 0x49, 0x46, 0x46],
       'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
   };
   ```

2. Augmenter la limite de taille pour les PDF :
   ```typescript
   const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB pour les PDF
   ```

3. Vérifier que Cloudinary supporte les PDF (resource_type: 'auto' ou 'raw')

4. Retourner le type de fichier dans la réponse :
   ```typescript
   return NextResponse.json({ 
       url: publicUrl,
       type: file.type.startsWith('image/') ? 'IMAGE' : 'PDF'
   });
   ```

---

### Phase 3 : Créer un composant FileUpload universel
**Fichier** : `src/components/FileUpload.tsx` (nouveau)

**Actions** :
1. Créer un composant similaire à `ImageUpload.tsx` mais qui accepte images ET PDF
2. Props :
   ```typescript
   interface FileUploadProps {
       onUpload: (url: string, type: 'IMAGE' | 'PDF') => void;
       currentFile?: { url: string; type: 'IMAGE' | 'PDF' } | null;
   }
   ```

3. Affichage conditionnel :
   - Si IMAGE : afficher l'aperçu de l'image
   - Si PDF : afficher une icône PDF avec le nom du fichier

4. Input acceptant : `accept="image/*,application/pdf"`

---

### Phase 4 : Modifier la page Panneau Officiel
**Fichier** : `src/app/(app)/official/page.tsx`

**Actions** :
1. Ajouter les champs `attachmentUrl` et `attachmentType` au `formData` :
   ```typescript
   const [formData, setFormData] = useState({
       type: 'OFFICIAL_INFO',
       description: '',
       attachmentUrl: '',
       attachmentType: null as 'IMAGE' | 'PDF' | null,
   });
   ```

2. Intégrer le composant `FileUpload` dans le formulaire modal (après le textarea)

3. Envoyer les données d'attachment dans les requêtes POST/PATCH

4. Afficher la pièce jointe sur chaque carte d'annonce :
   - Si IMAGE : afficher l'image cliquable (ouvre en grand)
   - Si PDF : afficher un bouton "📄 Voir le document" qui ouvre le PDF dans un nouvel onglet

---

### Phase 5 : Mettre à jour le type TypeScript
**Fichier** : `src/types/index.ts`

**Actions** :
1. Ajouter les champs au type `Alert` :
   ```typescript
   export interface Alert {
       // ... champs existants
       attachmentUrl?: string | null;
       attachmentType?: 'IMAGE' | 'PDF' | null;
   }
   ```

---

### Phase 6 : Modifier l'API Alerts
**Fichiers** : 
- `src/app/api/alerts/route.ts` (POST)
- `src/app/api/alerts/[id]/route.ts` (PATCH)

**Actions** :
1. Accepter les nouveaux champs `attachmentUrl` et `attachmentType` dans le body
2. Les inclure dans les opérations Prisma `create` et `update`
3. Valider que `attachmentType` est bien 'IMAGE' ou 'PDF' si `attachmentUrl` est fourni

---

## 🔄 Ordre d'exécution recommandé

1. ✅ **Phase 1** : Modifier le schéma Prisma et migrer la DB
2. ✅ **Phase 5** : Mettre à jour les types TypeScript
3. ✅ **Phase 2** : Étendre l'API d'upload pour les PDF
4. ✅ **Phase 3** : Créer le composant FileUpload
5. ✅ **Phase 6** : Modifier les API Alerts
6. ✅ **Phase 4** : Intégrer dans la page Panneau Officiel

---

## ⚠️ Points d'attention

- **Cloudinary** : Vérifier que le plan gratuit supporte les PDF (normalement oui)
- **Sécurité** : Valider les magic numbers des PDF pour éviter l'upload de fichiers malveillants
- **Taille** : 10MB max pour les PDF (ajustable selon les besoins)
- **Compatibilité** : Les anciens posts avec `photoUrl` devront être migrés ou gérés en rétrocompatibilité
- **Mobile** : Tester l'affichage des PDF sur mobile (certains navigateurs ouvrent directement, d'autres téléchargent)

---

## 🧪 Tests à effectuer

1. Upload d'une image (JPEG, PNG, WebP) ✓
2. Upload d'un PDF multi-pages ✓
3. Modification d'une annonce avec changement de fichier ✓
4. Suppression d'une pièce jointe ✓
5. Affichage correct sur desktop et mobile ✓
6. Ouverture du PDF dans un nouvel onglet ✓
7. Gestion des erreurs (fichier trop lourd, mauvais format) ✓
