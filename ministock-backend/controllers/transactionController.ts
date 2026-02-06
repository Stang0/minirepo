import { Request, Response } from 'express';
import { TransactionService } from '../services/transactionService';

export const TransactionController = {
    async getAll(req: Request, res: Response) {
        try {
            const transactions = await TransactionService.getAllTransactions();
            res.json(transactions);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch transactions' });
        }
    },

    async create(req: Request, res: Response) {
        try {
            const result = await TransactionService.createTransaction(req.body);
            res.json(result);
        } catch (error: any) {
            console.error(error);
            res.status(400).json({ error: error.message || 'Transaction failed' });
        }
    }
};
