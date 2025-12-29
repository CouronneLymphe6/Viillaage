import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from '@/lib/prisma';
import { z } from 'zod';

const commentSchema = z.object({
    id: z.string(),
    type: z.string(), // FEED_POST, PRO_POST, ASSOCIATION_POST
    content: z.string().min(1),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as any;
        const json = await req.json();
        const { id, type, content } = commentSchema.parse(json);

        let comment;

        switch (type) {
            case 'FEED_POST':
                comment = await db.feedComment.create({
                    data: {
                        postId: id,
                        userId: user.id,
                        content: content,
                    },
                    include: {
                        user: { select: { name: true, image: true } }
                    }
                });
                break;
            case 'PRO_POST':
                comment = await db.proComment.create({
                    data: {
                        postId: id,
                        userId: user.id,
                        content: content,
                    },
                    include: {
                        user: { select: { name: true, image: true } }
                    }
                });
                break;
            case 'ASSOCIATION_POST':
                comment = await db.associationComment.create({
                    data: {
                        postId: id,
                        userId: user.id,
                        content: content,
                    },
                    include: {
                        user: { select: { name: true, image: true } }
                    }
                });
                break;
            default:
                return NextResponse.json({ error: 'Commenting not supported for this type' }, { status: 400 });
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
