import express from 'express';
import { prisma } from '../lib/prisma';
import { requireRoles } from '../lib/auth';
import { ROLES } from '../lib/constants';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const actor = await requireRoles(req, res, [ROLES.STORE_MANAGER, ROLES.ADMIN]);
    if (!actor) return;

    const [logs, stockMovements] = await Promise.all([
      prisma.log.findMany({
        include: {
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 100
      }),
      prisma.stockMovement.findMany({
        include: {
          product: true,
          createdBy: true,
          request: {
            include: {
              requester: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 100
      })
    ]);

    res.json({ logs, stockMovements });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

export default router;
