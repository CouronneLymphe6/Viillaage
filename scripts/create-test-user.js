
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const email = 'test@test.com';
    const password = 'test';

    const hashedPassword = await bcrypt.hash(password, 10);

    // Upsert user
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
        },
        create: {
            email,
            password: hashedPassword,
            name: 'Test Tester',
            role: 'USER',
            acceptedCGU: true,
            acceptedPrivacy: true,
        },
    });

    console.log(`User created: ${user.email}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
