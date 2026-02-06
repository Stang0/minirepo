import express from 'express';
import { TransactionController } from '../controllers/transactionController';

const router = express.Router();

router.get('/', TransactionController.getAll);
router.post('/', TransactionController.create);

export default router;
