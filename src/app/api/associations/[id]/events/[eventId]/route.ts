import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH - Update an association event
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string; eventId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { eventId } = await params;
        const body = await request.json();

        // Verify event exists and user is owner
        const event = await prisma.associationEvent.findUnique({
            where: { id: eventId },
            include: { association: true },
        });

        if (!event || event.association.ownerId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Update event
        const updatedEvent = await prisma.associationEvent.update({
            where: { id: eventId },
            data: {
                title: body.title || event.title,
                description: body.description !== undefined ? body.description : event.description,
                type: body.type || event.type,
                location: body.location !== undefined ? body.location : event.location,
                startDate: body.startDate ? new Date(body.startDate) : event.startDate,
                endDate: body.endDate ? new Date(body.endDate) : event.endDate,
            },
        });

        return NextResponse.json(updatedEvent);
    } catch (error) {
        console.error("UPDATE_EVENT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// DELETE - Delete an association event
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; eventId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { eventId } = await params;

        // Verify event exists and user is owner
        const event = await prisma.associationEvent.findUnique({
            where: { id: eventId },
            include: { association: true },
        });

        if (!event || event.association.ownerId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Delete event
        await prisma.associationEvent.delete({
            where: { id: eventId },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("DELETE_EVENT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
