import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, subject, message } = body;

        // Validation
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'Tous les champs sont requis' },
                { status: 400 }
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Email invalide' },
                { status: 400 }
            );
        }

        // Create contact message
        const contactMessage = await prisma.contactMessage.create({
            data: {
                name,
                email,
                subject,
                message,
                status: 'NEW'
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Message envoyé avec succès',
                id: contactMessage.id
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error creating contact message:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'envoi du message' },
            { status: 500 }
        );
    }
}
