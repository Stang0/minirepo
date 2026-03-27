import express from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma';
import { createLog } from '../lib/logs';
import { getProductStatus, parseNumber } from '../lib/helpers';
import { getActor } from '../lib/auth';
import { APPROVAL_STATUS, REQUEST_STATUS, ROLES } from '../lib/constants';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const actor = await getActor(req, res);
    if (!actor) return;

    const where =
      actor.role === ROLES.STAFF
        ? { requesterId: actor.id }
        : actor.role === ROLES.DEPARTMENT_MANAGER
          ? { requester: { department: actor.department } }
          : undefined;

    const requests = await prisma.stockRequest.findMany({
      where,
      include: {
        requester: true,
        product: true,
        approvals: {
          include: {
            approver: true
          },
          orderBy: {
            actedAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

router.post('/', async (req, res) => {
  try {
    const actor = await getActor(req, res);
    if (!actor) return;

    const quantity = parseNumber(req.body.quantity, 0);
    if (quantity <= 0) {
      res.status(400).json({ error: 'Quantity must be greater than zero' });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id: req.body.productId }
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (quantity > product.quantity) {
      res.status(400).json({ error: `Requested quantity exceeds available stock (${product.quantity})` });
      return;
    }

    const stockRequest = await prisma.stockRequest.create({
      data: {
        id: randomUUID(),
        requesterId: actor.id,
        productId: product.id,
        quantity,
        type: req.body.type,
        reason: req.body.reason || null,
        status: REQUEST_STATUS.PENDING
      },
      include: {
        requester: true,
        product: true,
        approvals: true
      }
    });

    await createLog({
      action: 'REQUEST_CREATED',
      entityType: 'request',
      entityId: stockRequest.id,
      userId: actor.id,
      details: `${actor.name} created ${stockRequest.type} request for ${product.sku}`
    });

    res.status(201).json(stockRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

router.patch('/:id/decision', async (req, res) => {
  try {
    const actor = await getActor(req, res);
    if (!actor) return;

    const { decision, comment } = req.body;
    if (![APPROVAL_STATUS.APPROVED, APPROVAL_STATUS.REJECTED].includes(decision)) {
      res.status(400).json({ error: 'decision must be APPROVED or REJECTED' });
      return;
    }

    const request = await prisma.stockRequest.findUnique({
      where: { id: req.params.id },
      include: {
        requester: true,
        product: true,
        approvals: true
      }
    });

    if (!request) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    if (request.status === REQUEST_STATUS.REJECTED || request.status === REQUEST_STATUS.COMPLETED) {
      res.status(400).json({ error: 'Request is already closed' });
      return;
    }

    if (actor.id === request.requesterId) {
      res.status(400).json({ error: 'Requester cannot approve their own request' });
      return;
    }

    if (actor.role === ROLES.DEPARTMENT_MANAGER) {
      if (request.requester.department !== actor.department) {
        res.status(403).json({ error: 'You can only approve requests in your department' });
        return;
      }

      if (request.status !== REQUEST_STATUS.PENDING) {
        res.status(400).json({ error: 'This request is not waiting for department approval' });
        return;
      }

      const updated = await prisma.$transaction(async (tx) => {
        await tx.approval.create({
          data: {
            id: randomUUID(),
            requestId: request.id,
            approverId: actor.id,
            stage: 1,
            role: actor.role,
            status: decision,
            comment: comment || null
          }
        });

        return tx.stockRequest.update({
          where: { id: request.id },
          data: {
            status: decision === APPROVAL_STATUS.APPROVED ? REQUEST_STATUS.WAITING_STORE_APPROVAL : REQUEST_STATUS.REJECTED
          },
          include: {
            requester: true,
            product: true,
            approvals: {
              include: {
                approver: true
              },
              orderBy: {
                actedAt: 'asc'
              }
            }
          }
        });
      });

      await createLog({
        action: decision === APPROVAL_STATUS.APPROVED ? 'REQUEST_MANAGER_APPROVED' : 'REQUEST_MANAGER_REJECTED',
        entityType: 'request',
        entityId: request.id,
        userId: actor.id,
        details: `${actor.name} ${decision.toLowerCase()} request ${request.id}`
      });

      res.json(updated);
      return;
    }

    if (actor.role === ROLES.STORE_MANAGER) {
      if (request.status !== REQUEST_STATUS.WAITING_STORE_APPROVAL) {
        res.status(400).json({ error: 'This request is not waiting for store approval' });
        return;
      }

      const updated = await prisma.$transaction(async (tx) => {
        if (decision === APPROVAL_STATUS.APPROVED) {
          const currentProduct = await tx.product.findUnique({
            where: { id: request.productId }
          });

          if (!currentProduct) {
            throw new Error('PRODUCT_NOT_FOUND');
          }

          if (currentProduct.quantity < request.quantity) {
            throw new Error('INSUFFICIENT_STOCK');
          }

          const newQuantity = currentProduct.quantity - request.quantity;

          await tx.approval.create({
            data: {
              id: randomUUID(),
              requestId: request.id,
              approverId: actor.id,
              stage: 2,
              role: actor.role,
              status: decision,
              comment: comment || null
            }
          });

          await tx.product.update({
            where: { id: currentProduct.id },
            data: {
              quantity: newQuantity,
              status: getProductStatus(newQuantity, currentProduct.minStock)
            }
          });

          await tx.stockMovement.create({
            data: {
              id: randomUUID(),
              requestId: request.id,
              productId: currentProduct.id,
              createdById: actor.id,
              type: request.type === 'BORROW' ? 'BORROW_OUT' : 'STOCK_OUT',
              quantity: request.quantity,
              balanceAfter: newQuantity,
              note: comment || request.reason || 'Approved stock movement'
            }
          });

          return tx.stockRequest.update({
            where: { id: request.id },
            data: {
              status: REQUEST_STATUS.COMPLETED,
              completedAt: new Date()
            },
            include: {
              requester: true,
              product: true,
              approvals: {
                include: {
                  approver: true
                },
                orderBy: {
                  actedAt: 'asc'
                }
              }
            }
          });
        }

        await tx.approval.create({
          data: {
            id: randomUUID(),
            requestId: request.id,
            approverId: actor.id,
            stage: 2,
            role: actor.role,
            status: decision,
            comment: comment || null
          }
        });

        return tx.stockRequest.update({
          where: { id: request.id },
          data: {
            status: REQUEST_STATUS.REJECTED
          },
          include: {
            requester: true,
            product: true,
            approvals: {
              include: {
                approver: true
              },
              orderBy: {
                actedAt: 'asc'
              }
            }
          }
        });
      });

      await createLog({
        action: decision === APPROVAL_STATUS.APPROVED ? 'REQUEST_STORE_APPROVED' : 'REQUEST_STORE_REJECTED',
        entityType: 'request',
        entityId: request.id,
        userId: actor.id,
        details: `${actor.name} ${decision.toLowerCase()} request ${request.id}`
      });

      res.json(updated);
      return;
    }

    res.status(403).json({ error: 'Your role cannot approve requests' });
  } catch (error: any) {
    console.error(error);
    if (error.message === 'INSUFFICIENT_STOCK') {
      res.status(400).json({ error: 'Insufficient stock for final approval' });
      return;
    }
    if (error.message === 'PRODUCT_NOT_FOUND') {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to process approval' });
  }
});

export default router;
