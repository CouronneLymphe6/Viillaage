import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer les publications d'un Pro (avec pagination)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 20;
        const skip = (page - 1) * limit;

        const posts = await prisma.proPost.findMany({
            where: {
                businessId: id,
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
                        createdAt: 'desc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip,
            take: limit,
        });

        // Ajouter le compte de likes et commentaires
        const postsWithCounts = posts.map(post => ({
            ...post,
            likeCount: post.likes.length,
            commentCount: post.comments.length,
        }));

        return NextResponse.json(postsWithCounts);
    } catch (error) {
        console.error("GET_POSTS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST - Créer une publication (owner only)
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
        const { content, mediaType, mediaUrl, postType } = body;

        // Vérifier que l'utilisateur est le propriétaire du business
        const business = await prisma.business.findUnique({
            where: { id },
        });

        if (!business || business.ownerId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Créer la publication
        const post = await prisma.proPost.create({
            data: {
                businessId: id,
                content,
                mediaType,
                mediaUrl,
                postType: postType || "POST",
            },
            include: {
                likes: true,
                comments: true,
            },
        });

        // TODO: Notifier les followers du Pro
        // await notifyProFollowers({ businessId: id, postId: post.id, ... });

        return NextResponse.json(post);
    } catch (error) {
        console.error("CREATE_POST_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
