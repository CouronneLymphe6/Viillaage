import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/pro-posts/[id] - Supprimer un post Pro
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
        const postId = params.id;

        // Vérifier que le post appartient à un business du user
        const post = await prisma.proPost.findUnique({
            where: { id: postId },
            include: {
                business: true,
            },
        });

        if (!post) {
            return NextResponse.json(
                { error: "Post non trouvé" },
                { status: 404 }
            );
        }

        // Vérifier ownership
        if (post.business.ownerId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Supprimer le post
        await prisma.proPost.delete({
            where: { id: postId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE_PRO_POST_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// PUT /api/pro-posts/[id] - Modifier un post Pro
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
        const postId = params.id;
        const body = await request.json();
        const { content, mediaUrl, mediaType } = body;

        // Vérifier que le post appartient à un business du user
        const post = await prisma.proPost.findUnique({
            where: { id: postId },
            include: {
                business: true,
            },
        });

        if (!post) {
            return NextResponse.json(
                { error: "Post non trouvé" },
                { status: 404 }
            );
        }

        // Vérifier ownership
        if (post.business.ownerId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Mettre à jour le post
        const updatedPost = await prisma.proPost.update({
            where: { id: postId },
            data: {
                content: content || post.content,
                mediaUrl: mediaUrl !== undefined ? mediaUrl : post.mediaUrl,
                mediaType: mediaType !== undefined ? mediaType : post.mediaType,
            },
        });

        return NextResponse.json(updatedPost);
    } catch (error) {
        console.error("UPDATE_PRO_POST_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
