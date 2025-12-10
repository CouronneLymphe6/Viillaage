import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/villages - Get all active villages (public, no auth required)
export async function GET() {
    try {
        const villages = await prisma.village.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                name: 'asc',
            },
            select: {
                id: true,
                name: true,
                postalCode: true,
                region: true,
            },
        });

        return NextResponse.json(villages);
    } catch (error) {
        console.error('Error fetching villages:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
