const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearCache() {
    try {
        await prisma.dailySummary.deleteMany({});
        await prisma.pressReview.deleteMany({});
        console.log('✅ Cache vidé !');
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearCache();
