import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { toggleLike } from '@/lib/feed/feed-service';
import { z } from 'zod';

const likeSchema = z.object({
    id: z.string(),
    type: z.string(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as any;
        const json = await req.json();
        const { id, type } = likeSchema.parse(json);

        const result = await toggleLike(user.id, id, type);

        // If this is a new like (not unlike), send notification to the author
        if (result.liked) {
            try {
                const { db } = await import('@/lib/prisma');
                const { createNotification } = await import('@/lib/notificationHelper');

                // Get the author of the content based on type
                let authorId: string | null = null;

                switch (type) {
                    case 'FEED_POST':
                        const feedPost = await db.feedPost.findUnique({
                            where: { id },
                            select: { userId: true }
                        });
                        authorId = feedPost?.userId || null;
                        break;

                    case 'ALERT':
                        const alert = await db.alert.findUnique({
                            where: { id },
                            select: { userId: true }
                        });
                        authorId = alert?.userId || null;
                        break;

                    case 'PRO_POST':
                        const proPost = await db.proPost.findUnique({
                            where: { id },
                            include: { business: { select: { ownerId: true } } }
                        });
                        authorId = proPost?.business.ownerId || null;
                        break;

                    case 'ASSOCIATION_POST':
                        const assocPost = await db.associationPost.findUnique({
                            where: { id },
                            include: { association: { select: { ownerId: true } } }
                        });
                        authorId = assocPost?.association.ownerId || null;
                        break;

                    case 'EVENT':
                        const event = await db.event.findUnique({
                            where: { id },
                            select: { organizerId: true }
                        });
                        authorId = event?.organizerId || null;
                        break;

                    case 'LISTING':
                        const listing = await db.listing.findUnique({
                            where: { id },
                            select: { userId: true }
                        });
                        authorId = listing?.userId || null;
                        break;
                }

                // Send notification if author exists and is not the liker
                if (authorId && authorId !== user.id) {
                    await createNotification({
                        userId: authorId,
                        type: 'LIKE',
                        title: 'Nouveau like',
                        message: `${user.name || 'Un utilisateur'} a aimé votre publication`,
                        link: `/feed`
                    });
                }
            } catch (notifError) {
                // Log but don't fail the request
                console.error('Failed to send like notification:', notifError);
            }
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error toggling like:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
    }
}
