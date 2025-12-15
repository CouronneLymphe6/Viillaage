import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyVillageUsers } from "@/lib/notificationHelper";
import { checkRateLimit, RATE_LIMITS } from "@/lib/security/rate-limiter";

// Simple HTML escape function for XSS protection
function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const channelId = searchParams.get('channelId');

        if (!channelId) {
            return new NextResponse("Channel ID required", { status: 400 });
        }

        const messages = await prisma.message.findMany({
            where: { channelId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                replyTo: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                },
                reactions: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50, // Reduced from 100 for faster loading
        });

        // Return messages in ascending order for UI
        const sortedMessages = messages.reverse();

        return NextResponse.json(sortedMessages, {
            headers: {
                'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
            },
        });
    } catch (error) {
        console.error("GET_MESSAGES_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // SECURITY: Rate limiting
        const rateLimitResponse = await checkRateLimit(
            request,
            RATE_LIMITS.CREATE_MESSAGE,
            session.user.id
        );
        if (rateLimitResponse) {
            return rateLimitResponse;
        }

        const body = await request.json();
        const { content, channelId, replyToId } = body;

        if (!content || !channelId) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // SECURITY: Input validation
        if (content.length > 5000) {
            return new NextResponse("Message trop long (max 5000 caractères)", { status: 400 });
        }

        // SECURITY: XSS protection - escape HTML entities
        const sanitizedContent = escapeHtml(content);

        const message = await prisma.message.create({
            data: {
                content: sanitizedContent,
                channelId,
                userId: session.user.id,
                replyToId,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                replyTo: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                },
                reactions: true,
            },
        });

        // Get user details (name, villageId) and channel name
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { name: true, villageId: true },
        });

        const channel = await prisma.channel.findUnique({
            where: { id: channelId },
            select: { name: true },
        });

        if (user?.villageId && channel) {
            // 1. If it's a reply, notify the original author
            if (replyToId) {
                const originalMessage = await prisma.message.findUnique({
                    where: { id: replyToId },
                    select: { userId: true },
                });

                if (originalMessage && originalMessage.userId !== session.user.id) {
                    await prisma.notification.create({
                        data: {
                            userId: originalMessage.userId,
                            type: 'MESSAGE',
                            title: `💬 Réponse de ${user.name || 'un voisin'}`,
                            message: `${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
                            link: `/messages?channelId=${channelId}`,
                        },
                    });
                }
            }
            // 2. Otherwise, notify village users (general activity)
            // Note: In a real app, we would only notify subscribed users. 
            // For now, we notify everyone to fulfill "Nouveau message de X sur groupe X"
            else {
                await notifyVillageUsers({
                    villageId: user.villageId,
                    excludeUserId: session.user.id,
                    type: 'MESSAGE',
                    title: `💬 Nouveau message dans ${channel.name}`,
                    message: `${user.name || 'Un voisin'}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
                    link: `/messages?channelId=${channelId}`,
                });
            }
        }

        return NextResponse.json(message);
    } catch (error) {
        console.error("CREATE_MESSAGE_ERROR", error);
        return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 });
    }
}
