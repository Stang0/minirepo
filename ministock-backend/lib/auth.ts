import { Response } from 'express';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { prisma } from './prisma';

const AUTH_SECRET = process.env.AUTH_SECRET || 'ministock-dev-secret-change-me';
const TOKEN_TTL_SECONDS = 60 * 60 * 12;

export const publicUserSelect = {
  id: true,
  name: true,
  username: true,
  role: true,
  department: true
} as const;

const encodeBase64Url = (value: string) => Buffer.from(value).toString('base64url');
const decodeBase64Url = (value: string) => Buffer.from(value, 'base64url').toString('utf8');

export const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
};

export const verifyPassword = (password: string, storedPassword: string) => {
  if (!storedPassword.startsWith('scrypt$')) {
    return password === storedPassword;
  }

  const [, salt, storedHash] = storedPassword.split('$');
  const hashBuffer = scryptSync(password, salt, 64);
  const storedHashBuffer = Buffer.from(storedHash, 'hex');

  return timingSafeEqual(hashBuffer, storedHashBuffer);
};

export const signToken = (userId: string) => {
  const payload = encodeBase64Url(
    JSON.stringify({
      userId,
      exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
    })
  );

  const signature = createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
};

const verifyToken = (token: string) => {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expectedSignature = createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  const decoded = JSON.parse(decodeBase64Url(payload)) as { userId: string; exp: number };
  if (!decoded.userId || decoded.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return decoded;
};

export const getTokenFromRequest = (req: any) => {
  const authorization = req.header('authorization');
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice(7);
  }

  return null;
};

export const getActor = async (req: any, res: Response) => {
  const token = getTokenFromRequest(req);
  const legacyUserId = req.header('x-user-id');
  const tokenPayload = token ? verifyToken(token) : null;
  const userId = tokenPayload?.userId || legacyUserId;

  if (!userId) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }

  const actor = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!actor) {
    res.status(401).json({ error: 'Invalid session user' });
    return null;
  }

  return actor;
};

export const requireRoles = async (req: any, res: Response, roles: string[]) => {
  const actor = await getActor(req, res);
  if (!actor) return null;

  if (!roles.includes(actor.role)) {
    res.status(403).json({ error: 'You do not have permission for this action' });
    return null;
  }

  return actor;
};
