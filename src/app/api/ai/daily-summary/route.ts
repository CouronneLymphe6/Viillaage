import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateDailySummary } from '@/lib/gemini';
import { getWeatherForBeaupuy } from '@/lib/weather';

/**
 * API Route: Génère le résumé quotidien "Les Potins de Beaupuy"
 * GET /api/ai/daily-summary?date=2025-12-08
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            console.warn("DAILY_SUMMARY: No session found");
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const userVillageId = (session.user as any).villageId;

        if (!userVillageId) {
            console.warn(`DAILY_SUMMARY: No villageId for user ${session.user.email}`);
            return NextResponse.json({ error: 'Village non défini' }, { status: 400 });
        }

        // Récupérer la date depuis les paramètres (par défaut: hier)
        const searchParams = request.nextUrl.searchParams;
        const dateParam = searchParams.get('date');

        let targetDate = new Date();
        if (dateParam) {
            const parsed = new Date(dateParam);
            if (!isNaN(parsed.getTime())) {
                targetDate = parsed;
            }
        } else {
            // Par défaut, on prend hier
            targetDate.setDate(targetDate.getDate() - 1);
        }

        // Normaliser la date (début de journée)
        targetDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Vérifier si un résumé existe déjà pour cette date
        try {
            const existingSummary = await prisma.dailySummary.findUnique({
                where: {
                    villageId_date: {
                        villageId: userVillageId,
                        date: targetDate,
                    },
                },
            });

            if (existingSummary) {
                return NextResponse.json({
                    summary: existingSummary.summary,
                    stats: JSON.parse(existingSummary.stats),
                    date: existingSummary.date,
                    cached: true,
                });
            }
        } catch (dbError) {
            console.error("DAILY_SUMMARY_DB_READ_ERROR", dbError);
            // Continue to regenerate if read fails? No, might be connection issue.
            // Return fallback empty if DB is dead?
            // Let's propagate if it's a hard error, but maybe log it well
        }

        // Collecter les statistiques de la journée
        // Wrap in try/catch to identify WHICH query fails
        let messages, alerts, events, proPosts, listings;

        try {
            [messages, alerts, events, proPosts, listings] = await Promise.all([
                // Messages
                prisma.message.findMany({
                    where: {
                        user: { villageId: userVillageId },
                        createdAt: { gte: targetDate, lt: nextDay },
                    },
                    include: { channel: true, reactions: true, user: true },
                }),
                // Alertes
                prisma.alert.findMany({
                    where: {
                        user: { villageId: userVillageId },
                        createdAt: { gte: targetDate, lt: nextDay },
                    },
                    include: { user: true },
                }),
                // Événements
                prisma.event.findMany({
                    where: {
                        organizer: { villageId: userVillageId },
                        createdAt: { gte: targetDate, lt: nextDay },
                    },
                    include: { organizer: true },
                }),
                // Posts des pros
                prisma.proPost.findMany({
                    where: {
                        business: { owner: { villageId: userVillageId } },
                        createdAt: { gte: targetDate, lt: nextDay },
                    },
                    include: { business: true },
                }),
                // Annonces marché
                prisma.listing.findMany({
                    where: {
                        user: { villageId: userVillageId },
                        createdAt: { gte: targetDate, lt: nextDay },
                    },
                }),
            ]);
        } catch (queryError) {
            console.error("DAILY_SUMMARY_QUERY_ERROR", queryError);
            return NextResponse.json({ error: "Database error fetching daily stats" }, { status: 500 });
        }


        // Calculer les statistiques
        const activeChannels = new Set(messages.map(m => m.channelId)).size;
        const popularMessages = messages
            .filter(m => m.reactions.length > 0)
            .sort((a, b) => b.reactions.length - a.reactions.length)
            .slice(0, 3)
            .map(m => `"${m.content.substring(0, 50)}..." (${m.reactions.length} réactions)`);

        const securityAlerts = alerts.filter(a => !a.type.startsWith('OFFICIAL_'));
        const officialAnnouncements = alerts.filter(a => a.type.startsWith('OFFICIAL_'));
        const resolvedAlerts = securityAlerts.filter(a => a.status === 'RESOLVED').length;

        const alertTypes = [...new Set(securityAlerts.map(a => a.type))];
        const alertDetails = securityAlerts.slice(0, 3).map(a =>
            `${a.type}: ${a.description.substring(0, 50)}...`
        );

        // Liste détaillée pour l'IA (avec auteurs)
        const alertDetailedList = securityAlerts.map(a => {
            const authorName = (a as any).user ? `${(a as any).user.firstName} ${(a as any).user.lastName}` : 'Un habitant';
            return `- Alerte ${a.type} par ${authorName} : "${a.description}"`;
        }).join('\n');

        const officialTopics = officialAnnouncements.slice(0, 3).map(a =>
            a.description.substring(0, 50) + '...'
        );

        const eventDetails = events.slice(0, 3).map(e =>
            `${e.title} le ${new Date(e.date).toLocaleDateString('fr-FR')}`
        );

        // Liste détaillée des événements pour l'IA
        const eventDetailedList = events.map(e => {
            const organizerName = (e as any).organizer ? `${(e as any).organizer.firstName || (e as any).organizer.name}` : 'Un organisateur';
            return `- ${e.title} (le ${new Date(e.date).toLocaleDateString('fr-FR')}) par ${organizerName} : ${e.description ? e.description.substring(0, 100) : ''}`;
        }).join('\n');

        const activeBusinesses = [...new Set(proPosts.map(p => p.business.name))];

        // Détails des posts pros
        const proPostDetails = proPosts.map(p =>
            `- ${p.business.name} : "${p.content.substring(0, 150)}..."`
        ).join('\n');

        // Extraits de messages pour l'IA (contexte)
        // On prend les 15 derniers messages pour donner du contexte
        const messageSnippets = messages
            .slice(0, 20)
            .map(m => {
                const author = (m as any).user ? (m as any).user.firstName : 'Anonyme';
                return `${author}: ${m.content.substring(0, 100)}`;
            })
            .join('\n');

        let newProducts = 0;
        try {
            newProducts = await prisma.proProduct.count({
                where: {
                    business: { owner: { villageId: userVillageId } },
                    createdAt: { gte: targetDate, lt: nextDay },
                },
            });
        } catch (e) { console.warn("Error counting products", e); }

        const listingCategories = [...new Set(listings.map(l => l.category))];

        let upcomingEvents = 0;
        try {
            upcomingEvents = await prisma.event.count({
                where: {
                    organizer: { villageId: userVillageId },
                    date: { gte: new Date() },
                },
            });
        } catch (e) {
            console.warn("Could not count upcoming events", e);
        }

        const stats = {
            date: targetDate.toLocaleDateString('fr-FR'),
            totalMessages: messages.length,
            activeChannels,
            topTopics: [], // TODO: Analyser les sujets
            popularMessages,
            newAlerts: securityAlerts.length,
            alertTypes,
            resolvedAlerts,
            alertDetails,
            officialAnnouncements: officialAnnouncements.length,
            officialTopics,
            newEvents: events.length,
            upcomingEvents,
            eventDetails,
            proPosts: proPosts.length,
            newProducts,
            activeBusinesses,
            newListings: listings.length,
            listingCategories,
            // Données enrichies pour le prompt
            alertDetailedList,
            proPostDetails,
            messageSnippets,
            eventDetailedList,
        };

        // Générer le résumé avec Gemini
        let aiResponse;
        try {
            aiResponse = await generateDailySummary(stats);
        } catch (aiError) {
            console.error("GEMINI_ERROR", aiError);
            aiResponse = { success: false, error: aiError instanceof Error ? aiError.message : 'Unknown AI Error' };
        }

        if (!aiResponse.success) {
            console.warn("Generating fallback summary due to AI failure:", aiResponse.error);
            // Mode fallback : générer un résumé simple sans IA
            const fallbackSummary = `📊 Résumé du ${stats.date}

Hier à Beaupuy, ${stats.totalMessages > 0 ? `${stats.totalMessages} messages ont été échangés` : 'journée calme sur la messagerie'}. ${stats.newAlerts > 0 ? `${stats.newAlerts} alerte(s) signalée(s)` : 'Aucune alerte'}. ${stats.newEvents > 0 ? `${stats.newEvents} nouvel(aux) événement(s) créé(s)` : ''}${stats.proPosts > 0 ? ` et ${stats.proPosts} publication(s) de nos commerçants` : ''}.`;

            try {
                // Sauvegarder le résumé fallback en base
                const savedSummary = await prisma.dailySummary.upsert({
                    where: {
                        villageId_date: {
                            villageId: userVillageId,
                            date: targetDate,
                        },
                    },
                    update: {
                        summary: fallbackSummary,
                        stats: JSON.stringify(stats),
                    },
                    create: {
                        villageId: userVillageId,
                        date: targetDate,
                        summary: fallbackSummary,
                        stats: JSON.stringify(stats),
                    },
                });

                return NextResponse.json({
                    summary: savedSummary.summary,
                    stats,
                    date: savedSummary.date,
                    cached: false,
                    warning: "AI generation failed, using fallback"
                });
            } catch (dbError) {
                console.error("FAIL_SAVE_FALLBACK", dbError);
                return NextResponse.json({
                    summary: fallbackSummary,
                    stats,
                    date: targetDate,
                    cached: false,
                    error: "Database write failed"
                });
            }
        }

        // Formatter le résumé complet avec titre
        const fullSummary = aiResponse.title
            ? `**${aiResponse.title}**\n\n${aiResponse.content || aiResponse.text || ''}`
            : aiResponse.content || aiResponse.text || '';

        // Sauvegarder le résumé en base
        try {
            const savedSummary = await prisma.dailySummary.upsert({
                where: {
                    villageId_date: {
                        villageId: userVillageId,
                        date: targetDate,
                    },
                },
                update: {
                    summary: fullSummary,
                    stats: JSON.stringify(stats),
                },
                create: {
                    villageId: userVillageId,
                    date: targetDate,
                    summary: fullSummary,
                    stats: JSON.stringify(stats),
                },
            });

            return NextResponse.json({
                summary: savedSummary.summary,
                stats,
                date: savedSummary.date,
                cached: false,
            });
        } catch (saveError) {
            console.error("FAIL_SAVE_SUMMARY", saveError);
            return NextResponse.json({
                summary: fullSummary,
                stats,
                date: targetDate,
                error: "Saved locally only (DB error)"
            });
        }

    } catch (error) {
        console.error('❌ FATAL ERROR /api/ai/daily-summary:', error);
        return NextResponse.json(
            { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' },
            { status: 500 }
        );
    }
}
