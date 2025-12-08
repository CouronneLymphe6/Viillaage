import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer les projets d'un Pro
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const projects = await prisma.proProject.findMany({
            where: {
                businessId: id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(projects);
    } catch (error) {
        console.error("GET_PROJECTS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST - Créer un projet (owner only)
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
        const { title, description, photo, status, startDate } = body;

        // Vérifier que l'utilisateur est le propriétaire du business
        const business = await prisma.business.findUnique({
            where: { id },
        });

        if (!business || business.ownerId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Créer le projet
        const project = await prisma.proProject.create({
            data: {
                businessId: id,
                title,
                description,
                photo,
                status: status || "PLANNED",
                startDate: startDate ? new Date(startDate) : null,
            },
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error("CREATE_PROJECT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
