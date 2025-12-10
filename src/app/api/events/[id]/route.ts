import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

        const event = await prisma.event.findUnique({
            where: { id },
        });

        if (!event) {
            return new NextResponse("Event not found", { status: 404 });
        }

        const isAdmin = (session.user as any).role === 'ADMIN';

        if (event.organizerId !== session.user.id && !isAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        await prisma.event.delete({
            where: { id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("DELETE_EVENT_ERROR", error);
        return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 });
    }
}

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

        const event = await prisma.event.findUnique({
            where: { id },
        });

        if (!event) {
            return new NextResponse("Event not found", { status: 404 });
        }

        const isAdmin = (session.user as any).role === 'ADMIN';

        if (event.organizerId !== session.user.id && !isAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const body = await request.json();
        const { title, description, date, location, photoUrl } = body;

        const updated = await prisma.event.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(date && { date: new Date(date) }),
                ...(location !== undefined && { location }),
                ...(photoUrl !== undefined && { photoUrl }),
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("UPDATE_EVENT_ERROR", error);
        return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 });
    }
}
