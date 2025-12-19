import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer un business spécifique
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const business = await prisma.business.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!business) {
            return new NextResponse("Business not found", { status: 404 });
        }

        return NextResponse.json(business);
    } catch (error) {
        console.error("GET_BUSINESS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
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
        const { name, description, category, address, phone, email, website, photos } = body;

        // Check if the business exists and belongs to the user
        const existingBusiness = await prisma.business.findUnique({
            where: { id },
        });

        if (!existingBusiness) {
            return new NextResponse("Business not found", { status: 404 });
        }

        const isAdmin = (session.user as any).role === 'ADMIN';

        if (existingBusiness.ownerId !== session.user.id && !isAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const business = await prisma.business.update({
            where: { id },
            data: {
                name: name || existingBusiness.name,
                description: description || existingBusiness.description,
                category: category || existingBusiness.category,
                address: address !== undefined ? address : existingBusiness.address,
                phone: phone !== undefined ? phone : existingBusiness.phone,
                email: email !== undefined ? email : existingBusiness.email,
                website: website !== undefined ? website : existingBusiness.website,
                photos: photos !== undefined ? photos : existingBusiness.photos,
            },
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(business);
    } catch (error) {
        console.error("UPDATE_BUSINESS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        // Check if the business exists and belongs to the user
        const existingBusiness = await prisma.business.findUnique({
            where: { id },
        });

        if (!existingBusiness) {
            return new NextResponse("Business not found", { status: 404 });
        }

        const isAdmin = (session.user as any).role === 'ADMIN';

        if (existingBusiness.ownerId !== session.user.id && !isAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        await prisma.business.delete({
            where: { id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("DELETE_BUSINESS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
