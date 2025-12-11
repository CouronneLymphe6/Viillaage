-- Script pour créer toutes les tables manquantes dans Neon
-- Tables existantes: Village, User, PasswordResetToken

-- 1. Profile
CREATE TABLE IF NOT EXISTS "Profile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "bio" TEXT,
  "address" TEXT,
  "phone" TEXT,
  "villageName" TEXT,
  "zipCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Profile_userId_key" ON "Profile"("userId");
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Channel & Messages (Chat)
CREATE TABLE IF NOT EXISTS "Channel" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Message" (
  "id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "channelId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "replyToId" TEXT,
  CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Message" ADD CONSTRAINT "Message_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "Reaction" (
  "id" TEXT NOT NULL,
  "emoji" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Reaction_messageId_userId_emoji_key" ON "Reaction"("messageId", "userId", "emoji");
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. Alerts
CREATE TABLE IF NOT EXISTS "Alert" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "photoUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "AlertVote" (
  "id" TEXT NOT NULL,
  "alertId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AlertVote_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AlertVote_alertId_userId_key" ON "AlertVote"("alertId", "userId");
ALTER TABLE "AlertVote" ADD CONSTRAINT "AlertVote_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AlertVote" ADD CONSTRAINT "AlertVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Events
CREATE TABLE IF NOT EXISTS "Event" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "location" TEXT,
  "photoUrl" TEXT,
  "organizerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "EventRSVP" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EventRSVP_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "EventRSVP_eventId_userId_key" ON "EventRSVP"("eventId", "userId");
ALTER TABLE "EventRSVP" ADD CONSTRAINT "EventRSVP_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventRSVP" ADD CONSTRAINT "EventRSVP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Listings (Petites annonces)
CREATE TABLE IF NOT EXISTS "Listing" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" DOUBLE PRECISION,
  "category" TEXT NOT NULL,
  "image" TEXT,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 6. Business (Commerces)
CREATE TABLE IF NOT EXISTS "Business" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "address" TEXT,
  "phone" TEXT,
  "website" TEXT,
  "image" TEXT,
  "ownerId" TEXT NOT NULL,
  "villageId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Business" ADD CONSTRAINT "Business_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Business" ADD CONSTRAINT "Business_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 7. Association
CREATE TABLE IF NOT EXISTS "Association" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "address" TEXT,
  "phone" TEXT,
  "website" TEXT,
  "image" TEXT,
  "ownerId" TEXT NOT NULL,
  "villageId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Association_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Association" ADD CONSTRAINT "Association_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Association" ADD CONSTRAINT "Association_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "AssociationMember" (
  "id" TEXT NOT NULL,
  "associationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'MEMBER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AssociationMember_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AssociationMember_associationId_userId_key" ON "AssociationMember"("associationId", "userId");
ALTER TABLE "AssociationMember" ADD CONSTRAINT "AssociationMember_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssociationMember" ADD CONSTRAINT "AssociationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 8. Notifications & Push
CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "link" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "PushSubscription" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "endpoint" TEXT NOT NULL,
  "p256dh" TEXT NOT NULL,
  "auth" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 9. Insérer les canaux par défaut
INSERT INTO "Channel" (id, name, description, "createdAt") VALUES
('global', 'Général', 'Discussion générale du village', NOW()),
('entraide', 'Entraide', 'Demandes et propositions d''aide', NOW()),
('loisirs', 'Loisirs', 'Sorties, sport et activités', NOW())
ON CONFLICT (id) DO NOTHING;
