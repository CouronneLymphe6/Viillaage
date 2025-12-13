import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/associations - Get all associations
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // If no session or no village, return empty array
        if (!session?.user?.villageId) {
            return NextResponse.json([]);
        }

        const associations = await prisma.association.findMany({
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
            orderBy: {
                createdAt: 'desc',
            },
            take: 50, // PWA: Limit results
        });

        return NextResponse.json(associations, {
            headers: {
                'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
            },
        });
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// POST /api/associations - Create a new association
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { name, description, category, president, email, phone, website, photoUrl } = body;

        if (!name || !description || !category) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const association = await prisma.association.create({
            data: {
                name,
                description,
                category,
                president: president || null,
                email: email || null,
                phone: phone || null,
                website: website || null,
                photoUrl: photoUrl || null,
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

        return NextResponse.json(association);
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
