import { db } from '../prisma';
import { FeedItem, FeedItemType, FeedAuthor } from './types';

const ITEMS_PER_PAGE = 20;

export async function getUnifiedFeed(
    page: number = 1,
    limit: number = ITEMS_PER_PAGE,
    userId?: string,
    villageId?: string
): Promise<FeedItem[]> {
    // OPTIMIZED APPROACH: Fetch more items initially, then sort and slice
    // This ensures proper chronological ordering across all content types
    const fetchLimit = limit * 2; // Fetch 2x to ensure we have enough after sorting
    const skip = 0; // Always start from 0, we'll handle pagination after sorting

    const [
        feedPosts,
        alerts,
        proPosts,
        assPosts,
        listings,
        events,
        assoEvents
    ] = await Promise.all([
        // 1. User Feed Posts (General)
        db.feedPost.findMany({
            where: villageId ? { user: { villageId } } : {},
            take: fetchLimit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, name: true, image: true, role: true } },
                _count: { select: { comments: true } }
            }
        }),

        // 2. Alerts
        db.alert.findMany({
            where: villageId ? { user: { villageId } } : {},
            take: fetchLimit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, name: true, image: true } }
            }
        }),

        // 3. Pro Posts
        db.proPost.findMany({
            where: villageId ? { business: { owner: { villageId } } } : {},
            take: fetchLimit,
            orderBy: { createdAt: 'desc' },
            include: {
                business: { select: { id: true, name: true, category: true, photos: true } },
                _count: { select: { comments: true } }
            }
        }),

        // 4. Association Posts
        db.associationPost.findMany({
            where: villageId ? { association: { owner: { villageId } } } : {},
            take: fetchLimit,
            orderBy: { createdAt: 'desc' },
            include: {
                association: { select: { id: true, name: true, photoUrl: true } },
                _count: { select: { comments: true } }
            }
        }),

        // 5. Listings (Market)
        db.listing.findMany({
            where: villageId ? { user: { villageId } } : {},
            take: fetchLimit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, name: true, image: true } }
            }
        }),

        // 6. User Events
        db.event.findMany({
            where: villageId ? { organizer: { villageId } } : {},
            take: fetchLimit,
            orderBy: { createdAt: 'desc' },
            include: {
                organizer: { select: { id: true, name: true, image: true } },
                _count: { select: { rsvps: true } }
            }
        }),

        // 7. Association Events
        db.associationEvent.findMany({
            where: villageId ? { association: { owner: { villageId } } } : {},
            take: fetchLimit,
            orderBy: { createdAt: 'desc' },
            include: {
                association: { select: { id: true, name: true, photoUrl: true } }
            }
        })
    ]);

    // --- BATCH FETCH ALL LIKES (PERFORMANCE OPTIMIZATION) ---
    // Collect all content IDs by type
    const contentIds = {
        ALERT: alerts.map(a => a.id),
        PRO_POST: proPosts.map(p => p.id),
        ASSOCIATION_POST: assPosts.map(p => p.id),
        EVENT: events.map(e => e.id),
        ASSOCIATION_EVENT: assoEvents.map(e => e.id),
        LISTING: listings.map(l => l.id)
    };

    // Fetch all likes in ONE query
    const allLikes = userId ? await db.contentLike.findMany({
        where: {
            OR: Object.entries(contentIds).flatMap(([type, ids]) =>
                ids.map(id => ({ contentType: type, contentId: id }))
            )
        },
        select: {
            contentType: true,
            contentId: true,
            userId: true
        }
    }) : [];

    // Create lookup maps for O(1) access
    const likeCounts = new Map<string, number>();
    const userLikes = new Set<string>();

    allLikes.forEach(like => {
        const key = `${like.contentType}_${like.contentId}`;
        likeCounts.set(key, (likeCounts.get(key) || 0) + 1);
        if (like.userId === userId) {
            userLikes.add(key);
        }
    });

    // Helper function to get like metrics
    const getLikeMetrics = (type: string, id: string) => ({
        count: likeCounts.get(`${type}_${id}`) || 0,
        isLiked: userLikes.has(`${type}_${id}`)
    });

    // --- MAPPING ---
    const items: FeedItem[] = [];

    // Map FeedPosts
    feedPosts.forEach(p => {
        items.push({
            id: `post_${p.id}`,
            originalId: p.id,
            type: 'FEED_POST',
            createdAt: p.createdAt,
            author: {
                id: p.user.id,
                name: p.user.name || 'Utilisateur',
                image: p.user.image,
                type: 'USER',
                subline: p.category
            },
            content: {
                text: p.content,
                mediaUrl: p.mediaUrl,
                mediaType: p.mediaType as any
            },
            metrics: {
                likes: p._count.likes || 0,
                comments: p._count.comments,
                isLiked: false // TODO: FeedPost likes
            }
        });
    });

    // Map Alerts (separate security alerts from official announcements)
    alerts.forEach(a => {
        const isOfficialAnnouncement = a.type.startsWith('OFFICIAL_');

        // French translations for alert types
        const alertTypeLabels: Record<string, string> = {
            'ROAD_HAZARD': 'Danger routier',
            'SUSPICIOUS_ACTIVITY': 'Activité suspecte',
            'LOST_PET': 'Animal perdu',
            'FOUND_PET': 'Animal trouvé',
            'OFFICIAL_INFO': 'Information officielle',
            'OFFICIAL_DECREE': 'Arrêté municipal',
            'OFFICIAL_ANNOUNCEMENT': 'Annonce officielle'
        };

        items.push({
            id: `alert_${a.id}`,
            originalId: a.id,
            type: isOfficialAnnouncement ? 'OFFICIAL' : 'ALERT',
            createdAt: a.createdAt,
            author: {
                id: a.user.id,
                name: a.user.name || 'Voisin',
                image: a.user.image,
                type: 'USER',
                subline: isOfficialAnnouncement ? 'Panneau officiel' : 'Alerte sécurité'
            },
            content: {
                title: isOfficialAnnouncement
                    ? alertTypeLabels[a.type] || a.type
                    : `Alerte : ${alertTypeLabels[a.type] || a.type}`,
                text: a.description,
                mediaUrl: a.photoUrl,
                mediaType: a.photoUrl ? 'PHOTO' : 'NONE'
            },
            metrics: {
                likes: getLikeMetrics('ALERT', a.id).count,
                comments: 0,
                isLiked: getLikeMetrics('ALERT', a.id).isLiked
            },
            metadata: {
                alertType: a.type,
                status: a.status,
                location: `${a.latitude}, ${a.longitude}`
            }
        });
    });

    // Map ProPosts
    proPosts.forEach(p => {
        const businessImage = p.business.photos && p.business.photos !== '[]'
            ? JSON.parse(p.business.photos)[0]
            : null;

        items.push({
            id: `pro_${p.id}`,
            originalId: p.id,
            type: 'PRO_POST',
            createdAt: p.createdAt,
            author: {
                id: p.business.id,
                name: p.business.name,
                image: businessImage,
                type: 'BUSINESS',
                subline: p.business.category
            },
            content: {
                text: p.content,
                mediaUrl: p.mediaUrl,
                mediaType: p.mediaType as any
            },
            metrics: {
                likes: getLikeMetrics('PRO_POST', p.id).count,
                comments: p._count.comments,
                isLiked: getLikeMetrics('PRO_POST', p.id).isLiked
            }
        });
    });

    // Map AssociationPosts
    assPosts.forEach(p => {
        items.push({
            id: `asso_${p.id}`,
            originalId: p.id,
            type: 'ASSOCIATION_POST',
            createdAt: p.createdAt,
            author: {
                id: p.association.id,
                name: p.association.name,
                image: p.association.photoUrl,
                type: 'ASSOCIATION'
            },
            content: {
                text: p.content,
                mediaUrl: p.mediaUrl,
                mediaType: p.mediaType as any
            },
            metrics: {
                likes: getLikeMetrics('ASSOCIATION_POST', p.id).count,
                comments: p._count.comments,
                isLiked: getLikeMetrics('ASSOCIATION_POST', p.id).isLiked
            }
        });
    });

    // Map Listings
    listings.forEach(l => {
        const photos = l.photos && l.photos !== '[]' ? JSON.parse(l.photos) : [];
        items.push({
            id: `listing_${l.id}`,
            originalId: l.id,
            type: 'LISTING',
            createdAt: l.createdAt,
            author: {
                id: l.user.id,
                name: l.user.name || 'Voisin',
                image: l.user.image,
                type: 'USER',
                subline: 'Petites annonces'
            },
            content: {
                title: l.title,
                text: l.description,
                mediaUrl: photos[0],
                mediaType: photos.length > 0 ? 'PHOTO' : 'NONE'
            },
            metrics: {
                likes: getLikeMetrics('LISTING', l.id).count,
                comments: 0,
                isLiked: getLikeMetrics('LISTING', l.id).isLiked
            },
            metadata: {
                price: l.price || 0,
                listingCategory: l.category
            }
        });
    });

    // Map Events
    events.forEach(e => {
        items.push({
            id: `event_${e.id}`,
            originalId: e.id,
            type: 'EVENT',
            createdAt: e.createdAt,
            author: {
                id: e.organizer.id,
                name: e.organizer.name || 'Organisateur',
                image: e.organizer.image,
                type: 'USER',
                subline: 'Agenda'
            },
            content: {
                title: e.title,
                text: e.description,
                mediaUrl: e.photoUrl,
                mediaType: e.photoUrl ? 'PHOTO' : 'NONE'
            },
            metrics: {
                likes: getLikeMetrics('EVENT', e.id).count,
                comments: 0,
                isLiked: getLikeMetrics('EVENT', e.id).isLiked
            },
            metadata: {
                eventDate: e.date,
                location: e.location || ''
            }
        });
    });

    // Map Association Events
    assoEvents.forEach(e => {
        items.push({
            id: `asso_event_${e.id}`,
            originalId: e.id,
            type: 'ASSOCIATION_EVENT',
            createdAt: e.createdAt,
            author: {
                id: e.association.id,
                name: e.association.name,
                image: e.association.photoUrl,
                type: 'ASSOCIATION',
                subline: 'Événement'
            },
            content: {
                title: e.title,
                text: e.description || '',
                mediaUrl: null,
                mediaType: 'NONE'
            },
            metrics: {
                likes: getLikeMetrics('ASSOCIATION_EVENT', e.id).count,
                comments: 0,
                isLiked: getLikeMetrics('ASSOCIATION_EVENT', e.id).isLiked
            },
            metadata: {
                eventDate: e.startDate,
                location: e.location || '',
                status: e.type
            }
        });
    });

    // Sort all items by createdAt desc
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // PROPER PAGINATION: Slice the sorted array
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return items.slice(startIndex, endIndex);
}

