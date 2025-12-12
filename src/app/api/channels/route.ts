import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const channels = await prisma.channel.findMany({
            orderBy: { createdAt: 'asc' },
        });

        // Compatibility Layer: Force alignment with Vercel/Production state
        // 1. Rename "Annonces" -> "Alertes et Sécurité"
        // 2. Ensure "Ecole" exists

        let processedChannels = channels.map(channel => {
            if (channel.name === 'Annonces') {
                return {
                    ...channel,
                    name: 'Alertes et Sécurité',
                    description: 'Signalements urgents, sûreté du village et vigilance voisins'
                };
            }
            return channel;
        });

        // Check if "Alertes et Sécurité" exists (either renamed or native)
        const hasSecurity = processedChannels.some(c => c.name === 'Alertes et Sécurité');

        // If "Annonces" didn't exist and "Alertes" doesn't exist, we might want to create a fake one?
        // But usually "Annonces" exists in the seed. If not, we leave it be or injecting it might be safer.

        // Check if "Ecole" exists
        const hasEcole = processedChannels.some(c => c.name === 'Ecole');

        if (!hasEcole) {
            processedChannels.push({
                id: 'channel-ecole-placeholder', // Safe placeholder ID
                name: 'Ecole',
                description: 'Actualités scolaires, périscolaires et informations parents',
                createdAt: new Date(),
            } as any);
        }

        return NextResponse.json(processedChannels);
    } catch (error) {
        console.error("GET_CHANNELS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
