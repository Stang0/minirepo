import { prisma } from '../lib/prisma'

export const ProductRepository = {
    async findAll() {
        return prisma.product.findMany({
            orderBy: { updatedAt: 'desc' }
        });
    },

    async findBySku(sku: string) {
        return prisma.product.findUnique({
            where: { sku }
        });
    },

    async findById(id: string) {
        return prisma.product.findUnique({
            where: { id }
        });
    },

    async create(data: any) {
        return prisma.product.create({
            data
        });
    },

    async update(id: string, data: any) {
        return prisma.product.update({
            where: { id },
            data
        });
    },

    async updateWithTx(tx: any, id: string, data: any) {
        return tx.product.update({
            where: { id },
            data
        });
    },

    async findByIdWithTx(tx: any, id: string) {
        return tx.product.findUnique({ where: { id } });
    }
};
