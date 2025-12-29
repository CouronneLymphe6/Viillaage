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
                ...(userId ? { likes: { where: { userId } } } : {}),
                _count: { select: { likes: true, comments: true } }
            }
        }),

        // 2. Alerts
        db.alert.findMany({
            where: villageId ? { user: { villageId } } : {},
            take: fetchLimit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, name: true, image: true } },
                ...(userId ? { votes: { where: { userId, type: 'CONFIRM' } } } : {}),
                _count: { select: { votes: true } }
            }
        }),

        // 3. Pro Posts
        db.proPost.findMany({
            where: villageId ? { business: { owner: { villageId } } } : {},
            take: fetchLimit,
            orderBy: { createdAt: 'desc' },
            include: {
                business: { select: { id: true, name: true, category: true, photos: true } },
                ...(userId ? { likes: { where: { userId } } } : {}),
                _count: { select: { likes: true, comments: true } }
            }
        }),

        // 4. Association Posts
        db.associationPost.findMany({
            where: villageId ? { association: { owner: { villageId } } } : {},
            take: fetchLimit,
            orderBy: { createdAt: 'desc' },
            include: {
                association: { select: { id: true, name: true, photoUrl: true } },
                ...(userId ? { likes: { where: { userId } } } : {}),
                _count: { select: { likes: true, comments: true } }
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
                ...(userId ? { rsvps: { where: { userId } } } : {}),
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
                likes: p._count.likes,
                comments: p._count.comments,
                isLiked: p.likes && p.likes.length > 0
            }
        });
    });

    // Map Alerts
    alerts.forEach(a => {
        items.push({
            id: `alert_${a.id}`,
            originalId: a.id,
            type: 'ALERT',
            createdAt: a.createdAt,
            author: {
                id: a.user.id,
                name: a.user.name || 'Voisin',
                image: a.user.image,
                type: 'USER',
                subline: 'Alerte sécurité'
            },
            content: {
                title: `Alerte : ${a.type}`,
                text: a.description,
                mediaUrl: a.photoUrl,
                mediaType: a.photoUrl ? 'PHOTO' : 'NONE'
            },
            metrics: {
                likes: a._count.votes,
                comments: 0,
                isLiked: a.votes && a.votes.length > 0
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
                likes: p._count.likes,
                comments: p._count.comments,
                isLiked: p.likes && p.likes.length > 0
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
                likes: p._count.likes,
                comments: p._count.comments,
                isLiked: p.likes && p.likes.length > 0
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
                likes: 0,
                comments: 0
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
                likes: e._count.rsvps,
                comments: 0
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
                likes: 0,
                comments: 0
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
    switch (targetType) {
        case 'FEED_POST': {
            const existing = await db.feedPostLike.findUnique({
                where: { postId_userId: { postId: targetId, userId } }
            });
            if (existing) {
                await db.feedPostLike.delete({ where: { id: existing.id } });
            } else {
                await db.feedPostLike.create({ data: { postId: targetId, userId } });
            }
            const count = await db.feedPostLike.count({ where: { postId: targetId } });
            return { liked: !existing, count };
        }

        case 'PRO_POST': {
            const existing = await db.proPostLike.findUnique({
                where: { postId_userId: { postId: targetId, userId } }
            });
            if (existing) {
                await db.proPostLike.delete({ where: { id: existing.id } });
            } else {
                await db.proPostLike.create({ data: { postId: targetId, userId } });
            }
            const count = await db.proPostLike.count({ where: { postId: targetId } });
            return { liked: !existing, count };
        }

        case 'ASSOCIATION_POST': {
            const existing = await db.associationPostLike.findUnique({
                where: { postId_userId: { postId: targetId, userId } }
            });
            if (existing) {
                await db.associationPostLike.delete({ where: { id: existing.id } });
            } else {
                await db.associationPostLike.create({ data: { postId: targetId, userId } });
            }
            const count = await db.associationPostLike.count({ where: { postId: targetId } });
            return { liked: !existing, count };
        }

        case 'ALERT': {
            const existing = await db.alertVote.findUnique({
                where: { alertId_userId: { alertId: targetId, userId } }
            });
            if (existing && existing.type === 'CONFIRM') {
                await db.alertVote.delete({ where: { id: existing.id } });
                const count = await db.alertVote.count({ where: { alertId: targetId, type: 'CONFIRM' } });
                return { liked: false, count };
            } else {
                await db.alertVote.upsert({
                    where: { alertId_userId: { alertId: targetId, userId } },
                    create: { alertId: targetId, userId, type: 'CONFIRM' },
                    update: { type: 'CONFIRM' }
                });
                const count = await db.alertVote.count({ where: { alertId: targetId, type: 'CONFIRM' } });
                return { liked: true, count };
            }
        }

        default:
            throw new Error(`Likes are not supported for type ${targetType}`);
    }
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

