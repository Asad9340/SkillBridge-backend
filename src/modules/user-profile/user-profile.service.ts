import { prisma } from '../../../lib/prisma';

const GetUserProfile = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      status: true,
      emailVerified: true,
      phone: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

type UpdateStudentProfilePayload = {
  name?: string;
  image?: string;
  phone?: string;
  bio?: string;
};

const UpdateStudentProfile = async (
  studentId: string,
  profilePayload: UpdateStudentProfilePayload,
) => {
  const data: UpdateStudentProfilePayload = {};

  if (profilePayload.name) data.name = profilePayload.name;
  if (profilePayload.image) data.image = profilePayload.image;
  if (profilePayload.phone) data.phone = profilePayload.phone;
  if (profilePayload.bio) data.bio = profilePayload.bio;

  const result = await prisma.user.update({
    where: { id: studentId },
    data,
  });

  return result;
};

export const StudentProfileService = {
  GetUserProfile,
  UpdateStudentProfile,
};
