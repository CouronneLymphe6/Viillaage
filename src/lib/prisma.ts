import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        // Connection pooling optimization for Vercel
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });

// Configure connection pool
prisma.$connect();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Export db as alias for backwards compatibility
export const db = prisma;

