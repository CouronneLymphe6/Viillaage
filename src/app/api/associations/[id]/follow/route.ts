import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Vérifier si l'utilisateur suit l'association
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

        const follower = await prisma.associationFollower.findUnique({
            where: {
                associationId_userId: {
                    associationId: id,
                    userId: session.user.id,
                },
            },
        });

        return NextResponse.json({ isFollowing: !!follower });
    } catch (error) {
        console.error("GET_ASSOCIATION_FOLLOW_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST - Suivre/Ne plus suivre l'association
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

        // Vérifier si l'association existe
        const association = await prisma.association.findUnique({
            where: { id },
        });

        if (!association) {
            return new NextResponse("Association not found", { status: 404 });
        }

        // Vérifier si l'utilisateur suit déjà
        const existingFollow = await prisma.associationFollower.findUnique({
            where: {
                associationId_userId: {
                    associationId: id,
                    userId: session.user.id,
                },
            },
        });

        if (existingFollow) {
            // Ne plus suivre
            await prisma.associationFollower.delete({
                where: {
                    associationId_userId: {
                        associationId: id,
                        userId: session.user.id,
                    },
                },
            });

            // Mettre à jour les stats
            await prisma.associationStats.upsert({
                where: { associationId: id },
                update: {
                    followerCount: {
                        decrement: 1,
                    },
                },
                create: {
                    associationId: id,
                    followerCount: 0,
                },
            });

            return NextResponse.json({ isFollowing: false });
        } else {
            // Suivre
            await prisma.associationFollower.create({
                data: {
                    associationId: id,
                    userId: session.user.id,
                },
            });

            // Mettre à jour les stats
            await prisma.associationStats.upsert({
                where: { associationId: id },
                update: {
                    followerCount: {
                        increment: 1,
                    },
                },
                create: {
                    associationId: id,
                    followerCount: 1,
                },
            });

            return NextResponse.json({ isFollowing: true });
        }
    } catch (error) {
        console.error("POST_ASSOCIATION_FOLLOW_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
