const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetPassword() {
    try {
        const email = 'alessi.bruno@hotmail.fr';
        const newPassword = '!Sr71Blackbird/:';

        console.log(`\n🔄 Réinitialisation du mot de passe pour ${email}...\n`);

        // Vérifier que l'utilisateur existe
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.log(`❌ Utilisateur ${email} non trouvé !`);
            return;
        }

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        console.log('✅ Mot de passe réinitialisé avec succès !');
        console.log(`\nVous pouvez maintenant vous connecter avec :`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Mot de passe: ${newPassword}`);
        console.log('');

    } catch (error) {
        console.error('❌ Erreur lors de la réinitialisation:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

resetPassword();
