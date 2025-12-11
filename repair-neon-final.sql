/*
  SCRIPT DE RÉPARATION FINAL (CRITIQUE)
  
  Ce script corrige les tables manquantes qui font planter le Dashboard
  et corrige le problème de notifications.
*/

-- 1. Correction Notification (read -> isRead)
DO $$ BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Notification' AND column_name='read') THEN
    ALTER TABLE "Notification" RENAME COLUMN "read" TO "isRead";
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Notification' AND column_name='isRead') THEN
    ALTER TABLE "Notification" ADD COLUMN "isRead" BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- 2. Tables de sécurité (Business/Association)
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
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

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
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Association_pkey" PRIMARY KEY ("id")
);

-- 3. Tables PRO (Correctif du Dashboard)
CREATE TABLE IF NOT EXISTS "ProPost" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "mediaType" TEXT,       
  "mediaUrl" TEXT,
  "postType" TEXT DEFAULT 'POST', 
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProPost_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProPost_businessId_fkey') THEN
        ALTER TABLE "ProPost" ADD CONSTRAINT "ProPost_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "ProPostLike" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProPostLike_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ProPostLike_postId_userId_key" ON "ProPostLike"("postId", "userId");
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProPostLike_postId_fkey') THEN
        ALTER TABLE "ProPostLike" ADD CONSTRAINT "ProPostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ProPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProPostLike_userId_fkey') THEN
        ALTER TABLE "ProPostLike" ADD CONSTRAINT "ProPostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "ProComment" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProComment_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProComment_postId_fkey') THEN
        ALTER TABLE "ProComment" ADD CONSTRAINT "ProComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ProPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProComment_userId_fkey') THEN
        ALTER TABLE "ProComment" ADD CONSTRAINT "ProComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "ProAgenda" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProAgenda_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProAgenda_businessId_fkey') THEN
        ALTER TABLE "ProAgenda" ADD CONSTRAINT "ProAgenda_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "ProFollower" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProFollower_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ProFollower_businessId_userId_key" ON "ProFollower"("businessId", "userId");
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProFollower_businessId_fkey') THEN
        ALTER TABLE "ProFollower" ADD CONSTRAINT "ProFollower_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProFollower_userId_fkey') THEN
        ALTER TABLE "ProFollower" ADD CONSTRAINT "ProFollower_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "ProProject" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "photo" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "startDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProProject_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProProject_businessId_fkey') THEN
        ALTER TABLE "ProProject" ADD CONSTRAINT "ProProject_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 4. Ajouter updatedAt (Requis par Prisma)
ALTER TABLE "Alert" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
