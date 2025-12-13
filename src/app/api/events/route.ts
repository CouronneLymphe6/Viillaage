import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // If no session or no village, return empty array
        if (!session?.user?.villageId) {
            return NextResponse.json([]);
        }

        const events = await prisma.event.findMany({
            where: {
                organizer: {
                    villageId: session.user.villageId,
                },
                date: {
                    gte: new Date(), // PWA: Only future events
                },
            },
            include: {
                organizer: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                rsvps: {
                    include: {
                        user: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: { date: 'asc' },
            take: 50, // PWA: Limit to 50 events
        });

        return NextResponse.json(events, {
            headers: {
                'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
            },
        });
    } catch (error) {
        console.error("GET_EVENTS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { title, description, date, location } = body;

        if (!title || !description || !date) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const event = await prisma.event.create({
            data: {
                title,
                description,
                date: new Date(date),
                location: location || null,
                organizerId: session.user.id,
            },
            include: {
                organizer: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(event);
    } catch (error) {
        console.error("CREATE_EVENT_ERROR", error);
        return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 });
    }
}
