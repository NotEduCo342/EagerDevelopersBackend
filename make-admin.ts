import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeUserAdmin() {
  const adminEmail = 'admin@eagerdevelopers.com';
  
  const updatedUser = await prisma.user.update({
    where: { email: adminEmail },
    data: { isAdmin: true },
  });

  console.log('Admin user updated:', {
    id: updatedUser.id,
    email: updatedUser.email,
    username: updatedUser.username,
    isAdmin: updatedUser.isAdmin,
  });

  await prisma.$disconnect();
}

makeUserAdmin().catch(console.error);