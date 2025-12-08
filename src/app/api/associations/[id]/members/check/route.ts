import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Vérifier si l'utilisateur est membre
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ isMember: false });
        }

        const { id } = await params;

        const member = await prisma.associationMember.findUnique({
            where: {
                associationId_userId: {
                    associationId: id,
                    userId: session.user.id,
                },
            },
        });

        return NextResponse.json({ isMember: !!member });
    } catch (error) {
        console.error("GET_ASSOCIATION_MEMBER_CHECK_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
