import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH - Update an association project
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string; projectId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { projectId } = await params;
        const body = await request.json();

        // Verify project exists and user is owner
        const project = await prisma.associationProject.findUnique({
            where: { id: projectId },
            include: { association: true },
        });

        const isAdmin = (session.user as any).role === 'ADMIN';

        if (!project || (project.association.ownerId !== session.user.id && !isAdmin)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Update project
        const updatedProject = await prisma.associationProject.update({
            where: { id: projectId },
            data: {
                title: body.title || project.title,
                description: body.description || project.description,
                status: body.status || project.status,
                startDate: body.startDate ? new Date(body.startDate) : project.startDate,
                photo: body.photo !== undefined ? body.photo : project.photo,
            },
        });

        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error("UPDATE_PROJECT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// DELETE - Delete an association project
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; projectId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { projectId } = await params;

        // Verify project exists and user is owner
        const project = await prisma.associationProject.findUnique({
            where: { id: projectId },
            include: { association: true },
        });

        const isAdmin = (session.user as any).role === 'ADMIN';

        if (!project || (project.association.ownerId !== session.user.id && !isAdmin)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Delete project
        await prisma.associationProject.delete({
            where: { id: projectId },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("DELETE_PROJECT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
