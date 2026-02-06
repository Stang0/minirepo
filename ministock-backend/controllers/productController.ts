import { Request, Response } from 'express';
import { ProductService } from '../services/productService';

export const ProductController = {
    async getAll(req: Request, res: Response) {
        try {
            const products = await ProductService.getAllProducts();
            res.json(products);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    },

    async getBySku(req: Request, res: Response) {
        try {
            const { sku } = req.params;
            const product = await ProductService.getProductBySku(sku as string);
            if (!product) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }
            res.json(product);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch product' });
        }
    },

    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const product = await ProductService.getProductById(id as string);
            if (!product) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }
            res.json(product);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch product' });
        }
    },

    async create(req: Request, res: Response) {
        try {
            const product = await ProductService.createProduct(req.body);
            res.status(201).json(product);
        } catch (error: any) {
            console.error(error);
            if (error.code === 'P2002') {
                res.status(400).json({ error: 'SKU already exists' });
                return;
            }
            res.status(500).json({ error: 'Failed to create product' });
        }
    },

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const product = await ProductService.updateProduct(id as string, req.body);
            res.json(product);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update product' });
        }
    }
};
