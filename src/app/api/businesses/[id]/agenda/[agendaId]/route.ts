import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH - Modifier un événement d'agenda (owner only)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string; agendaId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id, agendaId } = await params;
        const body = await request.json();
        const { title, description, type, startDate, endDate, isPublic } = body;

        // Vérifier que l'événement existe et appartient au business de l'utilisateur
        const agendaItem = await prisma.proAgenda.findUnique({
            where: { id: agendaId },
            include: { business: true },
        });

        if (!agendaItem || agendaItem.business.ownerId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Mettre à jour l'événement
        const updatedAgendaItem = await prisma.proAgenda.update({
            where: { id: agendaId },
            data: {
                title: title || agendaItem.title,
                description: description !== undefined ? description : agendaItem.description,
                type: type || agendaItem.type,
                startDate: startDate ? new Date(startDate) : agendaItem.startDate,
                endDate: endDate ? new Date(endDate) : agendaItem.endDate,
                isPublic: isPublic !== undefined ? isPublic : agendaItem.isPublic,
            },
        });

        return NextResponse.json(updatedAgendaItem);
    } catch (error) {
        console.error("UPDATE_AGENDA_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// DELETE - Supprimer un événement d'agenda (owner only)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; agendaId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { agendaId } = await params;

        // Vérifier que l'événement existe et appartient au business de l'utilisateur
        const agendaItem = await prisma.proAgenda.findUnique({
            where: { id: agendaId },
            include: { business: true },
        });

        if (!agendaItem || agendaItem.business.ownerId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Supprimer l'événement
        await prisma.proAgenda.delete({
            where: { id: agendaId },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("DELETE_AGENDA_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
