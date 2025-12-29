import { prisma } from '@/lib/prisma';

// ========================================
// TYPES
// ========================================

export type FeedItemType =
    | 'ALERT'
    | 'PRO_POST'
    | 'ASSO_POST'
    | 'EVENT'
    | 'OFFICIAL'
    | 'LISTING';

export interface FeedAuthor {
    id: string;
    name: string;
    image?: string | null;
    role: string;
    businessName?: string; // For PRO_POST
    associationName?: string; // For ASSO_POST
}

export interface UnifiedFeedItem {
    id: string;
    type: FeedItemType;
    title: string;
    content: string;
    author: FeedAuthor;
    mediaUrl?: string | null;
    mediaType?: 'IMAGE' | 'PDF' | 'VIDEO' | null;
    createdAt: Date;
    metadata?: Record<string, any>;

    // Engagement metrics
    commentCount: number;
    likeCount?: number;
    participantCount?: number;
}

export interface FeedFilters {
    types?: FeedItemType[];
    limit?: number;
    offset?: number;
}

// ========================================
// TRANSFORMERS
// ========================================

function transformAlert(alert: any): UnifiedFeedItem {
    return {
        id: alert.id,
        type: 'ALERT',
        title: `Alerte : ${alert.type}`,
        content: alert.description,
        author: {
            id: alert.user.id,
            name: alert.user.name || 'Utilisateur',
            image: alert.user.image,
            role: alert.user.role,
        },
        mediaUrl: alert.photoUrl,
        mediaType: alert.photoUrl ? 'IMAGE' : null,
        createdAt: alert.createdAt,
        metadata: {
            status: alert.status,
            confirmations: alert.confirmations,
            reports: alert.reports,
            latitude: alert.latitude,
            longitude: alert.longitude,
        },
        commentCount: alert._count?.feedComments || 0,
    };
}

function transformProPost(post: any): UnifiedFeedItem {
    return {
        id: post.id,
        type: 'PRO_POST',
        title: post.business.name,
        content: post.content,
        author: {
            id: post.business.owner.id,
            name: post.business.owner.name || 'Professionnel',
            image: post.business.owner.image,
            role: post.business.owner.role,
            businessName: post.business.name,
        },
        mediaUrl: post.mediaUrl,
        mediaType: post.mediaType as any,
        createdAt: post.createdAt,
        metadata: {
            businessId: post.business.id,
            businessCategory: post.business.category,
            postType: post.postType,
        },
        commentCount: post._count?.comments || 0,
        likeCount: post._count?.likes || 0,
    };
}

function transformAssoPost(post: any): UnifiedFeedItem {
    return {
        id: post.id,
        type: 'ASSO_POST',
        title: post.association.name,
        content: post.content,
        author: {
            id: post.association.owner.id,
            name: post.association.owner.name || 'Association',
            image: post.association.photoUrl,
            role: post.association.owner.role,
            associationName: post.association.name,
        },
        mediaUrl: post.mediaUrl,
        mediaType: post.mediaType as any,
        createdAt: post.createdAt,
        metadata: {
            associationId: post.association.id,
            associationCategory: post.association.category,
        },
        commentCount: post._count?.comments || 0,
        likeCount: post._count?.likes || 0,
    };
}

function transformEvent(event: any): UnifiedFeedItem {
    return {
        id: event.id,
        type: 'EVENT',
        title: event.title,
        content: event.description,
        author: {
            id: event.organizer.id,
            name: event.organizer.name || 'Organisateur',
            image: event.organizer.image,
            role: event.organizer.role,
        },
        mediaUrl: event.photoUrl,
        mediaType: event.photoUrl ? 'IMAGE' : null,
        createdAt: event.createdAt,
        metadata: {
            eventDate: event.date,
            location: event.location,
        },
        commentCount: event._count?.feedComments || 0,
        participantCount: event._count?.rsvps || 0,
    };
}

function transformOfficial(official: any): UnifiedFeedItem {
    return {
        id: official.id,
        type: 'OFFICIAL',
        title: official.title,
        content: official.content,
        author: {
            id: official.author.id,
            name: official.author.name || 'Administration',
            image: official.author.image,
            role: official.author.role,
        },
        mediaUrl: official.fileUrl,
        mediaType: official.fileType as any,
        createdAt: official.createdAt,
        metadata: {},
        commentCount: official._count?.feedComments || 0,
    };
}

