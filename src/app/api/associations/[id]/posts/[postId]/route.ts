import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH - Update an association post
export async function PATCH(
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

        // Verify post exists and user is owner
        const post = await prisma.associationPost.findUnique({
            where: { id: postId },
            include: { association: true },
        });

        if (!post || post.association.ownerId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Update post
        const updatedPost = await prisma.associationPost.update({
            where: { id: postId },
            data: {
                content: body.content || post.content,
                mediaUrl: body.mediaUrl !== undefined ? body.mediaUrl : post.mediaUrl,
                mediaType: body.mediaType !== undefined ? body.mediaType : post.mediaType,
            },
        });

        return NextResponse.json(updatedPost);
    } catch (error) {
        console.error("UPDATE_POST_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// DELETE - Delete an association post
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; postId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { postId } = await params;

        // Verify post exists and user is owner
        const post = await prisma.associationPost.findUnique({
            where: { id: postId },
            include: { association: true },
        });

        if (!post || post.association.ownerId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Delete post and all related data
        await prisma.$transaction([
            prisma.associationPostLike.deleteMany({ where: { postId } }),
            prisma.associationComment.deleteMany({ where: { postId } }),
            prisma.associationPost.delete({ where: { id: postId } }),
        ]);

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("DELETE_POST_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
