import { ProductRepository } from '../repositories/productRepository';
import { TransactionRepository } from '../repositories/transactionRepository';
import { prisma } from '../lib/prisma'
import { randomUUID } from 'crypto';


const getStatus = (quantity: number) => {
    if (quantity <= 0) return 'OUT_OF_STOCK';
    if (quantity < 10) return 'LOW_STOCK';
    return 'IN_STOCK';
}

export const ProductService = {
    async getAllProducts() {
        return ProductRepository.findAll();
    },

    async getProductBySku(sku: string) {
        return ProductRepository.findBySku(sku);
    },

    async getProductById(id: string) {
        return ProductRepository.findById(id);
    },

    async createProduct(data: any) {
        const quantity = data.quantity || 0;
        const status = getStatus(quantity);



        const productId = randomUUID();

        const productData = {
            id: productId,
            sku: data.sku,
            name: data.name,
            category: data.category,
            quantity: quantity,
            unit: data.unit || 'pcs',
            price: data.price ? parseFloat(data.price) : null,
            image: data.image || null,
            status: status,
            updatedAt: new Date()
        };

        if (quantity > 0) {
            return prisma.$transaction(async (tx) => {
                const product = await tx.product.create({
                    data: productData
                });

                await TransactionRepository.createWithTx(tx, {
                    id: randomUUID(),
                    type: 'IN',
                    quantity: quantity,
                    productId: product.id,
                    date: data.entryDate ? new Date(data.entryDate) : undefined,
                    notes: 'Initial Stock'
                });

                return product;
            });
        } else {
            return ProductRepository.create(productData);
        }
    },

    async updateProduct(id: string, data: any) {
        const updateData: any = {
            updatedAt: new Date()
        };

        if (data.name !== undefined) updateData.name = data.name;
        if (data.sku !== undefined) updateData.sku = data.sku;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.unit !== undefined) updateData.unit = data.unit;
        if (data.image !== undefined) updateData.image = data.image;

        if (data.price !== undefined) {
            updateData.price = data.price ? parseFloat(data.price) : null;
        }

        if (data.quantity !== undefined) {
            const qty = parseInt(data.quantity);
            if (!isNaN(qty)) {
                updateData.quantity = qty;
                updateData.status = getStatus(qty);
            }
        }

        return ProductRepository.update(id, updateData);
    }
};
