import express from 'express';
import { ProductController } from '../controllers/productController';

const router = express.Router();

router.get('/', ProductController.getAll);
router.post('/', ProductController.create);
router.get('/id/:id', ProductController.getById);
router.get('/:sku', ProductController.getBySku);
router.patch('/:id', ProductController.update);

export default router;
