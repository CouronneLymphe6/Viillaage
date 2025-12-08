import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const channelId = 'cmiingpxc0000k0tgfb54knry';
    console.log(`Testing query for channelId: ${channelId}`);

    try {
        const messages = await prisma.message.findMany({
            where: { channelId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                replyTo: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                },
                reactions: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'asc' },
            take: 100,
        });

        console.log('Query successful!');
        console.log(`Found ${messages.length} messages.`);
        // console.log(JSON.stringify(messages, null, 2));
    } catch (error) {
        console.error('Query failed!');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
