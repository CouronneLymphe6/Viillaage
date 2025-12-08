import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer les événements d'une association
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const events = await prisma.associationEvent.findMany({
            where: {
                associationId: id,
            },
            orderBy: {
                startDate: 'asc',
            },
        });

        return NextResponse.json(events);
    } catch (error) {
        console.error("GET_ASSOCIATION_EVENTS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST - Créer un événement
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
        const body = await request.json();
        const { title, description, type, startDate, endDate, location } = body;

        // Vérifier que l'utilisateur est le propriétaire
        const association = await prisma.association.findUnique({
            where: { id },
        });

        if (!association) {
            return new NextResponse("Association not found", { status: 404 });
        }

        if (association.ownerId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const event = await prisma.associationEvent.create({
            data: {
                associationId: id,
                title,
                description: description || null,
                type,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                location: location || null,
            },
        });

        // Mettre à jour les stats
        await prisma.associationStats.upsert({
            where: { associationId: id },
            update: {
                eventCount: {
                    increment: 1,
                },
            },
            create: {
                associationId: id,
                eventCount: 1,
            },
        });

        return NextResponse.json(event);
    } catch (error) {
        console.error("POST_ASSOCIATION_EVENT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
