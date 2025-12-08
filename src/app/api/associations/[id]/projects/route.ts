import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer les projets d'une association
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const projects = await prisma.associationProject.findMany({
            where: {
                associationId: id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(projects);
    } catch (error) {
        console.error("GET_ASSOCIATION_PROJECTS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST - Créer un projet
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { title, description, status, photo, startDate } = body;

        // Vérifier que l'utilisateur est le propriétaire
        const association = await prisma.association.findUnique({
            where: { id },
        });

        if (!association) {
            return new NextResponse("Association not found", { status: 404 });
        }

        if (association.ownerId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const project = await prisma.associationProject.create({
            data: {
                associationId: id,
                title,
                description,
                status: status || 'PLANNED',
                photo: photo || null,
                startDate: startDate ? new Date(startDate) : null,
            },
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error("POST_ASSOCIATION_PROJECT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
