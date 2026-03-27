import { randomUUID } from 'crypto';
import { prisma } from './prisma';

interface CreateLogInput {
  action: string;
  entityType: string;
  entityId: string;
  userId?: string | null;
  details?: string;
}

export const createLog = async (input: CreateLogInput) => {
  await prisma.log.create({
    data: {
      id: randomUUID(),
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      userId: input.userId ?? null,
      details: input.details
    }
  });
};
