import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

        const listing = await prisma.listing.findUnique({
            where: { id },
        });

        if (!listing) {
            return new NextResponse("Listing not found", { status: 404 });
        }

        if (listing.userId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        await prisma.listing.delete({
            where: { id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("DELETE_LISTING_ERROR", error);
        return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 });
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

        const listing = await prisma.listing.findUnique({
            where: { id },
        });

        if (!listing) {
            return new NextResponse("Listing not found", { status: 404 });
        }

        if (listing.userId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const body = await request.json();
        const { title, description, price, category, photos } = body;

        const updated = await prisma.listing.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(price !== undefined && { price: price ? parseFloat(price) : null }),
                ...(category && { category }),
                ...(photos !== undefined && { photos: JSON.stringify(photos.slice(0, 3)) }), // Store as JSON
            },
        });

        return NextResponse.json({
            ...updated,
            photos: JSON.parse(updated.photos),
        });
    } catch (error) {
        console.error("UPDATE_LISTING_ERROR", error);
        return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 });
    }
}
