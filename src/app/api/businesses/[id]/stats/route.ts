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

        // Handle possibility of empty body
        let body;
        try {
            body = await request.json();
        } catch (jsonError) {
            // If invalid JSON, valid case might be just a ping? No, POST implies action.
            // But for stats, maybe we just want to ensure it doesn't crash.
            console.warn("STATS_POST_JSON_ERROR", jsonError);
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { type } = body || {};

        if (!type) {
            return NextResponse.json({ error: "Missing stat type" }, { status: 400 });
        }

        // Mettre à jour ou créer les stats
        const updateData: any = {};

        if (type === 'view') {
            updateData.viewCount = { increment: 1 };
        } else if (type === 'catalogView') {
            updateData.catalogViewCount = { increment: 1 };
        } else {
            return NextResponse.json({ error: "Invalid stat type" }, { status: 400 });
        }

        try {
            await prisma.proStats.upsert({
                where: { businessId: id },
                update: updateData,
                create: {
                    businessId: id,
                    ...updateData,
                },
            });

            return NextResponse.json({ success: true });
        } catch (dbError) {
            console.error("STATS_UPSERT_ERROR:", dbError);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

    } catch (error) {
        console.error("INCREMENT_STATS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
