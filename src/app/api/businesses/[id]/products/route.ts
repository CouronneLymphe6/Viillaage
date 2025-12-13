import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer le catalogue de produits/services d'un Pro
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const products = await prisma.proProduct.findMany({
            where: {
                businessId: id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 100, // PWA: Limit catalogue
        });

        return NextResponse.json(products, {
            headers: {
                'Cache-Control': 'private, max-age=120, stale-while-revalidate=240',
            },
        });
    } catch (error) {
        console.error("GET_PRODUCTS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST - Ajouter un produit/service (owner only)
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
        const { name, description, price, photos, stock, isAvailable, tags } = body;

        // Vérifier que l'utilisateur est le propriétaire du business
        const business = await prisma.business.findUnique({
            where: { id },
        });

        if (!business || business.ownerId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Créer le produit
        const product = await prisma.proProduct.create({
            data: {
                businessId: id,
                name,
                description,
                price: price ? parseFloat(price) : null,
                photos: photos || "[]",
                stock: stock ? parseInt(stock) : null,
                isAvailable: isAvailable !== undefined ? isAvailable : true,
                tags: tags || "[]",
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("CREATE_PRODUCT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// Augmenter la limite de taille du body pour les photos de produits
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};
