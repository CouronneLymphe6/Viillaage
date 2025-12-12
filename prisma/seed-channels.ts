import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start updating channels...')

    // 1. Rename "Annonces" to "Alertes et Sécurité"
    const annoncesChannel = await prisma.channel.findFirst({
        where: { name: 'Annonces' }
    })

    if (annoncesChannel) {
        await prisma.channel.update({
            where: { id: annoncesChannel.id },
            data: {
                name: 'Alertes et Sécurité',
                description: 'Signalements urgents, sûreté du village et vigilance voisins'
            }
        })
        console.log('Renamed "Annonces" to "Alertes et Sécurité"')
    } else {
        // Check if it already exists with the new name
        const alertesChannel = await prisma.channel.findFirst({
            where: { name: 'Alertes et Sécurité' }
        })

        if (!alertesChannel) {
            // Create if neither exists (fallback)
            await prisma.channel.create({
                data: {
                    name: 'Alertes et Sécurité',
                    description: 'Signalements urgents, sûreté du village et vigilance voisins'
                }
            })
            console.log('Created "Alertes et Sécurité" channel (Annonces not found)')
        } else {
            console.log('"Alertes et Sécurité" already exists')
        }
    }

    // 2. Add "Ecole" channel
    const ecoleChannel = await prisma.channel.findFirst({
        where: { name: 'Ecole' }
    })

    if (!ecoleChannel) {
        await prisma.channel.create({
            data: {
                name: 'Ecole',
                description: 'Actualités scolaires, périscolaires et informations parents'
            }
        })
        console.log('Created "Ecole" channel')
    } else {
        console.log('"Ecole" channel already exists')
    }

    console.log('Channels updated successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
