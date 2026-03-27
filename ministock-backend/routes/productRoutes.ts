import express from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma';
import { createLog } from '../lib/logs';
import { getProductStatus, parseNumber } from '../lib/helpers';
import { getActor, requireRoles } from '../lib/auth';
import { ROLES } from '../lib/constants';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const actor = await getActor(req, res);
    if (!actor) return;

    const search = req.query.search?.toString().trim();
    const products = await prisma.product.findMany({
      where: search
        ? {
            OR: [
              { sku: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } }
            ]
          }
        : undefined,
      orderBy: [{ status: 'desc' }, { updatedAt: 'desc' }]
    });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/scan/:code', async (req, res) => {
  try {
    const actor = await getActor(req, res);
    if (!actor) return;

    const { code } = req.params;
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ qrCode: code }, { sku: code }, { id: code }]
      }
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to scan product' });
  }
});

router.post('/', async (req, res) => {
  try {
    const actor = await requireRoles(req, res, [ROLES.ADMIN]);
    if (!actor) return;

    const quantity = parseNumber(req.body.quantity, 0);
    const minStock = parseNumber(req.body.minStock, 5);
    const product = await prisma.product.create({
      data: {
        id: randomUUID(),
        sku: req.body.sku,
        name: req.body.name,
        category: req.body.category || 'General',
        quantity,
        unit: req.body.unit || 'pcs',
        price: req.body.price ? Number(req.body.price) : null,
        image: req.body.image || null,
        minStock,
        qrCode: req.body.qrCode || `MINISTOCK:${req.body.sku}`,
        status: getProductStatus(quantity, minStock)
      }
    });

    await createLog({
      action: 'PRODUCT_CREATED',
      entityType: 'product',
      entityId: product.id,
      userId: actor.id,
      details: `${actor.name} created product ${product.sku}`
    });

    res.status(201).json(product);
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'SKU or QR code already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const actor = await requireRoles(req, res, [ROLES.ADMIN]);
    if (!actor) return;

    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const quantity = req.body.quantity !== undefined ? parseNumber(req.body.quantity, existing.quantity) : existing.quantity;
    const minStock = req.body.minStock !== undefined ? parseNumber(req.body.minStock, existing.minStock) : existing.minStock;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(req.body.sku !== undefined ? { sku: req.body.sku } : {}),
        ...(req.body.name !== undefined ? { name: req.body.name } : {}),
        ...(req.body.category !== undefined ? { category: req.body.category } : {}),
        ...(req.body.unit !== undefined ? { unit: req.body.unit } : {}),
        ...(req.body.price !== undefined ? { price: req.body.price ? Number(req.body.price) : null } : {}),
        ...(req.body.image !== undefined ? { image: req.body.image } : {}),
        ...(req.body.qrCode !== undefined ? { qrCode: req.body.qrCode } : {}),
        ...(req.body.quantity !== undefined ? { quantity } : {}),
        ...(req.body.minStock !== undefined ? { minStock } : {}),
        status: getProductStatus(quantity, minStock)
      }
    });

    await createLog({
      action: 'PRODUCT_UPDATED',
      entityType: 'product',
      entityId: product.id,
      userId: actor.id,
      details: `${actor.name} updated product ${product.sku}`
    });

    res.json(product);
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const actor = await requireRoles(req, res, [ROLES.ADMIN]);
    if (!actor) return;

    const product = await prisma.product.delete({ where: { id: req.params.id } });

    await createLog({
      action: 'PRODUCT_DELETED',
      entityType: 'product',
      entityId: product.id,
      userId: actor.id,
      details: `${actor.name} deleted product ${product.sku}`
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
