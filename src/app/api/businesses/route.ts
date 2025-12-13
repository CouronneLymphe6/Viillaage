import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyVillageUsers } from "@/lib/notificationHelper";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // If no session or no village, return empty array
        if (!session?.user?.villageId) {
            return NextResponse.json([]);
        }

        const businesses = await prisma.business.findMany({
            where: {
                owner: {
                    villageId: session.user.villageId, // Filter by village
                },
            },
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });

        // Aggressive caching - 60 seconds cache
        return NextResponse.json(businesses, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
            },
        });
    } catch (error) {
        console.error("GET_BUSINESSES_ERROR", error);
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
        const { name, description, category, address, phone, email, website, type, photos } = body;

        if (!name || !description || !category) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const business = await prisma.business.create({
            data: {
                name,
                description,
                category,
                type: type || "MERCHANT", // Default to MERCHANT if not provided
                status: "ACTIVE",
                address: address || null,
                phone: phone || null,
                email: email || null,
                website: website || null,
                photos: photos || "[]",
                ownerId: session.user.id,
            },
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Respond immediately
        const response = NextResponse.json(business);

        // Send notifications in background (fire-and-forget)
        (async () => {
            try {
                const user = await prisma.user.findUnique({
                    where: { id: session.user.id },
                    select: { villageId: true },
                });

                if (user?.villageId) {
                    await notifyVillageUsers({
                        villageId: user.villageId,
                        excludeUserId: session.user.id,
                        type: 'BUSINESS',
                        title: '🏪 Nouveau commerce',
                        message: `${name} - ${description.substring(0, 80)}${description.length > 80 ? '...' : ''}`,
                        link: '/village',
                    });
                }
            } catch (err) {
                console.error('Notification error:', err);
            }
        })();

        return response;
    } catch (error) {
        console.error("CREATE_BUSINESS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