function transformListing(listing: any): UnifiedFeedItem {
    return {
        id: listing.id,
        type: 'LISTING',
        title: listing.title,
        content: listing.description,
        author: {
            id: listing.user.id,
            name: listing.user.name || 'Utilisateur',
            image: listing.user.image,
            role: listing.user.role,
        },
        mediaUrl: listing.photos ? JSON.parse(listing.photos)[0] : null,
        mediaType: 'IMAGE',
        createdAt: listing.createdAt,
        metadata: {
            category: listing.category,
            price: listing.price,
            contactPhone: listing.contactPhone,
            contactEmail: listing.contactEmail,
        },
        commentCount: listing._count?.feedComments || 0,
    };
}

// ========================================
// MAIN SERVICE
// ========================================

export async function getUnifiedFeed(filters: FeedFilters = {}): Promise<UnifiedFeedItem[]> {
    const { types, limit = 20, offset = 0 } = filters;

    // Determine which types to fetch
    const shouldFetch = (type: FeedItemType) => !types || types.length === 0 || types.includes(type);

    // Parallel fetch all content types with optimized queries
    const [alerts, proPosts, assoPosts, events, officials, listings] = await Promise.all([
        // Alerts
        shouldFetch('ALERT') ? prisma.alert.findMany({
            include: {
                user: { select: { id: true, name: true, image: true, role: true } },
                _count: { select: { votes: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit + offset, // Pre-fetch more for sorting
        }) : [],

        // Pro Posts
        shouldFetch('PRO_POST') ? prisma.proPost.findMany({
            include: {
                business: {
                    include: {
                        owner: { select: { id: true, name: true, image: true, role: true } },
                    },
                },
                _count: { select: { comments: true, likes: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit + offset,
        }) : [],

        // Association Posts
        shouldFetch('ASSO_POST') ? prisma.associationPost.findMany({
            include: {
                association: {
                    include: {
                        owner: { select: { id: true, name: true, image: true, role: true } },
                    },
                },
                _count: { select: { comments: true, likes: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit + offset,
        }) : [],

        // Events
        shouldFetch('EVENT') ? prisma.event.findMany({
            include: {
                organizer: { select: { id: true, name: true, image: true, role: true } },
                _count: { select: { rsvps: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit + offset,
        }) : [],

        // Official Panels
        shouldFetch('OFFICIAL') ? prisma.officialPanel.findMany({
            include: {
                author: { select: { id: true, name: true, image: true, role: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit + offset,
        }) : [],

        // Marketplace Listings
        shouldFetch('LISTING') ? prisma.listing.findMany({
            include: {
                user: { select: { id: true, name: true, image: true, role: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit + offset,
        }) : [],
    ]);

    // Count FeedComments for items that use the unified comment system
    const alertIds = alerts.map(a => a.id);
    const eventIds = events.map(e => e.id);
    const officialIds = officials.map(o => o.id);
    const listingIds = listings.map(l => l.id);

    const [alertComments, eventComments, officialComments, listingComments] = await Promise.all([
        alertIds.length > 0 ? prisma.feedComment.groupBy({
            by: ['feedItemId'],
            where: { feedType: 'ALERT', feedItemId: { in: alertIds } },
            _count: true,
        }) : [],
        eventIds.length > 0 ? prisma.feedComment.groupBy({
            by: ['feedItemId'],
            where: { feedType: 'EVENT', feedItemId: { in: eventIds } },
            _count: true,
        }) : [],
        officialIds.length > 0 ? prisma.feedComment.groupBy({
            by: ['feedItemId'],
            where: { feedType: 'OFFICIAL', feedItemId: { in: officialIds } },
            _count: true,
        }) : [],
        listingIds.length > 0 ? prisma.feedComment.groupBy({
            by: ['feedItemId'],
            where: { feedType: 'LISTING', feedItemId: { in: listingIds } },
            _count: true,
        }) : [],
    ]);

    // Create comment count maps
    const commentCountMap = {
        ALERT: Object.fromEntries(alertComments.map(c => [c.feedItemId, c._count])),
        EVENT: Object.fromEntries(eventComments.map(c => [c.feedItemId, c._count])),
        OFFICIAL: Object.fromEntries(officialComments.map(c => [c.feedItemId, c._count])),
        LISTING: Object.fromEntries(listingComments.map(c => [c.feedItemId, c._count])),
    };

    // Attach comment counts
    alerts.forEach(a => (a._count = { ...a._count, feedComments: commentCountMap.ALERT[a.id] || 0 }));
    events.forEach(e => (e._count = { ...e._count, feedComments: commentCountMap.EVENT[e.id] || 0 }));
    officials.forEach(o => (o._count = { feedComments: commentCountMap.OFFICIAL[o.id] || 0 }));
    listings.forEach(l => (l._count = { feedComments: commentCountMap.LISTING[l.id] || 0 }));

    // Transform all items
    const feedItems: UnifiedFeedItem[] = [
        ...alerts.map(transformAlert),
        ...proPosts.map(transformProPost),
        ...assoPosts.map(transformAssoPost),
        ...events.map(transformEvent),
        ...officials.map(transformOfficial),
        ...listings.map(transformListing),
    ];

    // Sort by date (most recent first) and apply pagination
    return feedItems
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(offset, offset + limit);
}

// ========================================
// COMMENT HELPERS
// ========================================

export async function getFeedComments(feedType: FeedItemType, feedItemId: string) {
    // For ProPost and AssociationPost, use their native comment systems
    if (feedType === 'PRO_POST') {
        return prisma.proComment.findMany({
            where: { postId: feedItemId },
            include: { user: { select: { id: true, name: true, image: true, role: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }

    if (feedType === 'ASSO_POST') {
        return prisma.associationComment.findMany({
            where: { postId: feedItemId },
            include: { user: { select: { id: true, name: true, image: true, role: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }

    // For other types, use FeedComment
    return prisma.feedComment.findMany({
        where: { feedType, feedItemId },
        include: { user: { select: { id: true, name: true, image: true, role: true } } },
        orderBy: { createdAt: 'asc' },
    });
}

export async function createFeedComment(
    feedType: FeedItemType,
    feedItemId: string,
    userId: string,
    content: string
) {
    // For ProPost and AssociationPost, use their native comment systems
    if (feedType === 'PRO_POST') {
        return prisma.proComment.create({
            data: { postId: feedItemId, userId, content },
            include: { user: { select: { id: true, name: true, image: true, role: true } } },
        });
    }

    if (feedType === 'ASSO_POST') {
        return prisma.associationComment.create({
            data: { postId: feedItemId, userId, content },
            include: { user: { select: { id: true, name: true, image: true, role: true } } },
        });
    }

    // For other types, use FeedComment
    return prisma.feedComment.create({
        data: { feedType, feedItemId, userId, content },
        include: { user: { select: { id: true, name: true, image: true, role: true } } },
    });
}

export async function deleteFeedComment(feedType: FeedItemType, commentId: string) {
    if (feedType === 'PRO_POST') {
        return prisma.proComment.delete({ where: { id: commentId } });
    }

    if (feedType === 'ASSO_POST') {
        return prisma.associationComment.delete({ where: { id: commentId } });
    }

    return prisma.feedComment.delete({ where: { id: commentId } });
}

export async function updateFeedComment(
    feedType: FeedItemType,
    commentId: string,
    content: string
) {
    if (feedType === 'PRO_POST') {
        return prisma.proComment.update({
            where: { id: commentId },
            data: { content },
            include: { user: { select: { id: true, name: true, image: true, role: true } } },
        });
    }

    if (feedType === 'ASSO_POST') {
        return prisma.associationComment.update({
            where: { id: commentId },
            data: { content },
            include: { user: { select: { id: true, name: true, image: true, role: true } } },
        });
    }

    return prisma.feedComment.update({
        where: { id: commentId },
        data: { content },
        include: { user: { select: { id: true, name: true, image: true, role: true } } },
    });
}
