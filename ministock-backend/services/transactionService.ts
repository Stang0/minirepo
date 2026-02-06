import { ProductRepository } from '../repositories/productRepository';
import { TransactionRepository } from '../repositories/transactionRepository';
import { prisma } from '../lib/prisma'

const getStatus = (quantity: number) => {
    if (quantity <= 0) return 'OUT_OF_STOCK';
    if (quantity < 10) return 'LOW_STOCK';
    return 'IN_STOCK';
}

export const TransactionService = {
    async getAllTransactions() {
        return TransactionRepository.findAll();
    },

    async createTransaction(data: any) {
        const { type, quantity, productId, notes } = data;

        if (!['IN', 'OUT'].includes(type)) throw new Error('Invalid transaction type');
        if (!quantity || quantity <= 0) throw new Error('Invalid quantity');

        return prisma.$transaction(async (tx) => {
            const transaction = await TransactionRepository.createWithTx(tx, {
                type,
                quantity,
                productId,
                notes
            });

            const product = await ProductRepository.findByIdWithTx(tx, productId);
            if (!product) throw new Error('Product not found');

            let newQuantity = product.quantity;
            if (type === 'IN') {
                newQuantity += quantity;
            } else {
                newQuantity -= quantity;
            }

            if (newQuantity < 0) throw new Error('Insufficient stock');

            const updatedProduct = await ProductRepository.updateWithTx(tx, productId, {
                quantity: newQuantity,
                status: getStatus(newQuantity)
            });

            return { transaction, updatedProduct };
        });
    }
};
