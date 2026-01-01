import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { z } from 'zod';

const replySchema = z.object({
    content: z.string().min(1),
});

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const parentId = params.id;
        const user = session.user as any;
        const json = await req.json();
        const { content } = replySchema.parse(json);

        // Get parent comment to inherit contentType and contentId
        const parentComment = await db.contentComment.findUnique({
            where: { id: parentId },
            select: { contentType: true, contentId: true, userId: true }
        });

        if (!parentComment) {
            return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
        }

        // Create reply
        const reply = await db.contentComment.create({
            data: {
                userId: user.id,
                contentType: parentComment.contentType,
                contentId: parentComment.contentId,
                content,
                parentId
            },
            include: {
                user: { select: { id: true, name: true, image: true } }
            }
        });

        // Send notification to parent comment author
        try {
            if (parentComment.userId !== user.id) {
                const { createNotification } = await import('@/lib/notificationHelper');
                const excerpt = content.length > 50 ? content.substring(0, 50) + '...' : content;
                await createNotification({
                    userId: parentComment.userId,
                    type: 'COMMENT',
                    title: 'Réponse à votre commentaire',
                    message: `${user.name || 'Un utilisateur'} a répondu : "${excerpt}"`,
                    link: `/feed`
                });
            }
        } catch (notifError) {
            console.error('Failed to send reply notification:', notifError);
        }

        return NextResponse.json(reply);
    } catch (error) {
        console.error('Error creating reply:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 });
    }
}
