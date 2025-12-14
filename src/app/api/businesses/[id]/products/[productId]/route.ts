import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH - Modifier un produit (owner only)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string; productId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { productId } = await params;
        const body = await request.json();
        const { name, description, price, photos, stock, isAvailable, tags } = body;

        // OPTIMIZED: Use select instead of include (faster)
        const product = await prisma.proProduct.findUnique({
            where: { id: productId },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                photos: true,
                stock: true,
                isAvailable: true,
                tags: true,
                business: {
                    select: { ownerId: true }
                }
            },
        });

        if (!product) {
            return new NextResponse("Product not found", { status: 404 });
        }

        if (product.business.ownerId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Mettre à jour le produit
        const updatedProduct = await prisma.proProduct.update({
            where: { id: productId },
            data: {
                name: name || product.name,
                description: description || product.description,
                price: price !== undefined ? (price ? parseFloat(price) : null) : product.price,
                photos: photos !== undefined ? photos : product.photos,
                stock: stock !== undefined ? (stock ? parseInt(stock) : null) : product.stock,
                isAvailable: isAvailable !== undefined ? isAvailable : product.isAvailable,
                tags: tags !== undefined ? tags : product.tags,
            },
        });

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error("UPDATE_PRODUCT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// DELETE - Supprimer un produit (owner only)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; productId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { productId } = await params;

        // OPTIMIZED: Use select instead of include (faster)
        const product = await prisma.proProduct.findUnique({
            where: { id: productId },
            select: {
                id: true,
                business: {
                    select: { ownerId: true }
                }
            },
        });

        if (!product) {
            return new NextResponse("Product not found", { status: 404 });
        }

        if (product.business.ownerId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Supprimer le produit
        await prisma.proProduct.delete({
            where: { id: productId },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("DELETE_PRODUCT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
