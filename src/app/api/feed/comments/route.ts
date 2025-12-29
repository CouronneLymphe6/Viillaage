import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addComment, getComments } from '@/lib/feed/feed-service';
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
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const comments = await getComments(id, type);
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

        const comment = await addComment(user.id, id, type, content);

        return NextResponse.json(comment);
    } catch (error) {
        console.error('Error adding comment:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
    }
}
