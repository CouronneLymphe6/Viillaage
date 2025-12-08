import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Vérifier si l'utilisateur suit ce Pro
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ isFollowing: false });
        }

        const { id } = await params;

        const follower = await prisma.proFollower.findUnique({
            where: {
                businessId_userId: {
                    businessId: id,
                    userId: session.user.id,
                },
            },
        });

        return NextResponse.json({ isFollowing: !!follower });
    } catch (error) {
        console.error("CHECK_FOLLOW_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST - Suivre/ne plus suivre un Pro
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

        // Vérifier si l'utilisateur suit déjà
        const existingFollow = await prisma.proFollower.findUnique({
            where: {
                businessId_userId: {
                    businessId: id,
                    userId: session.user.id,
                },
            },
        });

        if (existingFollow) {
            // Ne plus suivre
            await prisma.proFollower.delete({
                where: {
                    id: existingFollow.id,
                },
            });

            // Mettre à jour les stats
            await prisma.proStats.update({
                where: { businessId: id },
                data: {
                    followerCount: {
                        decrement: 1,
                    },
                },
            }).catch(() => {
                // Si les stats n'existent pas encore, on ignore l'erreur
            });

            return NextResponse.json({ following: false });
        } else {
            // Suivre
            await prisma.proFollower.create({
                data: {
                    businessId: id,
                    userId: session.user.id,
                },
            });

            // Mettre à jour ou créer les stats
            await prisma.proStats.upsert({
                where: { businessId: id },
                update: {
                    followerCount: {
                        increment: 1,
                    },
                },
                create: {
                    businessId: id,
                    followerCount: 1,
                },
            });

            return NextResponse.json({ following: true });
        }
    } catch (error) {
        console.error("TOGGLE_FOLLOW_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
