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

        // OPTIMIZED: Try to delete first (single query)
        const deleted = await prisma.proPostLike.deleteMany({
            where: {
                postId,
                userId: session.user.id,
            },
        });

        // If nothing was deleted, create the like
        if (deleted.count === 0) {
            await prisma.proPostLike.create({
                data: {
                    postId,
                    userId: session.user.id,
                },
            });
            return new NextResponse(null, { status: 204 }); // Faster than JSON
        }

        return new NextResponse(null, { status: 204 }); // Faster than JSON
    } catch (error) {
        console.error("TOGGLE_LIKE_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
