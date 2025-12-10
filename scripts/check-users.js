const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            }
        });

        console.log('\n=== UTILISATEURS DANS LA BASE DE DONNÉES ===\n');

        if (users.length === 0) {
            console.log('❌ Aucun utilisateur trouvé dans la base de données !');
            console.log('\nVous devez créer un compte en cliquant sur "S\'inscrire"');
        } else {
            console.log(`✅ ${users.length} utilisateur(s) trouvé(s) :\n`);
            users.forEach((user, index) => {
                console.log(`${index + 1}. Email: ${user.email}`);
                console.log(`   Nom: ${user.name || 'Non défini'}`);
                console.log(`   Rôle: ${user.role}`);
                console.log(`   Créé le: ${user.createdAt.toLocaleString('fr-FR')}`);
                console.log('');
            });
        }
    } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
