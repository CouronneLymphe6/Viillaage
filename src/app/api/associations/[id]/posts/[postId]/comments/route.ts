import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Ajouter un commentaire
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
        const body = await request.json();
        const { content } = body;

        if (!content || !content.trim()) {
            return new NextResponse("Content is required", { status: 400 });
        }

        // Vérifier si le post existe
        const post = await prisma.associationPost.findUnique({
            where: { id: postId },
        });

        if (!post) {
            return new NextResponse("Post not found", { status: 404 });
        }

        const comment = await prisma.associationComment.create({
            data: {
                postId: postId,
                userId: session.user.id,
                content: content.trim(),
            },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
            },
        });

        return NextResponse.json(comment);
    } catch (error) {
        console.error("POST_ASSOCIATION_COMMENT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
