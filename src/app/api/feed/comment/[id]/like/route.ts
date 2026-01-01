import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const commentId = params.id;
        const user = session.user as any;

        // Check if already liked
        const existing = await db.commentLike.findUnique({
            where: {
                commentId_userId: {
                    commentId,
                    userId: user.id
                }
            }
        });

        if (existing) {
            // Unlike
            await db.commentLike.delete({
                where: { id: existing.id }
            });
        } else {
            // Like
            await db.commentLike.create({
                data: {
                    commentId,
                    userId: user.id
                }
            });

            // Send notification to comment author
            try {
                const comment = await db.contentComment.findUnique({
                    where: { id: commentId },
                    select: { userId: true }
                });

                if (comment && comment.userId !== user.id) {
                    const { createNotification } = await import('@/lib/notificationHelper');
                    await createNotification({
                        userId: comment.userId,
                        type: 'LIKE',
                        title: 'Like sur votre commentaire',
                        message: `${user.name || 'Un utilisateur'} a aimé votre commentaire`,
                        link: `/feed`
                    });
                }
            } catch (notifError) {
                console.error('Failed to send comment like notification:', notifError);
            }
        }

        // Count total likes
        const count = await db.commentLike.count({
            where: { commentId }
        });

        return NextResponse.json({ liked: !existing, count });
    } catch (error) {
        console.error('Error toggling comment like:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
