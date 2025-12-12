import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH - Update an agenda item
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string; agendaId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { agendaId } = await params;
        const body = await request.json();

        // Verify agenda exists and user is owner
        const agenda = await prisma.proAgenda.findUnique({
            where: { id: agendaId },
            include: { business: true },
        });

        if (!agenda || agenda.business.ownerId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Update agenda
        const updatedAgenda = await prisma.proAgenda.update({
            where: { id: agendaId },
            data: {
                title: body.title || agenda.title,
                description: body.description !== undefined ? body.description : agenda.description,
                type: body.type || agenda.type,
                startDate: body.startDate ? new Date(body.startDate) : agenda.startDate,
                endDate: body.endDate ? new Date(body.endDate) : agenda.endDate,
            },
        });

        return NextResponse.json(updatedAgenda);
    } catch (error) {
        console.error("UPDATE_AGENDA_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// DELETE - Delete an agenda item
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

        // Verify agenda exists and user is owner
        const agenda = await prisma.proAgenda.findUnique({
            where: { id: agendaId },
            include: { business: true },
        });

        if (!agenda || agenda.business.ownerId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Delete agenda
        await prisma.proAgenda.delete({
            where: { id: agendaId },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("DELETE_AGENDA_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
