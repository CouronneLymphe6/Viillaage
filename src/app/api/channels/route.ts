import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        let channels = await prisma.channel.findMany({
            orderBy: { createdAt: 'asc' },
        });

        // ----------------------------------------------------------------------
        // SELF-HEALING / ALIGNMENT LOGIC
        // We ensure the DB state matches the desired Vercel/Production configuration.
        // This runs on read to fix any environments (local or prod) lazily.
        // ----------------------------------------------------------------------

        const updates = [];

        // 1. Rename "Annonces" to "Alertes et Sécurité" if it exists
        const annoncesChannel = channels.find(c => c.name === 'Annonces');
        if (annoncesChannel) {
            updates.push(
                prisma.channel.update({
                    where: { id: annoncesChannel.id },
                    data: {
                        name: 'Alertes et Sécurité',
                        description: 'Signalements urgents, sûreté du village et vigilance voisins'
                    }
                }).catch(e => console.error("Failed to auto-rename Annonces channel:", e))
            );
        }

        // 2. Rename "Loisir" to "Assos" if it exists
        const loisirChannel = channels.find(c => c.name === 'Loisir' || c.name === 'Loisirs');
        if (loisirChannel) {
            updates.push(
                prisma.channel.update({
                    where: { id: loisirChannel.id },
                    data: {
                        name: 'Assos',
                        description: 'Associations, clubs et activités du village'
                    }
                }).catch(e => console.error("Failed to auto-rename Loisir channel:", e))
            );
        }

        // 3. Create "Ecole" if it doesn't exist
        const hasEcole = channels.some(c => c.name === 'Ecole');
        if (!hasEcole) {
            updates.push(
                prisma.channel.create({
                    data: {
                        name: 'Ecole',
                        description: 'Actualités scolaires, périscolaires et informations parents',
                    }
                }).catch(e => console.error("Failed to auto-create Ecole channel:", e))
            );
        }

        if (updates.length > 0) {
            // Await updates to ensure consistency for the immediate user response
            await Promise.allSettled(updates);

            // Re-fetch to get the clean state (with valid IDs for new/renamed channels)
            channels = await prisma.channel.findMany({
                orderBy: { createdAt: 'asc' },
            });
        }

        return NextResponse.json(channels);
    } catch (error) {
        console.error("GET_CHANNELS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
