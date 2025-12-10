import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Initializing production database...');

    // Create Beaupuy village
    const village = await prisma.village.upsert({
        where: { postalCode: '31850' },
        update: {},
        create: {
            name: 'Beaupuy',
            postalCode: '31850',
            region: 'Occitanie',
            department: 'Haute-Garonne',
        },
    });

    console.log('✅ Village created:', village);

    // Create admin user
    const adminEmail = 'alessi.bruno@hotmail.fr';
    const adminPassword = 'Admin2025!'; // CHANGEZ CE MOT DE PASSE APRÈS LA PREMIÈRE CONNEXION !

    const bcrypt = require('bcryptjs');
    const existingUser = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (existingUser) {
        console.log('⚠️  Admin user already exists, updating role...');
        await prisma.user.update({
            where: { email: adminEmail },
            data: { role: 'ADMIN' },
        });
        console.log('✅ Admin role granted to existing user');
    } else {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const adminUser = await prisma.user.create({
            data: {
                email: adminEmail,
                name: 'Bruno Alessi',
                password: hashedPassword,
                role: 'ADMIN',
                villageId: village.id,
            },
        });

        console.log('✅ Admin user created:', adminUser.email);
    }

    console.log('🎉 Database initialized successfully!');
    console.log('📧 Admin email:', adminEmail);
    console.log('🔑 Admin password:', adminPassword);
    console.log('⚠️  IMPORTANT: Changez ce mot de passe après votre première connexion!');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
