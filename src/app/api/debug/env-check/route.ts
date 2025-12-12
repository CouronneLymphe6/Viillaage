import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Diagnostic endpoint to check environment variables
 * Access: /api/debug/env-check
 * Only accessible to authenticated admins
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check which environment variables are defined
        const envCheck = {
            cloudinary: {
                cloudName: {
                    defined: !!process.env.CLOUDINARY_CLOUD_NAME,
                    length: process.env.CLOUDINARY_CLOUD_NAME?.length || 0,
                    prefix: process.env.CLOUDINARY_CLOUD_NAME?.substring(0, 3) || 'N/A'
                },
                apiKey: {
                    defined: !!process.env.CLOUDINARY_API_KEY,
                    length: process.env.CLOUDINARY_API_KEY?.length || 0,
                    prefix: process.env.CLOUDINARY_API_KEY?.substring(0, 3) || 'N/A'
                },
                apiSecret: {
                    defined: !!process.env.CLOUDINARY_API_SECRET,
                    length: process.env.CLOUDINARY_API_SECRET?.length || 0,
                    prefix: process.env.CLOUDINARY_API_SECRET?.substring(0, 3) || 'N/A'
                }
            },
            other: {
                databaseUrl: !!process.env.DATABASE_URL,
                geminiApiKey: !!process.env.GEMINI_API_KEY,
                nextauthSecret: !!process.env.NEXTAUTH_SECRET,
            },
            nodeEnv: process.env.NODE_ENV,
            vercelEnv: process.env.VERCEL_ENV,
        };

        return NextResponse.json({
            success: true,
            check: envCheck,
            allCloudinaryVarsPresent:
                !!process.env.CLOUDINARY_CLOUD_NAME &&
                !!process.env.CLOUDINARY_API_KEY &&
                !!process.env.CLOUDINARY_API_SECRET
        });
    } catch (error) {
        console.error('ENV_CHECK_ERROR:', error);
        return NextResponse.json(
            { error: 'Internal error', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}
