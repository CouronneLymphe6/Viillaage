import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, image, villageName, zipCode } = body;

        const user = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                name,
                image,
                profile: {
                    upsert: {
                        create: {
                            villageName,
                            zipCode,
                        },
                        update: {
                            villageName,
                            zipCode,
                        },
                    },
                },
            },
        });

        console.log('Profile updated successfully:', user);
        return NextResponse.json(user);
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Error updating profile', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await prisma.user.delete({
            where: { email: session.user.email },
        });

        return NextResponse.json({ message: 'Account deleted' });
    } catch (error) {
        console.error('Error deleting account:', error);
        return NextResponse.json({ error: 'Error deleting account' }, { status: 500 });
    }
}
