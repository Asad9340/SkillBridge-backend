
import { prisma } from '../../../lib/prisma';
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
  UpdateStudentProfile,
};
