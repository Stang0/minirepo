import express from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma';
import { createLog } from '../lib/logs';
import { hashPassword, publicUserSelect, requireRoles } from '../lib/auth';
import { ROLES } from '../lib/constants';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const actor = await requireRoles(req, res, [ROLES.ADMIN]);
    if (!actor) return;

    const users = await prisma.user.findMany({
      orderBy: [{ department: 'asc' }, { name: 'asc' }],
      select: publicUserSelect
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/', async (req, res) => {
  try {
    const actor = await requireRoles(req, res, [ROLES.ADMIN]);
    if (!actor) return;

    const { name, username, role, department, password } = req.body;
    if (!name || !username || !role || !department) {
      res.status(400).json({ error: 'name, username, role, and department are required' });
      return;
    }

    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        name,
        username,
        password: hashPassword(password || 'demo1234'),
        role,
        department
      },
      select: publicUserSelect
    });

    await createLog({
      action: 'USER_CREATED',
      entityType: 'user',
      entityId: user.id,
      userId: actor.id,
      details: `${actor.name} created ${user.name} (${user.role})`
    });

    res.status(201).json(user);
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Username already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const actor = await requireRoles(req, res, [ROLES.ADMIN]);
    if (!actor) return;

    const { id } = req.params;
    const { name, username, role, department, password } = req.body;
    const nextPassword = typeof password === 'string' ? password.trim() : '';

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(username !== undefined ? { username } : {}),
        ...(role !== undefined ? { role } : {}),
        ...(department !== undefined ? { department } : {}),
        ...(nextPassword ? { password: hashPassword(nextPassword) } : {})
      },
      select: publicUserSelect
    });

    await createLog({
      action: 'USER_UPDATED',
      entityType: 'user',
      entityId: user.id,
      userId: actor.id,
      details: `${actor.name} updated ${user.name}`
    });

    res.json(user);
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const actor = await requireRoles(req, res, [ROLES.ADMIN]);
    if (!actor) return;

    const { id } = req.params;
    const user = await prisma.user.delete({ where: { id } });

    await createLog({
      action: 'USER_DELETED',
      entityType: 'user',
      entityId: id,
      userId: actor.id,
      details: `${actor.name} deleted ${user.name}`
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
