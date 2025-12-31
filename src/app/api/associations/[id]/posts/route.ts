import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer les posts d'une association
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        const posts = await prisma.associationPost.findMany({
            where: {
                associationId: id,
            },
            include: {
                likes: {
                    select: {
                        userId: true,
                    },
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                image: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 50, // PWA: Limit results
        });

        // Ajouter les counts
        const postsWithCounts = posts.map(post => ({
            ...post,
            likeCount: post.likes.length,
            commentCount: post.comments.length,
        }));

        return NextResponse.json(postsWithCounts, {
            headers: {
                'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
            },
        });
    } catch (error) {
        console.error("GET_ASSOCIATION_POSTS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST - Créer un post
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { content, mediaUrl, mediaType } = body;

        // Vérifier que l'utilisateur est le propriétaire
        const association = await prisma.association.findUnique({
            where: { id },
        });

        if (!association) {
            return new NextResponse("Association not found", { status: 404 });
        }

        if (association.ownerId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const post = await prisma.associationPost.create({
            data: {
                associationId: id,
                content,
                mediaUrl: mediaUrl || null,
                mediaType: mediaType || null,
            },
            include: {
                likes: true,
                comments: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
                association: {
                    select: {
                        name: true,
                        owner: {
                            select: {
                                villageId: true,
                            },
                        },
                    },
                },
            },
        });

        // Notify village users asynchronously
        if (post.association.owner.villageId) {
            import('@/lib/notificationHelper').then(({ notifyVillageUsers }) => {
                notifyVillageUsers({
                    villageId: post.association.owner.villageId!,
                    excludeUserId: session.user.id,
                    type: 'ASSOCIATION',
                    title: `🤝 ${post.association.name}`,
                    message: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
                    link: `/associations/${id}`,
                }).catch(error => {
                    console.error('Failed to send association post notifications:', error);
                });
            });
        }

        return NextResponse.json(post);
    } catch (error) {
        console.error("POST_ASSOCIATION_POST_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
