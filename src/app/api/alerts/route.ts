import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyVillageUsers } from "@/lib/notificationHelper";
import { isAdmin } from "@/lib/auth/isAdmin";
import { checkRateLimit, RATE_LIMITS } from "@/lib/security/rate-limiter";
import { createAlertSchema } from "@/lib/security/input-validator";
import { sanitizeText, containsXssPattern } from "@/lib/security/xss-protection";
import { logContentCreation, logSecurityViolation, getIpAddress, AuditEventType } from "@/lib/security/audit-logger";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // If no session or no village, return empty array
        if (!session?.user?.villageId) {
            return NextResponse.json([]);
        }

        const alerts = await prisma.alert.findMany({
            where: {
                status: "ACTIVE",
                user: {
                    villageId: session.user.villageId,
                },
            },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
                votes: {
                    where: {
                        userId: session?.user?.id,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 30, // PWA: Reduced from 50 for faster loading
        });

        // Transform to include userVote status
        const alertsWithUserVote = alerts.map(alert => ({
            ...alert,
            userVote: alert.votes.length > 0 ? alert.votes[0].type : null,
            votes: undefined,
        }));

        return NextResponse.json(alertsWithUserVote, {
            headers: {
                'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
            },
        });
    } catch (error) {
        console.error("GET_ALERTS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const ipAddress = getIpAddress(request.headers);

    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Rate limiting - 20 alerts per hour
        const rateLimitResponse = await checkRateLimit(
            request,
            RATE_LIMITS.CREATE_ALERT,
            session.user.id
        );

        if (rateLimitResponse) {
            await logSecurityViolation(
                AuditEventType.RATE_LIMIT_EXCEEDED,
                session.user.id,
                ipAddress,
                { endpoint: '/api/alerts' }
            );
            return rateLimitResponse;
        }

        const body = await request.json();

        // Validate input with Zod
        const validation = createAlertSchema.safeParse(body);

        if (!validation.success) {
            await logSecurityViolation(
                AuditEventType.INVALID_INPUT,
                session.user.id,
                ipAddress,
                {
                    endpoint: '/api/alerts',
                    errors: validation.error.issues
                }
            );

            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { type, description, latitude, longitude, photoUrl } = validation.data;

        // Security Check: Only Admins/Mayors can post OFFICIAL alerts
        if (type.startsWith('OFFICIAL_')) {
            const admin = await isAdmin();
            if (!admin) {
                await logSecurityViolation(
                    AuditEventType.UNAUTHORIZED_ACCESS,
                    session.user.id,
                    ipAddress,
                    {
                        endpoint: '/api/alerts',
                        attemptedAction: 'create official alert'
                    }
                );
                return new NextResponse("Unauthorized: Official alerts reserved for administrators", { status: 403 });
            }
        }

        // Sanitize description to prevent XSS
        const sanitizedDescription = sanitizeText(description);

        // Check for XSS patterns
        if (containsXssPattern(description)) {
            await logSecurityViolation(
                AuditEventType.XSS_ATTEMPT,
                session.user.id,
                ipAddress,
                {
                    endpoint: '/api/alerts',
                    description: description.substring(0, 100)
                }
            );
            return NextResponse.json(
                { error: "Contenu suspect détecté" },
                { status: 400 }
            );
        }

        const alert = await prisma.alert.create({
            data: {
                type,
                description: sanitizedDescription,
                latitude,
                longitude,
                photoUrl: photoUrl || null,
                userId: session.user.id,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Respond immediately to client
        const response = NextResponse.json(alert);

        // Execute logging and notifications asynchronously (fire-and-forget)
        Promise.all([
            // Log alert creation in background
            logContentCreation(
                AuditEventType.ALERT_CREATED,
                session.user.id,
                alert.id,
                ipAddress
            ).catch(err => console.error('Log error:', err)),

            // Send notifications in background
            (async () => {
                try {
                    const user = await prisma.user.findUnique({
                        where: { id: session.user.id },
                        select: { villageId: true },
                    });

                    if (user?.villageId) {
                        const alertTitles: Record<string, string> = {
                            'THEFT': '🚨 Vol signalé',
                            'ACCIDENT': '🚑 Accident signalé',
                            'FIRE': '🔥 Incendie signalé',
                            'SUSPICIOUS': '👀 Activité suspecte',
                            'ROAD_HAZARD': '⚠️ Danger sur la route',
                            'ANIMAL': '🐾 Animal signalé',
                            'OTHER': '⚠️ Nouvelle alerte',
                            'OFFICIAL_ANNOUNCEMENT': '📢 Annonce officielle',
                            'OFFICIAL_EMERGENCY': '🚨 Urgence officielle',
                            'OFFICIAL_MAINTENANCE': '🔧 Travaux programmés',
                        };

                        const title = alertTitles[type] || '⚠️ Nouvelle alerte';

                        await notifyVillageUsers({
                            villageId: user.villageId,
                            excludeUserId: session.user.id,
                            type: 'ALERT',
                            title,
                            message: sanitizedDescription.substring(0, 100) + (sanitizedDescription.length > 100 ? '...' : ''),
                            link: '/alerts',
                        });
                    }
                } catch (err) {
                    console.error('Notification error:', err);
                }
            })()
        ]);

        return response;
    } catch (error) {
        console.error("CREATE_ALERT_ERROR", error);
        return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 });
    }
}
