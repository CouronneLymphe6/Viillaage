import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { eventId, status } = body;

        if (!eventId || !status) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Upsert RSVP (create or update)
        const rsvp = await prisma.eventRSVP.upsert({
            where: {
                eventId_userId: {
                    eventId,
                    userId: session.user.id,
                },
            },
            update: {
                status,
            },
            create: {
                eventId,
                userId: session.user.id,
                status,
            },
        });

        return NextResponse.json(rsvp);
    } catch (error) {
        console.error("RSVP_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
