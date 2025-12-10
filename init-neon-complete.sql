-- SCRIPT COMPLET D'INITIALISATION NEON
-- Copiez-collez TOUT ce contenu dans l'éditeur SQL de Neon et cliquez sur "Run"

-- 1. Créer toutes les tables (version corrigée)
-- Remplacer zipCode par postalCode dans Village
CREATE TABLE IF NOT EXISTS "Village" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "region" TEXT,
    "department" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Village_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Village_postalCode_key" ON "Village"("postalCode");

-- 2. Créer la table User
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "villageId" TEXT,
    "acceptedCGU" BOOLEAN NOT NULL DEFAULT false,
    "acceptedPrivacy" BOOLEAN NOT NULL DEFAULT false,
    "cguAcceptedAt" TIMESTAMP(3),
    "privacyAcceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

ALTER TABLE "User" ADD CONSTRAINT "User_villageId_fkey" 
FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. Insérer le village Beaupuy
INSERT INTO "Village" (id, name, "postalCode", region, department, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Beaupuy',
  '31850',
  'Occitanie',
  'Haute-Garonne',
  NOW(),
  NOW()
)
ON CONFLICT ("postalCode") DO NOTHING;

-- 4. Créer l'utilisateur admin
-- Mot de passe: !Laguerreprendfinle8mai1945/:
INSERT INTO "User" (id, email, name, password, role, "villageId", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'alessi.bruno@hotmail.fr',
  'Bruno Alessi',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye1IQ0QBaM3CYQiXkEn1JHUWn9gDxzm6i',
  'ADMIN',
  (SELECT id FROM "Village" WHERE "postalCode" = '31850'),
  NOW(),
  NOW()
);

-- Vérification
SELECT 'Village créé:' as info, * FROM "Village";
SELECT 'Admin créé:' as info, id, email, name, role FROM "User";
