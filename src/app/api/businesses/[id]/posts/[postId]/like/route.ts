import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Liker/unliker une publication
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

        // Vérifier si l'utilisateur a déjà liké
        const existingLike = await prisma.proPostLike.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId: session.user.id,
                },
            },
        });

        if (existingLike) {
            // Unliker
            await prisma.proPostLike.delete({
                where: {
                    id: existingLike.id,
                },
            });

            return NextResponse.json({ liked: false });
        } else {
            // Liker
            await prisma.proPostLike.create({
                data: {
                    postId,
                    userId: session.user.id,
                },
            });

            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        console.error("TOGGLE_LIKE_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
