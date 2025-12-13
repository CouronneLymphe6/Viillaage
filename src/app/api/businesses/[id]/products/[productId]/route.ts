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

        // Vérifier que le produit existe et appartient au business de l'utilisateur
        const product = await prisma.proProduct.findUnique({
            where: { id: productId },
            include: { business: true },
        });

        // DEBUG: Log pour identifier le problème
        console.log('🔍 PATCH Product Debug:', {
            productId,
            productFound: !!product,
            businessFound: !!product?.business,
            productOwnerId: product?.business?.ownerId,
            sessionUserId: session.user.id,
            match: product?.business?.ownerId === session.user.id
        });

        if (!product) {
            return new NextResponse("Product not found", { status: 404 });
        }

        if (!product.business) {
            console.error('❌ Product has no associated business!', { productId });
            return new NextResponse("Product has no business association", { status: 500 });
        }

        if (product.business.ownerId !== session.user.id) {
            console.error('❌ Ownership mismatch:', {
                ownerId: product.business.ownerId,
                userId: session.user.id
            });
            return new NextResponse("Forbidden - You don't own this business", { status: 403 });
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

        // Vérifier que le produit existe et appartient au business de l'utilisateur
        const product = await prisma.proProduct.findUnique({
            where: { id: productId },
            include: { business: true },
        });

        // DEBUG: Log pour identifier le problème
        console.log('🔍 DELETE Product Debug:', {
            productId,
            productFound: !!product,
            businessFound: !!product?.business,
            productOwnerId: product?.business?.ownerId,
            sessionUserId: session.user.id,
            match: product?.business?.ownerId === session.user.id
        });

        if (!product) {
            return new NextResponse("Product not found", { status: 404 });
        }

        if (!product.business) {
            console.error('❌ Product has no associated business!', { productId });
            return new NextResponse("Product has no business association", { status: 500 });
        }

        if (product.business.ownerId !== session.user.id) {
            console.error('❌ Ownership mismatch:', {
                ownerId: product.business.ownerId,
                userId: session.user.id
            });
            return new NextResponse("Forbidden - You don't own this business", { status: 403 });
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
