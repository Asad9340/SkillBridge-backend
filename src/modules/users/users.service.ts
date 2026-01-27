import { UserStatus } from '../../../generated/prisma/enums';
import { prisma } from '../../../lib/prisma';

const GetAllUsers = async () => {
  const result = await prisma.user.findMany();
  return result;
};

const UpdateUserStatus = async (userId: string, status: UserStatus) => {
  const result = await prisma.user.update({
    where: { id: userId },
    data: { status },
  });
  return result;
};

export const UsersService = {
  GetAllUsers,
  UpdateUserStatus,
};