export async function toggleLike(
    userId: string,
    targetId: string,
    targetType: string
): Promise<{ liked: boolean; count: number }> {
    // Universal like system using ContentLike table
    const existing = await db.contentLike.findUnique({
        where: {
            userId_contentType_contentId: {
                userId,
                contentType: targetType,
                contentId: targetId
            }
        }
    });

    if (existing) {
        // Unlike: delete the like
        await db.contentLike.delete({
            where: { id: existing.id }
        });
    } else {
        // Like: create a new like
        await db.contentLike.create({
            data: {
                id: `like_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId,
                contentType: targetType,
                contentId: targetId
            }
        });
    }

    // Count total likes for this content
    const count = await db.contentLike.count({
        where: {
            contentType: targetType,
            contentId: targetId
        }
    });

    return { liked: !existing, count };
}

export async function addComment(
    userId: string,
    targetId: string,
    targetType: string,
    content: string
): Promise<any> {
    switch (targetType) {
        case 'FEED_POST':
            return db.feedComment.create({
                data: { postId: targetId, userId, content },
                include: { user: { select: { name: true, image: true } } }
            });

        case 'PRO_POST':
            return db.proComment.create({
                data: { postId: targetId, userId, content },
                include: { user: { select: { name: true, image: true } } }
            });

        case 'ASSOCIATION_POST':
            return db.associationComment.create({
                data: { postId: targetId, userId, content },
                include: { user: { select: { name: true, image: true } } }
            });

        default:
            throw new Error(`Comments are not supported for type ${targetType}`);
    }
}

export async function getComments(
    targetId: string,
    targetType: string
): Promise<any[]> {
    switch (targetType) {
        case 'FEED_POST':
            return db.feedComment.findMany({
                where: { postId: targetId },
                include: { user: { select: { id: true, name: true, image: true } } },
                orderBy: { createdAt: 'asc' }
            });

        case 'PRO_POST':
            return db.proComment.findMany({
                where: { postId: targetId },
                include: { user: { select: { id: true, name: true, image: true } } },
                orderBy: { createdAt: 'asc' }
            });

        case 'ASSOCIATION_POST':
            return db.associationComment.findMany({
                where: { postId: targetId },
                include: { user: { select: { id: true, name: true, image: true } } },
                orderBy: { createdAt: 'asc' }
            });

        default:
            return [];
    }
}
