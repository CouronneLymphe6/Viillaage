import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { type } = body; // "CONFIRM" or "REPORT"

        if (!["CONFIRM", "REPORT"].includes(type)) {
            return new NextResponse("Invalid vote type", { status: 400 });
        }

        // Use a transaction to ensure data consistency
        const result = await prisma.$transaction(async (tx) => {
            // Check if alert exists
            const alert = await tx.alert.findUnique({
                where: { id },
            });

            if (!alert) {
                throw new Error("Alert not found");
            }

            // Check if user already voted
            const existingVote = await tx.alertVote.findUnique({
                where: {
                    alertId_userId: {
                        alertId: id,
                        userId: session.user.id,
                    },
                },
            });

            if (existingVote) {
                if (existingVote.type === type) {
                    throw new Error("Already voted this way");
                }

                // If changing vote (e.g. from CONFIRM to REPORT)
                await tx.alertVote.delete({
                    where: { id: existingVote.id }
                });

                // Decrement old count
                if (existingVote.type === "CONFIRM") {
                    await tx.alert.update({ where: { id }, data: { confirmations: { decrement: 1 } } });
                } else {
                    await tx.alert.update({ where: { id }, data: { reports: { decrement: 1 } } });
                }
            }

            // Create new vote
            await tx.alertVote.create({
                data: {
                    alertId: id,
                    userId: session.user.id,
                    type,
                },
            });

            // Update alert counts and status
            let updateData: any = {};

            if (type === "CONFIRM") {
                updateData.confirmations = { increment: 1 };
                updateData.lastConfirmedAt = new Date();
            } else {
                updateData.reports = { increment: 1 };
            }

            const updatedAlert = await tx.alert.update({
                where: { id },
                data: updateData,
            });

            // Auto-resolve logic
            if (updatedAlert.reports > 3 || (updatedAlert.reports > updatedAlert.confirmations + 2)) {
                await tx.alert.update({
                    where: { id },
                    data: { status: "RESOLVED" },
                });
                return { ...updatedAlert, status: "RESOLVED" };
            }

            return updatedAlert;
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("VOTE_ALERT_ERROR", error);
        if (error.message === "Alert not found") {
            return new NextResponse("Alert not found", { status: 404 });
        }
        if (error.message === "Already voted this way") {
            return new NextResponse("Already voted this way", { status: 409 });
        }
        return new NextResponse("Internal Error", { status: 500 });
    }
}
