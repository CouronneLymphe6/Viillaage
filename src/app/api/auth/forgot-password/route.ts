import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email requis" },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({
                message: "Si cet email existe, un lien de réinitialisation a été envoyé.",
            });
        }

        // Generate secure token
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Delete old tokens for this user
        await prisma.passwordResetToken.deleteMany({
            where: { userId: user.id },
        });

        // Create new token
        await prisma.passwordResetToken.create({
            data: {
                token,
                userId: user.id,
                expiresAt,
            },
        });

        // Send email with reset link
        const resetLink = `${process.env.NEXTAUTH_URL || 'https://viillaage.com'}/reset-password/${token}`;

        // Try to send email if RESEND_API_KEY is configured
        if (process.env.RESEND_API_KEY) {
            const { sendPasswordResetEmail } = await import('@/lib/email');
            await sendPasswordResetEmail({
                to: user.email,
                resetLink,
                userName: user.name || undefined,
            });
        } else {
            // Fallback: log to console for development
            console.log(`Password reset link for ${email}: ${resetLink}`);
        }

        return NextResponse.json({
            message: "Si cet email existe, un lien de réinitialisation a été envoyé.",
        });
    } catch (error) {
        console.error("FORGOT_PASSWORD_ERROR:", error);
        return NextResponse.json(
            { error: "Erreur lors de la demande de réinitialisation" },
            { status: 500 }
        );
    }
}
