-- Script d'initialisation de la base de données Neon
-- Copiez-collez ce contenu dans l'éditeur SQL de Neon et cliquez sur "Run"

-- 1. Créer le village Beaupuy
INSERT INTO "Village" (id, name, "postalCode", region, department, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Beaupuy',
  '31850',
  'Occitanie',
  'Haute-Garonne',
  NOW(),
  NOW()
);

-- 2. Créer l'utilisateur admin
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
SELECT * FROM "Village";
SELECT id, email, name, role FROM "User";
