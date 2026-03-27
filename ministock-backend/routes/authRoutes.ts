import express from 'express';
import { prisma } from '../lib/prisma';
import { getActor, hashPassword, publicUserSelect, signToken, verifyPassword } from '../lib/auth';

const router = express.Router();

router.get('/users', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
      select: publicUserSelect
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch demo users' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'username and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user || !verifyPassword(password, user.password)) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    if (!user.password.startsWith('scrypt$')) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashPassword(password)
        }
      });
    }

    const publicUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: publicUserSelect
    });

    res.json({
      token: signToken(user.id),
      user: publicUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

router.get('/session', async (req, res) => {
  try {
    const actor = await getActor(req, res);
    if (!actor) return;

    const user = await prisma.user.findUnique({
      where: { id: actor.id },
      select: publicUserSelect
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

export default router;
