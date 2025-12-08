import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer tous les événements d'agenda d'un Pro
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Récupérer tous les événements publics
        const agendaItems = await prisma.proAgenda.findMany({
            where: {
                businessId: id,
                isPublic: true,
            },
            orderBy: {
                startDate: 'asc',
            },
        });

        return NextResponse.json(agendaItems);
    } catch (error) {
        console.error("GET_AGENDA_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST - Créer un nouvel événement d'agenda (owner only)
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
        const { title, description, type, startDate, endDate, isPublic } = body;

        // Vérifier que l'utilisateur est le propriétaire du business
        const business = await prisma.business.findUnique({
            where: { id },
        });

        if (!business || business.ownerId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Créer l'événement
        const agendaItem = await prisma.proAgenda.create({
            data: {
                businessId: id,
                title,
                description,
                type,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isPublic: isPublic !== undefined ? isPublic : true,
            },
        });

        return NextResponse.json(agendaItem);
    } catch (error) {
        console.error("CREATE_AGENDA_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
