import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer les statistiques (owner only)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        // Vérifier que l'utilisateur est le propriétaire du business
        const business = await prisma.business.findUnique({
            where: { id },
        });

        if (!business || business.ownerId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Récupérer ou créer les stats
        let stats = await prisma.proStats.findUnique({
            where: { businessId: id },
        });

        if (!stats) {
            stats = await prisma.proStats.create({
                data: {
                    businessId: id,
                },
            });
        }

        return NextResponse.json(stats);
    } catch (error) {
        console.error("GET_STATS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST - Incrémenter une statistique
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { type } = body; // "view", "catalogView"

        // Mettre à jour ou créer les stats
        const updateData: any = {};

        if (type === 'view') {
            updateData.viewCount = { increment: 1 };
        } else if (type === 'catalogView') {
            updateData.catalogViewCount = { increment: 1 };
        }

        await prisma.proStats.upsert({
            where: { businessId: id },
            update: updateData,
            create: {
                businessId: id,
                ...updateData,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("INCREMENT_STATS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
