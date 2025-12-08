import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { messageId, emoji } = body;

        if (!messageId || !emoji) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Check if reaction already exists
        const existingReaction = await prisma.reaction.findUnique({
            where: {
                messageId_userId_emoji: {
                    messageId,
                    userId: session.user.id,
                    emoji,
                }
            }
        });

        if (existingReaction) {
            // Remove reaction (toggle off)
            await prisma.reaction.delete({
                where: { id: existingReaction.id }
            });
            return NextResponse.json({ action: 'removed' });
        } else {
            // Add reaction (toggle on)
            const reaction = await prisma.reaction.create({
                data: {
                    messageId,
                    userId: session.user.id,
                    emoji,
                }
            });
            return NextResponse.json({ action: 'added', reaction });
        }

    } catch (error) {
        console.error("REACTION_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
