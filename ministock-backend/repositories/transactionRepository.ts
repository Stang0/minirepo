import { prisma } from '../lib/prisma'


export const TransactionRepository = {
    async findAll(limit: number = 50) {
        return prisma.transaction.findMany({
            include: {
                Product: {
                    select: { name: true, sku: true, category: true }
                }
            },
            orderBy: { date: 'desc' },
            take: limit
        });
    },

    async createWithTx(tx: any, data: any) {
        return tx.transaction.create({
            data
        });
    }
};
