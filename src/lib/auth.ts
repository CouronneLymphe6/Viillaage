import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { logAuthEvent, AuditEventType } from "@/lib/security/audit-logger";

// Track failed login attempts in memory (for production, use Redis)
const failedAttempts = new Map<string, { count: number; lockedUntil?: number }>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function isAccountLocked(email: string): boolean {
    const attempt = failedAttempts.get(email);
    if (!attempt?.lockedUntil) return false;

    if (Date.now() < attempt.lockedUntil) {
        return true;
    }

    // Lockout expired, reset
    failedAttempts.delete(email);
    return false;
}

function recordFailedAttempt(email: string): void {
    const attempt = failedAttempts.get(email) || { count: 0 };
    attempt.count++;

    if (attempt.count >= MAX_FAILED_ATTEMPTS) {
        attempt.lockedUntil = Date.now() + LOCKOUT_DURATION;
    }

    failedAttempts.set(email, attempt);
}

function resetFailedAttempts(email: string): void {
    failedAttempts.delete(email);
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    await logAuthEvent(
                        AuditEventType.LOGIN_FAILURE,
                        credentials?.email || 'unknown',
                        false,
                        undefined,
                        'Missing credentials'
                    );
                    return null;
                }

                const email = credentials.email.toLowerCase().trim();

                // Check if account is locked
                if (isAccountLocked(email)) {
                    await logAuthEvent(
                        AuditEventType.LOGIN_FAILURE,
                        email,
                        false,
                        undefined,
                        'Account locked due to too many failed attempts'
                    );
                    throw new Error('Compte temporairement verrouillé. Réessayez dans 15 minutes.');
                }

                const user = await prisma.user.findUnique({
                    where: { email }
                });

                if (!user) {
                    recordFailedAttempt(email);
                    await logAuthEvent(
                        AuditEventType.LOGIN_FAILURE,
                        email,
                        false,
                        undefined,
                        'User not found'
                    );
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    recordFailedAttempt(email);
                    await logAuthEvent(
                        AuditEventType.LOGIN_FAILURE,
                        email,
                        false,
                        undefined,
                        'Invalid password'
                    );
                    return null;
                }

                // Successful login - reset failed attempts
                resetFailedAttempts(email);
                await logAuthEvent(
                    AuditEventType.LOGIN_SUCCESS,
                    email,
                    true
                );

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    villageId: user.villageId || undefined,
                } as any;
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;

                // Fetch fresh data from database to ensure profile updates are reflected immediately
                const freshUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    include: { profile: true }
                });

                if (freshUser) {
                    session.user.name = freshUser.name;
                    session.user.image = freshUser.image;
                    (session.user as any).profile = freshUser.profile;
                    (session.user as any).villageId = freshUser.villageId;
                }
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.villageId = (user as any).villageId;
            }
            return token;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
    },
    secret: process.env.NEXTAUTH_SECRET,
};
