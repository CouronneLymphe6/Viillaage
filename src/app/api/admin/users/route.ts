import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/isAdmin';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        await requireAdmin();

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                village: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ users });

    } catch (error: any) {
        if (error.message === 'Unauthorized: Admin access required') {
            return NextResponse.json(
                { error: 'Accès non autorisé' },
                { status: 403 }
            );
        }
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
