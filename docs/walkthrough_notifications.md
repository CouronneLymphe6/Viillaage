# Walkthrough : Système de Notifications Intelligent

## 🎯 Objectif accompli

Mise en place d'un système de notifications complet et temps réel pour informer les utilisateurs de l'activité dans leur village.

---

## 🏗️ Infrastructure

### 1. Base de données (Prisma)
Nouveau modèle `Notification` ajouté :
```prisma
model Notification {
  id          String   @id @default(cuid())
  type        String   // ALERT, BUSINESS, MARKET, MESSAGE
  title       String
  message     String
  link        String?
  isRead      Boolean  @default(false)
  userId      String
  user        User     @relation(...)
  createdAt   DateTime @default(now())
}
```

### 2. API (`/api/notifications`)
- **GET** : Récupère les 50 dernières notifications de l'utilisateur.
- **PATCH** : Marque une notification (ou toutes) comme lue(s).
- **DELETE** : Supprime une notification.

### 3. Composant UI (`NotificationBell`)
- Intégré dans la Sidebar (en haut à droite sur mobile/desktop).
- Badge rouge avec compteur de notifications non lues.
- Menu déroulant avec liste des notifications.
- Actions : Clic pour marquer comme lu et naviguer, "Tout marquer comme lu".
- **Auto-refresh** : Polling toutes les 30 secondes pour les nouvelles notifications.

---

## 🔔 Types de Notifications Implémentés

### 1. 🚨 Alertes et Sécurité
**Déclencheur** : Lorsqu'un utilisateur poste une nouvelle alerte (Vol, Accident, etc.).
**Destinataires** : Tous les habitants du même village (sauf l'auteur).
**Contenu** : "🚨 Vol signalé", "🔥 Incendie signalé", etc.
**Lien** : Redirige vers `/alerts`.

### 2. 🏪 Les Pros (Nouveaux Commerces)
**Déclencheur** : Lorsqu'un professionnel crée une fiche commerce.
**Destinataires** : Tous les habitants du village.
**Contenu** : "🏪 Nouveau commerce : [Nom du commerce]".
**Lien** : Redirige vers `/village` (Annuaire des pros).

### 3. 🛒 Le Marché (Petites Annonces)
**Déclencheur** : Lorsqu'une nouvelle annonce est publiée.
**Destinataires** : Tous les habitants du village.
**Contenu** : "💰 Vente : [Titre]", "🎁 Don : [Titre]", etc.
**Lien** : Redirige vers `/market`.
*Note : Pour l'instant, notifie tout le monde. Un système de filtres par mots-clés pourra être ajouté ultérieurement.*

### 4. 💬 Messagerie
**Déclencheur 1 (Réponse)** : Lorsqu'un utilisateur répond à un message.
**Destinataire** : L'auteur du message original.
**Contenu** : "💬 Réponse de [Nom]".

**Déclencheur 2 (Nouveau Message)** : Lorsqu'un nouveau message est posté dans un canal.
**Destinataires** : Tous les habitants du village (sauf l'auteur).
**Contenu** : "💬 Nouveau message dans [Nom du canal]".
**Lien** : Redirige vers le canal concerné.

---

## 🛠️ Utilitaire (`src/lib/notificationHelper.ts`)

Création de fonctions helper pour simplifier l'envoi de notifications :
- `createNotification` : Pour un utilisateur unique.
- `notifyVillageUsers` : Pour notifier tout un village (avec exclusion de l'expéditeur).

---

## ✅ Validation

Le système est opérationnel et intégré dans les flux existants :
- Création d'alerte -> Notification envoyée.
- Création de commerce -> Notification envoyée.
- Création d'annonce -> Notification envoyée.
- Envoi de message -> Notification envoyée.

L'interface utilisateur est réactive et permet une gestion fluide des notifications.
