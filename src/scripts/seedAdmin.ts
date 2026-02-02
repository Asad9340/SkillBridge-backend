import { prisma } from '../../lib/prisma';
import { UserRole } from '../middlewares/auth';

async function seedAdmin() {
  try {
    const adminData = {
      name: 'Admin',
      email: 'admin@gmail.com',
      role: UserRole.ADMIN,
      password: 'admin1234',
    };
    const existingUser = await prisma.user.findUnique({
      where: {
        email: adminData.email,
      },
    });

    if (existingUser) {
      throw new Error('User already exists!!');
    }

    const signUpAdmin = await fetch(
      'https://skill-bridge-sooty-five.vercel.app/api/auth/sign-up/email',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData),
      },
    );
    if (signUpAdmin.ok) {
      await prisma.user.update({
        where: {
          email: adminData.email,
        },
        data: {
          emailVerified: true,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
}
seedAdmin();
