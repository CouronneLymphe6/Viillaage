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

        const listings = await prisma.listing.findMany({
            where: {
                user: {
                    villageId: session.user.villageId,
                },
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 50, // PWA: Limit results
        });

        // Parse photos JSON for each listing
        const listingsWithPhotos = listings.map(listing => ({
            ...listing,
            photos: JSON.parse(listing.photos || '[]'),
        }));

        return NextResponse.json(listingsWithPhotos, {
            headers: {
                'Cache-Control': 'private, max-age=45, stale-while-revalidate=90',
            },
        });
    } catch (error) {
        console.error("GET_LISTINGS_ERROR", error);
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
        const { title, description, price, category, photos = [] } = body;

        if (!title || !description || !category) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const listing = await prisma.listing.create({
            data: {
                title,
                description,
                price: price ? parseFloat(price) : null,
                category,
                photos: JSON.stringify(photos.slice(0, 3)), // Store as JSON string
                userId: session.user.id,
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

        // Respond immediately
        const response = NextResponse.json({
            ...listing,
            photos: JSON.parse(listing.photos),
        });

        // Send notifications in background (fire-and-forget)
        (async () => {
            try {
                const user = await prisma.user.findUnique({
                    where: { id: session.user.id },
                    select: { villageId: true },
                });

                if (user?.villageId) {
                    const categoryLabels: Record<string, string> = {
                        'SELL': '💰 Vente',
                        'GIVE': '🎁 Don',
                        'EXCHANGE': '🔄 Échange',
                        'LEND': '🤝 Prêt',
                    };

                    await notifyVillageUsers({
                        villageId: user.villageId,
                        excludeUserId: session.user.id,
                        type: 'MARKET',
                        title: `${categoryLabels[category] || '📌'} Nouvelle annonce`,
                        message: `${title} - ${description.substring(0, 80)}${description.length > 80 ? '...' : ''}`,
                        link: '/market',
                    });
                }
            } catch (err) {
                console.error('Notification error:', err);
            }
        })();

        return response;
    } catch (error) {
        console.error("CREATE_LISTING_ERROR", error);
        return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 });
    }
}
