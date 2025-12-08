import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer les commentaires d'une publication
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string; postId: string }> }
) {
    try {
        const { postId } = await params;

        const comments = await prisma.proComment.findMany({
            where: {
                postId,
            },
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
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error("GET_COMMENTS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

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

        if (!content || content.trim() === '') {
            return new NextResponse("Content is required", { status: 400 });
        }

        const comment = await prisma.proComment.create({
            data: {
                postId,
                userId: session.user.id,
                content,
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
        console.error("CREATE_COMMENT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
