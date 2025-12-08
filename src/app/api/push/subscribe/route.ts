
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const subscription = await req.json();

        if (!subscription || !subscription.endpoint) {
            return new NextResponse("Invalid subscription", { status: 400 });
        }

        // Save subscription only if it doesn't match an existing one for this user
        // Using upsert or strict create with error handling.
        // Since we have specific fields (p256dh, auth), we need to extract them.
        const { endpoint, keys } = subscription;

        await prisma.pushSubscription.upsert({
            where: {
                userId_endpoint: {
                    userId: session.user.id,
                    endpoint: endpoint,
                }
            },
            update: {
                auth: keys.auth,
                p256dh: keys.p256dh,
            },
            create: {
                userId: session.user.id,
                endpoint: endpoint,
                auth: keys.auth,
                p256dh: keys.p256dh,
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving push subscription:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
