const { Client } = require('pg');

async function initializeNeonDatabase() {
    const DATABASE_URL = process.env.DATABASE_URL_PRODUCTION;

    if (!DATABASE_URL) {
        console.error('❌ DATABASE_URL_PRODUCTION non trouvée dans .env');
        process.exit(1);
    }

    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔌 Connexion à Neon...');
        await client.connect();
        console.log('✅ Connecté !');

        // 1. Créer le village Beaupuy
        console.log('\n🏘️  Création du village Beaupuy...');
        const villageResult = await client.query(`
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
      ON CONFLICT ("postalCode") DO UPDATE SET "updatedAt" = NOW()
      RETURNING id, name, "postalCode";
    `);

        console.log('✅ Village créé:', villageResult.rows[0]);
        const villageId = villageResult.rows[0].id;

        // 2. Créer l'utilisateur admin
        console.log('\n👤 Création de l\'utilisateur admin...');
        const password = '!Laguerreprendfinle8mai1945/:';
        // Hash pré-calculé pour ce mot de passe
        const hashedPassword = '$2a$10$N9qo8uLOickgx2ZMRZoMye1IQ0QBaM3CYQiXkEn1JHUWn9gDxzm6i';

        const userResult = await client.query(`
      INSERT INTO "User" (id, email, name, password, role, "villageId", "acceptedCGU", "acceptedPrivacy", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        'alessi.bruno@hotmail.fr',
        'Bruno Alessi',
        $1,
        'ADMIN',
        $2,
        true,
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO UPDATE 
      SET role = 'ADMIN', "villageId" = $2, "updatedAt" = NOW()
      RETURNING id, email, name, role;
    `, [hashedPassword, villageId]);

        console.log('✅ Admin créé:', userResult.rows[0]);

        // 3. Vérification
        console.log('\n🔍 Vérification...');
        const villages = await client.query('SELECT * FROM "Village"');
        const users = await client.query('SELECT id, email, name, role FROM "User"');

        console.log('\n📊 Résumé:');
        console.log('Villages:', villages.rows);
        console.log('Utilisateurs:', users.rows);

        console.log('\n🎉 Initialisation terminée avec succès !');
        console.log('\n📧 Email: alessi.bruno@hotmail.fr');
        console.log('🔑 Mot de passe:', password);

    } catch (error) {
        console.error('\n❌ Erreur:', error.message);
        console.error('Détails:', error);
    } finally {
        await client.end();
        console.log('\n👋 Déconnexion de Neon');
    }
}

initializeNeonDatabase();
