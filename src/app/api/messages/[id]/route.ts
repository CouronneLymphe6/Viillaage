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

        const message = await prisma.message.findUnique({
            where: { id },
        });

        if (!message) {
            return new NextResponse("Message not found", { status: 404 });
        }

        const isAdmin = (session.user as any).role === 'ADMIN';

        if (message.userId !== session.user.id && !isAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        await prisma.message.delete({
            where: { id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("DELETE_MESSAGE_ERROR", error);
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

        const body = await request.json();
        const { content } = body;

        if (!content) {
            return new NextResponse("Missing content", { status: 400 });
        }

        const { id } = await params;

        const message = await prisma.message.findUnique({
            where: { id },
        });

        if (!message) {
            return new NextResponse("Message not found", { status: 404 });
        }

        const isAdmin = (session.user as any).role === 'ADMIN';

        if (message.userId !== session.user.id && !isAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const updatedMessage = await prisma.message.update({
            where: { id },
            data: {
                content,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(updatedMessage);
    } catch (error) {
        console.error("UPDATE_MESSAGE_ERROR", error);
        return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 });
    }
}
