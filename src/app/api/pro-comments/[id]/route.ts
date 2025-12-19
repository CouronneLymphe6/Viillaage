import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/pro-comments/[id] - Supprimer un commentaire Pro
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const params = await props.params;
        const commentId = params.id;

        // Récupérer le commentaire
        const comment = await prisma.proComment.findUnique({
            where: { id: commentId },
        });

        if (!comment) {
            return NextResponse.json(
                { error: "Commentaire non trouvé" },
                { status: 404 }
            );
        }

        // Vérifier ownership ou admin
        const isAdmin = (session.user as any).role === 'ADMIN';

        if (comment.userId !== session.user.id && !isAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Supprimer le commentaire
        await prisma.proComment.delete({
            where: { id: commentId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE_PRO_COMMENT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// PUT /api/pro-comments/[id] - Modifier un commentaire Pro
export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const params = await props.params;
        const commentId = params.id;
        const body = await request.json();
        const { content } = body;

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { error: "Le contenu ne peut pas être vide" },
                { status: 400 }
            );
        }

        // Récupérer le commentaire
        const comment = await prisma.proComment.findUnique({
            where: { id: commentId },
        });

        if (!comment) {
            return NextResponse.json(
                { error: "Commentaire non trouvé" },
                { status: 404 }
            );
        }

        // Vérifier ownership ou admin
        const isAdmin = (session.user as any).role === 'ADMIN';

        if (comment.userId !== session.user.id && !isAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Mettre à jour le commentaire
        const updatedComment = await prisma.proComment.update({
            where: { id: commentId },
            data: { content },
        });

        return NextResponse.json(updatedComment);
    } catch (error) {
        console.error("UPDATE_PRO_COMMENT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
