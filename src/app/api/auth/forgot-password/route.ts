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

        // TODO: Send email with reset link
        // For now, we'll just log it (you'll need to set up an email service)
        const resetLink = `${process.env.NEXTAUTH_URL || 'https://viillaage.vercel.app'}/reset-password/${token}`;
        console.log(`Password reset link for ${email}: ${resetLink}`);

        // In production, you would send an email here using Resend, SendGrid, etc.
        // Example with Resend:
        // await resend.emails.send({
        //   from: 'noreply@viillaage.app',
        //   to: email,
        //   subject: 'Réinitialisation de votre mot de passe',
        //   html: `<p>Cliquez sur ce lien pour réinitialiser votre mot de passe: <a href="${resetLink}">${resetLink}</a></p>`
        // });

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
