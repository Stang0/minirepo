import express from 'express';
import { prisma } from '../lib/prisma';
import { getActor } from '../lib/auth';
import { REQUEST_STATUS, ROLES } from '../lib/constants';

const router = express.Router();

router.get('/summary', async (req, res) => {
  try {
    const actor = await getActor(req, res);
    if (!actor) return;

    const requestWhere =
      actor.role === ROLES.STAFF
        ? { requesterId: actor.id }
        : actor.role === ROLES.DEPARTMENT_MANAGER
          ? { requester: { department: actor.department } }
          : {};

    const [products, lowStock, requests, completed, recentLogs] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { OR: [{ status: 'LOW_STOCK' }, { status: 'OUT_OF_STOCK' }] } }),
      prisma.stockRequest.count({ where: requestWhere }),
      prisma.stockRequest.count({
        where: {
          ...requestWhere,
          status: REQUEST_STATUS.COMPLETED
        }
      }),
      prisma.log.count()
    ]);

    const pendingWhere =
      actor.role === ROLES.DEPARTMENT_MANAGER
        ? { status: REQUEST_STATUS.PENDING, requester: { department: actor.department } }
        : actor.role === ROLES.STAFF
          ? { status: REQUEST_STATUS.PENDING, requesterId: actor.id }
          : { status: REQUEST_STATUS.PENDING };

    const waitingStoreWhere =
      actor.role === ROLES.STAFF
        ? { status: REQUEST_STATUS.WAITING_STORE_APPROVAL, requesterId: actor.id }
        : actor.role === ROLES.DEPARTMENT_MANAGER
          ? { status: REQUEST_STATUS.WAITING_STORE_APPROVAL, requester: { department: actor.department } }
          : { status: REQUEST_STATUS.WAITING_STORE_APPROVAL };

    const [pendingApprovals, waitingStoreApprovals] = await Promise.all([
      prisma.stockRequest.count({ where: pendingWhere }),
      prisma.stockRequest.count({ where: waitingStoreWhere })
    ]);

    res.json({
      products,
      lowStock,
      requests,
      completed,
      pendingApprovals,
      waitingStoreApprovals,
      recentLogs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load dashboard summary' });
  }
});

export default router;
