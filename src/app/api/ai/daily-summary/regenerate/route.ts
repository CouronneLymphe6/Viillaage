import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * API Route: Force la régénération du résumé quotidien
 * DELETE /api/ai/daily-summary/regenerate?date=2025-12-11
 */
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const userVillageId = (session.user as any).villageId;

        if (!userVillageId) {
            return NextResponse.json({ error: 'Village non défini' }, { status: 400 });
        }

        // Récupérer la date depuis les paramètres
        const searchParams = request.nextUrl.searchParams;
        const dateParam = searchParams.get('date');

        let targetDate = new Date();
        if (dateParam) {
            const parsed = new Date(dateParam);
            if (!isNaN(parsed.getTime())) {
                targetDate = parsed;
            }
        } else {
            // Par défaut: hier
            targetDate.setDate(targetDate.getDate() - 1);
        }

        // Normaliser à minuit
        targetDate.setHours(0, 0, 0, 0);

        // Supprimer le résumé en cache
        const deleted = await prisma.dailySummary.deleteMany({
            where: {
                villageId: userVillageId,
                date: targetDate
            }
        });

        return NextResponse.json({
            success: true,
            message: `Cache supprimé pour le ${targetDate.toLocaleDateString('fr-FR')}`,
            deleted: deleted.count,
            date: targetDate,
            nextStep: 'Rechargez la page pour régénérer le résumé'
        });

    } catch (error) {
        console.error('❌ ERROR /api/ai/daily-summary/regenerate:', error);
        return NextResponse.json(
            { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' },
            { status: 500 }
        );
    }
}
