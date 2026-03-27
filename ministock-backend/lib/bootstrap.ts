import { prisma } from './prisma';
import { DEFAULT_PRODUCTS, DEFAULT_USERS } from './constants';
import { getProductStatus } from './helpers';
import { hashPassword } from './auth';

export const bootstrapData = async () => {
  const [userCount, productCount] = await Promise.all([
    prisma.user.count(),
    prisma.product.count()
  ]);

  if (userCount === 0) {
    await prisma.user.createMany({
      data: DEFAULT_USERS.map((user) => ({ ...user, password: hashPassword(user.password) }))
    });
  } else {
    const users = await prisma.user.findMany();
    await Promise.all(
      users
        .filter((user) => !user.password.startsWith('scrypt$'))
        .map((user) =>
          prisma.user.update({
            where: { id: user.id },
            data: {
              password: hashPassword(user.password)
            }
          })
        )
    );
  }

  if (productCount === 0) {
    await prisma.product.createMany({
      data: DEFAULT_PRODUCTS.map((product) => ({
        ...product,
        status: getProductStatus(product.quantity, product.minStock)
      }))
    });
  }
};
