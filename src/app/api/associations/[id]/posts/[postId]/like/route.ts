import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Liker/Unliker un post
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string; postId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { postId } = await params;

        // Vérifier si le post existe
        const post = await prisma.associationPost.findUnique({
            where: { id: postId },
        });

        if (!post) {
            return new NextResponse("Post not found", { status: 404 });
        }

        // Vérifier si l'utilisateur a déjà liké
        const existingLike = await prisma.associationPostLike.findUnique({
            where: {
                postId_userId: {
                    postId: postId,
                    userId: session.user.id,
                },
            },
        });

        if (existingLike) {
            // Unliker
            await prisma.associationPostLike.delete({
                where: {
                    postId_userId: {
                        postId: postId,
                        userId: session.user.id,
                    },
                },
            });

            // Mettre à jour les stats
            await prisma.associationStats.upsert({
                where: { associationId: post.associationId },
                update: {
                    postLikeCount: {
                        decrement: 1,
                    },
                },
                create: {
                    associationId: post.associationId,
                    postLikeCount: 0,
                },
            });

            return NextResponse.json({ liked: false });
        } else {
            // Liker
            await prisma.associationPostLike.create({
                data: {
                    postId: postId,
                    userId: session.user.id,
                },
            });

            // Mettre à jour les stats
            await prisma.associationStats.upsert({
                where: { associationId: post.associationId },
                update: {
                    postLikeCount: {
                        increment: 1,
                    },
                },
                create: {
                    associationId: post.associationId,
                    postLikeCount: 1,
                },
            });

            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        console.error("POST_ASSOCIATION_POST_LIKE_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
