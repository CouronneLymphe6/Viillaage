import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer les membres d'une association
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const members = await prisma.associationMember.findMany({
            where: {
                associationId: id,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
            orderBy: {
                joinedAt: 'asc',
            },
        });

        return NextResponse.json(members);
    } catch (error) {
        console.error("GET_ASSOCIATION_MEMBERS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST - Rejoindre l'association
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

        // Vérifier si l'utilisateur est déjà membre
        const existingMember = await prisma.associationMember.findUnique({
            where: {
                associationId_userId: {
                    associationId: id,
                    userId: session.user.id,
                },
            },
        });

        if (existingMember) {
            return new NextResponse("Already a member", { status: 400 });
        }

        const member = await prisma.associationMember.create({
            data: {
                associationId: id,
                userId: session.user.id,
                role: 'MEMBER',
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
        });

        // Mettre à jour les stats
        await prisma.associationStats.upsert({
            where: { associationId: id },
            update: {
                memberCount: {
                    increment: 1,
                },
            },
            create: {
                associationId: id,
                memberCount: 1,
            },
        });

        return NextResponse.json(member);
    } catch (error) {
        console.error("POST_ASSOCIATION_MEMBER_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// DELETE - Quitter l'association
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        // Vérifier si l'utilisateur est membre
        const member = await prisma.associationMember.findUnique({
            where: {
                associationId_userId: {
                    associationId: id,
                    userId: session.user.id,
                },
            },
        });

        if (!member) {
            return new NextResponse("Not a member", { status: 400 });
        }

        await prisma.associationMember.delete({
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
                memberCount: {
                    decrement: 1,
                },
            },
            create: {
                associationId: id,
                memberCount: 0,
            },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("DELETE_ASSOCIATION_MEMBER_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
