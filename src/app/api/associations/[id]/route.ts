import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer une association spécifique
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const association = await prisma.association.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!association) {
            return new NextResponse("Association not found", { status: 404 });
        }

        return NextResponse.json(association);
    } catch (error) {
        console.error("GET_ASSOCIATION_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// PATCH - Mettre à jour une association
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, description, category, president, phone, email, website, photoUrl } = body;

        // Check if the association exists and belongs to the user
        const existingAssociation = await prisma.association.findUnique({
            where: { id },
        });

        if (!existingAssociation) {
            return new NextResponse("Association not found", { status: 404 });
        }

        const isAdmin = (session.user as any).role === 'ADMIN';

        if (existingAssociation.ownerId !== session.user.id && !isAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const association = await prisma.association.update({
            where: { id },
            data: {
                name: name || existingAssociation.name,
                description: description || existingAssociation.description,
                category: category || existingAssociation.category,
                president: president !== undefined ? president : existingAssociation.president,
                phone: phone !== undefined ? phone : existingAssociation.phone,
                email: email !== undefined ? email : existingAssociation.email,
                website: website !== undefined ? website : existingAssociation.website,
                photoUrl: photoUrl !== undefined ? photoUrl : existingAssociation.photoUrl,
            },
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(association);
    } catch (error) {
        console.error("UPDATE_ASSOCIATION_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// DELETE - Supprimer une association
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

        // Check if the association exists and belongs to the user
        const existingAssociation = await prisma.association.findUnique({
            where: { id },
        });

        if (!existingAssociation) {
            return new NextResponse("Association not found", { status: 404 });
        }

        const isAdmin = (session.user as any).role === 'ADMIN';

        if (existingAssociation.ownerId !== session.user.id && !isAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        await prisma.association.delete({
            where: { id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("DELETE_ASSOCIATION_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
