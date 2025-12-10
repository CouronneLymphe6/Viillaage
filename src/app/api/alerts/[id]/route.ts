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

        const alert = await prisma.alert.findUnique({
            where: { id },
        });

        if (!alert) {
            return new NextResponse("Alert not found", { status: 404 });
        }

        const isAdmin = (session.user as any).role === 'ADMIN';

        if (alert.userId !== session.user.id && !isAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        await prisma.alert.delete({
            where: { id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("DELETE_ALERT_ERROR", error);
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

        const alert = await prisma.alert.findUnique({
            where: { id },
        });

        if (!alert) {
            return new NextResponse("Alert not found", { status: 404 });
        }

        const isAdmin = (session.user as any).role === 'ADMIN';

        if (alert.userId !== session.user.id && !isAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const body = await request.json();
        const { type, description, photoUrl } = body;

        const updated = await prisma.alert.update({
            where: { id },
            data: {
                ...(type && { type }),
                ...(description && { description }),
                ...(photoUrl !== undefined && { photoUrl }),
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("UPDATE_ALERT_ERROR", error);
        return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 });
    }
}
