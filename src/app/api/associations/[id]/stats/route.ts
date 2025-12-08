import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Incrémenter les statistiques
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { action } = body;

        // Vérifier si l'association existe
        const association = await prisma.association.findUnique({
            where: { id },
        });

        if (!association) {
            return new NextResponse("Association not found", { status: 404 });
        }

        // Mettre à jour les stats selon l'action
        if (action === 'view') {
            await prisma.associationStats.upsert({
                where: { associationId: id },
                update: {
                    viewCount: {
                        increment: 1,
                    },
                },
                create: {
                    associationId: id,
                    viewCount: 1,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("POST_ASSOCIATION_STATS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
