import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: "Token et mot de passe requis" },
                { status: 400 }
            );
        }

        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json(
                { error: "Le mot de passe doit contenir au moins 8 caractères" },
                { status: 400 }
            );
        }

        // Find valid token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!resetToken) {
            return NextResponse.json(
                { error: "Token invalide ou expiré" },
                { status: 400 }
            );
        }

        // Check if token is expired
        if (resetToken.expiresAt < new Date()) {
            await prisma.passwordResetToken.delete({
                where: { id: resetToken.id },
            });
            return NextResponse.json(
                { error: "Token expiré" },
                { status: 400 }
            );
        }

        // Check if token was already used
        if (resetToken.used) {
            return NextResponse.json(
                { error: "Token déjà utilisé" },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update user password
        await prisma.user.update({
            where: { id: resetToken.userId },
            data: { password: hashedPassword },
        });

        // Mark token as used
        await prisma.passwordResetToken.update({
            where: { id: resetToken.id },
            data: { used: true },
        });

        return NextResponse.json({
            message: "Mot de passe réinitialisé avec succès",
        });
    } catch (error) {
        console.error("RESET_PASSWORD_ERROR:", error);
        return NextResponse.json(
            { error: "Erreur lors de la réinitialisation du mot de passe" },
            { status: 500 }
        );
    }
}
