import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generatePressReview } from '@/lib/gemini';
import { fetchLocalNews } from '@/lib/news';

/**
 * API Route: Génère la revue de presse locale
 * GET /api/ai/press-review?date=2025-12-08
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const userVillageId = (session.user as any).villageId;

        if (!userVillageId) {
            return NextResponse.json({ error: 'Village non défini' }, { status: 400 });
        }

        // Récupérer la date depuis les paramètres (par défaut: hier)
        const searchParams = request.nextUrl.searchParams;
        const dateParam = searchParams.get('date');

        const targetDate = dateParam ? new Date(dateParam) : new Date();
        if (!dateParam) {
            // Par défaut, on prend hier
            targetDate.setDate(targetDate.getDate() - 1);
        }

        // Normaliser la date (début de journée)
        targetDate.setHours(0, 0, 0, 0);

        // Vérifier si une revue de presse existe déjà pour cette date
        const existingReview = await prisma.pressReview.findUnique({
            where: {
                villageId_date: {
                    villageId: userVillageId,
                    date: targetDate,
                },
            },
        });

        if (existingReview) {
            return NextResponse.json({
                summary: existingReview.summary,
                articles: JSON.parse(existingReview.articles),
                date: existingReview.date,
                cached: true,
            });
        }

        // Récupérer les actualités locales
        console.log('🔍 Recherche d\'actualités locales...');
        const articles = await fetchLocalNews(targetDate);

        console.log(`✅ ${articles.length} articles trouvés`);

        // Préparer les articles pour l'IA
        const articlesForAI = articles.map(a => ({
            title: a.title,
            source: a.source,
            publishedAt: new Date(a.publishedAt).toLocaleDateString('fr-FR'),
            snippet: a.snippet,
            url: a.url,
        }));

        // Générer la revue de presse avec Gemini
        const aiResponse = await generatePressReview(
            articlesForAI,
            targetDate.toLocaleDateString('fr-FR')
        );

        if (!aiResponse.success) {
            // Mode fallback : générer une revue simple sans IA
            if (aiResponse.error?.includes('Clé API Gemini non configurée')) {
                const fallbackSummary = articles.length > 0
                    ? `📰 ${articles.length} article(s) trouvé(s) pour ${targetDate.toLocaleDateString('fr-FR')}

${articles.slice(0, 3).map(a => `• ${a.title} (${a.source})`).join('\n')}

⚙️ Pour des résumés IA personnalisés, configurez votre clé API Gemini.`
                    : `Aucune actualité locale trouvée pour ${targetDate.toLocaleDateString('fr-FR')}.

⚙️ Pour des résumés IA personnalisés, configurez votre clé API Gemini.`;

                // Sauvegarder la revue fallback en base
                const savedReview = await prisma.pressReview.upsert({
                    where: {
                        villageId_date: {
                            villageId: userVillageId,
                            date: targetDate,
                        },
                    },
                    update: {
                        summary: fallbackSummary,
                        articles: JSON.stringify(articlesForAI),
                    },
                    create: {
                        villageId: userVillageId,
                        date: targetDate,
                        summary: fallbackSummary,
                        articles: JSON.stringify(articlesForAI),
                    },
                });

                return NextResponse.json({
                    summary: savedReview.summary,
                    articles: articlesForAI,
                    date: savedReview.date,
                    cached: false,
                });
            }

            return NextResponse.json(
                { error: 'Erreur lors de la génération de la revue de presse', details: aiResponse.error },
                { status: 500 }
            );
        }

        // Sauvegarder la revue de presse en base
        const savedReview = await prisma.pressReview.upsert({
            where: {
                villageId_date: {
                    villageId: userVillageId,
                    date: targetDate,
                },
            },
            update: {
                summary: aiResponse.text,
                articles: JSON.stringify(articlesForAI),
            },
            create: {
                villageId: userVillageId,
                date: targetDate,
                summary: aiResponse.text,
                articles: JSON.stringify(articlesForAI),
            },
        });

        return NextResponse.json({
            summary: savedReview.summary,
            articles: articlesForAI,
            date: savedReview.date,
            cached: false,
        });
    } catch (error) {
        console.error('❌ Erreur dans /api/ai/press-review:', error);
        return NextResponse.json(
            { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' },
            { status: 500 }
        );
    }
}
