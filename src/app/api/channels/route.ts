import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const channels = await prisma.channel.findMany({
            orderBy: { createdAt: 'asc' },
        });
        return NextResponse.json(channels);
    } catch (error) {
        console.error("GET_CHANNELS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
