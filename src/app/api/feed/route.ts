import { NextRequest, NextResponse } from 'next/server';
import { getUnifiedFeed } from '@/lib/feed/feed-service';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from 'zod';

const postSchema = z.object({
    content: z.string().min(1),
    category: z.string().optional().default('GENERAL'),
    mediaUrl: z.string().optional(),
    mediaType: z.enum(['PHOTO', 'VIDEO', 'NONE']).optional().default('NONE')
});

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check if we need query params
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        // Fetch feed - don't filter by villageId for now to get all content
        const userId = session?.user?.id;
        const villageId = (session?.user as any)?.villageId || undefined;

        console.log('Feed API - userId:', userId, 'villageId:', villageId);

        const feed = await getUnifiedFeed(page, limit, userId, villageId);

        console.log('Feed API - items returned:', feed.length);

        return NextResponse.json({ items: feed });
    } catch (error) {
        console.error('Error fetching feed:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
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
        const body = postSchema.parse(json);

        const post = await db.feedPost.create({
            data: {
                content: body.content,
                category: body.category,
                mediaUrl: body.mediaUrl,
                mediaType: body.mediaType as any,
                userId: user.id
            }
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
