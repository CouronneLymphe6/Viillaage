import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/isAdmin';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        // Check admin permission
        await requireAdmin();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Build filter
        const where = status ? { status: status.toUpperCase() as any } : {};

        // Get messages
        const [messages, total] = await Promise.all([
            prisma.contactMessage.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.contactMessage.count({ where })
        ]);

        return NextResponse.json({
            messages,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        if (error.message === 'Unauthorized: Admin access required') {
            return NextResponse.json(
                { error: 'Accès non autorisé' },
                { status: 403 }
            );
        }
        console.error('Error fetching contact messages:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        await requireAdmin();

        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json(
                { error: 'ID et statut requis' },
                { status: 400 }
            );
        }

        const updatedMessage = await prisma.contactMessage.update({
            where: { id },
            data: { status: status.toUpperCase() }
        });

        return NextResponse.json(updatedMessage);

    } catch (error: any) {
        if (error.message === 'Unauthorized: Admin access required') {
            return NextResponse.json(
                { error: 'Accès non autorisé' },
                { status: 403 }
            );
        }
        console.error('Error updating contact message:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        await requireAdmin();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID requis' },
                { status: 400 }
            );
        }

        await prisma.contactMessage.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        if (error.message === 'Unauthorized: Admin access required') {
            return NextResponse.json(
                { error: 'Accès non autorisé' },
                { status: 403 }
            );
        }
        console.error('Error deleting contact message:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
