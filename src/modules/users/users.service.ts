import { User } from '../../../generated/prisma/client';
import { Role, UserStatus } from '../../../generated/prisma/enums';
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

const UpdateUserRole = async (userId: string, role: Role) => {
  const result = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
  return result;
};

const UpdateUserProfile = async (
  userId: string,
  userPayload: Partial<User>,
) => {
  const result = await prisma.user.update({
    where: { id: userId },
    data: userPayload,
  });
  return result;
};
export const UsersService = {
  GetAllUsers,
  UpdateUserStatus,
  UpdateUserRole,
  UpdateUserProfile,
};
