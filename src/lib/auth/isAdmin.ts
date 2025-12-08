import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function isAdmin(): Promise<boolean> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return false;
    }

    // Check against environment variable
    if (process.env.ADMIN_EMAIL && session.user.email === process.env.ADMIN_EMAIL) {
        return true;
    }

    // Check role in database
    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true }
        });

        return user?.role === 'ADMIN';
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

export async function requireAdmin() {
    const admin = await isAdmin();
    if (!admin) {
        throw new Error('Unauthorized: Admin access required');
    }
}
