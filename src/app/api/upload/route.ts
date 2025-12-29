import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Allowed MIME types and their magic numbers (file signatures)
const ALLOWED_FILE_TYPES = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/webp': [0x52, 0x49, 0x46, 0x46],
    'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
} as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (pour supporter les PDF multi-pages)

/**
 * Verify file type by checking magic numbers (file signature)
 */
function verifyFileType(buffer: Buffer, mimeType: string): boolean {
    const allowedType = ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES];
    if (!allowedType) return false;

    // Check if file starts with the expected magic number
    for (let i = 0; i < allowedType.length; i++) {
        if (buffer[i] !== allowedType[i]) {
            return false;
        }
    }
    return true;
}

/**
 * Generate secure random filename
 */
function generateSecureFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';

    // Only allow safe extensions
    const safeExtension = ['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(extension) ? extension : 'jpg';

    return `${timestamp}-${randomString}.${safeExtension}`;
}

export async function POST(request: NextRequest) {
    try {
        // 1. Verify Cloudinary Configuration
        if (!process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET) {
            console.error("UPLOAD_ERROR: Cloudinary Not Configured");
            return NextResponse.json(
                { error: "Upload service not configured" },
                { status: 500 }
            );
        }

        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` },
                { status: 400 }
            );
        }

        // Validate MIME type
        if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
            return NextResponse.json(
                { error: "Only images (JPEG, PNG, WebP) and PDF files are allowed" },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Verify actual file type by checking magic numbers
        if (!verifyFileType(buffer, file.type)) {
            return NextResponse.json(
                { error: "Invalid file type detected" },
                { status: 400 }
            );
        }

        // Generate secure filename
        const filename = generateSecureFilename(file.name);

        // Determine resource type for Cloudinary
        const isPDF = file.type === 'application/pdf';
        const resourceType = isPDF ? 'raw' : 'image';

        // Upload to Cloudinary
        const base64File = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64File}`;

        const uploadResponse = await cloudinary.uploader.upload(dataURI, {
            folder: 'viillaage',
            public_id: filename.split('.')[0], // Remove extension
            resource_type: resourceType,
        });

        const publicUrl = uploadResponse.secure_url;

        // Return URL and file type
        return NextResponse.json({
            url: publicUrl,
            type: isPDF ? 'PDF' : 'IMAGE'
        });
    } catch (error) {
        console.error("UPLOAD_ERROR - Full details:", {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            error: error
        });

        return NextResponse.json(
            { error: "Internal Error", details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}
