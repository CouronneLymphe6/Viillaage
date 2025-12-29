import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUnifiedFeed, FeedItemType } from '@/lib/feedService';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);

        // Parse filters
        const typesParam = searchParams.get('types');
        const types = typesParam
            ? (typesParam.split(',') as FeedItemType[])
            : undefined;

        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Fetch unified feed
        const feedItems = await getUnifiedFeed({ types, limit, offset });

        return NextResponse.json({
            items: feedItems,
            hasMore: feedItems.length === limit,
            offset: offset + feedItems.length,
        });

    } catch (error) {
        console.error('Error fetching feed:', error);
        return NextResponse.json(
            { error: 'Erreur lors du chargement du fil' },
            { status: 500 }
        );
    }
}
