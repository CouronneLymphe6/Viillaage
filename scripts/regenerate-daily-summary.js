/**
 * Script de maintenance: Régénère le résumé quotidien en supprimant le cache
 * Usage: node scripts/regenerate-daily-summary.js [date]
 * Si aucune date n'est fournie, utilise hier (par défaut pour le résumé quotidien)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Récupérer la date depuis les arguments ou utiliser hier
    const dateArg = process.argv[2];
    let targetDate = new Date();

    if (dateArg) {
        targetDate = new Date(dateArg);
    } else {
        // Par défaut: hier
        targetDate.setDate(targetDate.getDate() - 1);
    }

    // Normaliser à minuit
    targetDate.setHours(0, 0, 0, 0);

    console.log(`🔄 Régénération du résumé pour: ${targetDate.toLocaleDateString('fr-FR')}`);

    try {
        // Supprimer tous les résumés pour cette date
        const deleted = await prisma.dailySummary.deleteMany({
            where: {
                date: targetDate
            }
        });

        console.log(`✅ ${deleted.count} résumé(s) supprimé(s)`);
        console.log(`\n💡 Le prochain appel à l'API /api/ai/daily-summary?date=${targetDate.toISOString().split('T')[0]} régénérera le résumé.`);
        console.log(`\n📍 Ou allez sur le dashboard et il se régénérera automatiquement.`);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
