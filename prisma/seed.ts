import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create default channels
    const channels = [
        { name: 'général', description: 'Discussion générale du village' },
        { name: 'sécurité', description: 'Alertes et sécurité' },
        { name: 'événements', description: 'Organisation d\'événements' },
        { name: 'entraide', description: 'Demandes d\'aide entre voisins' },
    ];

    for (const channel of channels) {
        const existing = await prisma.channel.findFirst({
            where: { name: channel.name },
        });

        if (!existing) {
            await prisma.channel.create({
                data: channel,
            });
        }
    }

    // Create Beaupuy village
    const beaupuy = await prisma.village.upsert({
        where: { zipCode: '31850' },
        update: {},
        create: {
            name: 'Beaupuy',
            zipCode: '31850',
            region: 'Occitanie',
            isActive: true,
        },
    });

    console.log('✅ Village créé:', beaupuy.name, beaupuy.zipCode);

    // Assign all existing users to Beaupuy
    const updatedUsers = await prisma.user.updateMany({
        where: {
            villageId: null,
        },
        data: {
            villageId: beaupuy.id,
        },
    });

    console.log(`✅ ${updatedUsers.count} utilisateur(s) assigné(s) à Beaupuy`);
    console.log('✅ Seed completed: Default channels created and village set up');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
