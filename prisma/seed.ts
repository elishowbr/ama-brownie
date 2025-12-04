import { hash } from 'crypto'
import { PrismaClient } from '../generated/prisma'
import { hashSync } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Iniciando o seed (populando banco)...')

    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.productOption.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany()

    const catTradicionais = await prisma.category.upsert({
        where: { slug: 'tradicionais' },
        update: {},
        create: { name: 'Tradicionais', slug: 'tradicionais' }
    })

    const catRecheados = await prisma.category.upsert({
        where: { slug: 'recheados' },
        update: {},
        create: { name: 'Recheados', slug: 'recheados' }
    })

    // 3. Criar Produtos

    // Produto Normal
    await prisma.product.create({
        data: {
            name: 'Brownie Supremo',
            description: 'Massa densa 70% cacau com pedaços de nozes nobres.',
            price: 12.90,
            categoryId: catTradicionais.id,
            imageUrl: '/brownie-1.jpg',
            options: {
                create: [
                    { name: 'Sem Adicional', price: 0 },
                    { name: 'Nozes Extra', price: 3.50 }
                ]
            }
        }
    })

    // --- NOVO PRODUTO COM PROMOÇÃO ---
    await prisma.product.create({
        data: {
            name: 'Mega Brownie Especial',
            description: 'Edição limitada com tripla camada de chocolate.',
            price: 25.00,       // Preço "De" (Riscado)
            promoPrice: 19.90,  // Preço "Por" (Verde)
            categoryId: catRecheados.id,
            imageUrl: '/brownie-2.jpg',
            options: {
                create: [
                    { name: 'Apenas o Brownie', price: 0 },
                    { name: 'Com Bola de Sorvete', price: 8.00 } // Teste de soma: 19.90 + 8.00
                ]
            }
        }
    })

    const adminPhone = "2469"
    const adminExists = await prisma.user.findUnique({ where: { phone: adminPhone } })

    if (!adminExists) {
        await prisma.user.create({
            data: {
                name: "Amanda Administrativo",
                phone: adminPhone,
                role: Role.ADMIN,
                password: hashSync('admin123', 10),
                address: "Rua da Doceria, 100"
            }
        })
        console.log('👤 Admin criado!')
    }


    await prisma.user.create({
        data: {
            name: "Elishowteste",
            phone: "9999",
            role: Role.CLIENT,
            password: hashSync('mario123', 10),
            address: "Rua da Doceria, 2333"
        }
    })
    console.log('✅ Seed finalizado com o produto promocional!')
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })