import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from '@/lib/prisma';
import { z } from 'zod';

const commentSchema = z.object({
    id: z.string(),
    type: z.string(),
    content: z.string().min(1),
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const type = searchParams.get('type');

        if (!id || !type) {
            return NextResponse.json(
                { error: 'Missing id or type parameter' },
                { status: 400 }
            );
        }

        // Use universal ContentComment for all types
        const comments = await db.contentComment.findMany({
            where: {
                contentType: type,
                contentId: id
            },
            include: {
                user: { select: { id: true, name: true, image: true } }
            },
            orderBy: { createdAt: 'asc' }
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as any;
        const json = await req.json();
        const { id, type, content } = commentSchema.parse(json);

        // Use universal ContentComment for all types
        const comment = await db.contentComment.create({
            data: {
                userId: user.id,
                contentType: type,
                contentId: id,
                content: content,
            },
            include: {
                user: { select: { id: true, name: true, image: true } }
            }
        });

        // Send notification to the post author
        try {
            const { createNotification } = await import('@/lib/notificationHelper');

            // Get the author of the post
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

                case 'ASSOCIATION_EVENT':
                    const assocEvent = await db.associationEvent.findUnique({
                        where: { id },
                        include: { association: { select: { ownerId: true } } }
                    });
                    authorId = assocEvent?.association.ownerId || null;
                    break;
            }

            // Send notification if author exists and is not the commenter
            if (authorId && authorId !== user.id) {
                const excerpt = content.length > 50 ? content.substring(0, 50) + '...' : content;
                await createNotification({
                    userId: authorId,
                    type: 'COMMENT',
                    title: 'Nouveau commentaire',
                    message: `${user.name || 'Un utilisateur'} a commenté : "${excerpt}"`,
                    link: `/feed`
                });
            }
        } catch (notifError) {
            // Log but don't fail the request
            console.error('Failed to send comment notification:', notifError);
        }

        return NextResponse.json(comment);
    } catch (error) {
        console.error('Error creating comment:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
}
