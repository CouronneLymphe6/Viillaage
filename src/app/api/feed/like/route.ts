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

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error toggling like:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
    }
}
