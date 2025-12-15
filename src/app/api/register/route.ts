import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, RATE_LIMITS } from "@/lib/security/rate-limiter";
import { registerSchema, sanitizeString } from "@/lib/security/input-validator";
import { sanitizeText } from "@/lib/security/xss-protection";
import { logAuthEvent, logSecurityViolation, getIpAddress, AuditEventType } from "@/lib/security/audit-logger";

export async function POST(request: NextRequest) {
    const ipAddress = getIpAddress(request.headers);

    try {
        // Rate limiting - 3 registrations per hour per IP
        const rateLimitResponse = await checkRateLimit(
            request,
            RATE_LIMITS.REGISTER
        );

        if (rateLimitResponse) {
            await logSecurityViolation(
                AuditEventType.RATE_LIMIT_EXCEEDED,
                undefined,
                ipAddress,
                { endpoint: '/api/register' }
            );
            return rateLimitResponse;
        }

        const body = await request.json();

        // Validate and sanitize input
        const validation = registerSchema.safeParse(body);

        if (!validation.success) {
            await logSecurityViolation(
                AuditEventType.INVALID_INPUT,
                undefined,
                ipAddress,
                {
                    endpoint: '/api/register',
                    errors: validation.error.issues
                }
            );

            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { email, name, password, villageId } = validation.data;
        const { acceptCGU, acceptPrivacy, acceptConstitution } = body;

        // Sanitize text inputs
        const sanitizedName = sanitizeText(name);
        const sanitizedEmail = email.toLowerCase().trim();

        // Validation de l'acceptation des CGU, Privacy et Constitution
        if (!acceptCGU || !acceptPrivacy || !acceptConstitution) {
            return NextResponse.json(
                { error: "Vous devez accepter les CGU, la Politique de confidentialité et la Constitution de Viillaage" },
                { status: 400 }
            );
        }

        // Validation du village (if provided)
        if (villageId) {
            const village = await prisma.village.findUnique({
                where: { id: villageId },
            });

            if (!village || !village.isActive) {
                return NextResponse.json(
                    { error: "Village invalide ou inactif" },
                    { status: 400 }
                );
            }
        }

        // Vérifier si l'email existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email: sanitizedEmail },
        });

        if (existingUser) {
            await logAuthEvent(
                AuditEventType.REGISTER,
                sanitizedEmail,
                false,
                ipAddress,
                'Email already exists'
            );

            return NextResponse.json(
                { error: "Cet email est déjà utilisé" },
                { status: 409 }
            );
        }

        // Hash du mot de passe avec bcrypt (cost factor 12)
        const hashedPassword = await bcrypt.hash(password, 12);

        // Création de l'utilisateur
        const user = await prisma.user.create({
            data: {
                email: sanitizedEmail,
                name: sanitizedName,
                password: hashedPassword,
                villageId: villageId || null,
                acceptedCGU: true,
                acceptedPrivacy: true,
                acceptedConstitution: true,
                cguAcceptedAt: new Date(),
                privacyAcceptedAt: new Date(),
                constitutionAcceptedAt: new Date(),
            },
            select: {
                id: true,
                email: true,
                name: true,
                village: {
                    select: {
                        name: true,
                        postalCode: true,
                    },
                },
            },
        });

        // Log successful registration
        await logAuthEvent(
            AuditEventType.REGISTER,
            sanitizedEmail,
            true,
            ipAddress
        );

        return NextResponse.json(user);
    } catch (error: any) {
        console.error('REGISTRATION_ERROR:', error);

        await logAuthEvent(
            AuditEventType.REGISTER,
            'unknown',
            false,
            ipAddress,
            error.message
        );

        return NextResponse.json(
            { error: "Erreur lors de l'inscription" },
            { status: 500 }
        );
    }
}
