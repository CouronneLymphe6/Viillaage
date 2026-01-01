import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
    content: z.string().min(1),
});

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const commentId = params.id;
        const user = session.user as any;
        const json = await req.json();
        const { content } = updateSchema.parse(json);

        // Get comment to check permissions
        const comment = await db.contentComment.findUnique({
            where: { id: commentId },
            select: { userId: true }
        });

        if (!comment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        // Check if user is author or admin
        const isAuthor = comment.userId === user.id;
        const isAdmin = user.role === 'ADMIN';

        if (!isAuthor && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Update comment
        const updated = await db.contentComment.update({
            where: { id: commentId },
            data: { content },
            include: {
                user: { select: { id: true, name: true, image: true } }
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating comment:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const commentId = params.id;
        const user = session.user as any;

        // Get comment to check permissions
        const comment = await db.contentComment.findUnique({
            where: { id: commentId },
            select: { userId: true }
        });

        if (!comment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        // Check if user is author or admin
        const isAuthor = comment.userId === user.id;
        const isAdmin = user.role === 'ADMIN';

        if (!isAuthor && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Delete comment (cascade will delete replies and likes)
        await db.contentComment.delete({
            where: { id: commentId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    }
}
