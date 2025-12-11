-- Ajout du 4ème canal de messagerie "Annonces"
INSERT INTO "Channel" (id, name, description, "createdAt") VALUES
('annonces', 'Annonces', 'Annonces et informations du village', NOW())
ON CONFLICT (id) DO NOTHING;
