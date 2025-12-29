import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
    getFeedComments,
    createFeedComment,
    deleteFeedComment,
    updateFeedComment,
    FeedItemType,
} from '@/lib/feedService';

// GET - Fetch comments for a feed item
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
        const feedType = searchParams.get('feedType') as FeedItemType;
        const feedItemId = searchParams.get('feedItemId');

        if (!feedType || !feedItemId) {
            return NextResponse.json(
                { error: 'Paramètres manquants' },
                { status: 400 }
            );
        }

        const comments = await getFeedComments(feedType, feedItemId);

        return NextResponse.json({ comments });

    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            { error: 'Erreur lors du chargement des commentaires' },
            { status: 500 }
        );
    }
}

// POST - Create a new comment
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { feedType, feedItemId, content } = body;

        if (!feedType || !feedItemId || !content?.trim()) {
            return NextResponse.json(
                { error: 'Données invalides' },
                { status: 400 }
            );
        }

        const comment = await createFeedComment(
            feedType as FeedItemType,
            feedItemId,
            session.user.id,
            content.trim()
        );

        return NextResponse.json({ comment }, { status: 201 });

    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la création du commentaire' },
            { status: 500 }
        );
    }
}

// PATCH - Update a comment (admin or author only)
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { feedType, commentId, content } = body;

        if (!feedType || !commentId || !content?.trim()) {
            return NextResponse.json(
                { error: 'Données invalides' },
                { status: 400 }
            );
        }

        // Admin can edit any comment, users can only edit their own
        // This check should be done in the service layer for better security
        const isAdmin = session.user.role === 'ADMIN';

        if (!isAdmin) {
            // TODO: Add author check here
            return NextResponse.json(
                { error: 'Permission refusée' },
                { status: 403 }
            );
        }

        const comment = await updateFeedComment(
            feedType as FeedItemType,
            commentId,
            content.trim()
        );

        return NextResponse.json({ comment });

    } catch (error) {
        console.error('Error updating comment:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la modification du commentaire' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a comment (admin or author only)
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const feedType = searchParams.get('feedType') as FeedItemType;
        const commentId = searchParams.get('commentId');

        if (!feedType || !commentId) {
            return NextResponse.json(
                { error: 'Paramètres manquants' },
                { status: 400 }
            );
        }

        // Admin can delete any comment
        const isAdmin = session.user.role === 'ADMIN';

        if (!isAdmin) {
            // TODO: Add author check here
            return NextResponse.json(
                { error: 'Permission refusée' },
                { status: 403 }
            );
        }

        await deleteFeedComment(feedType, commentId);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting comment:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la suppression du commentaire' },
            { status: 500 }
        );
    }
}
