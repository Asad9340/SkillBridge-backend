import { TutorProfile } from '../../../generated/prisma/client';
import { prisma } from '../../../lib/prisma';

const CreateTutorProfile = async (tutorPayload: TutorProfile) => {
  const result = await prisma.tutorProfile.create({
    data: tutorPayload,
  });
  return result;
};

const UpdateTutorProfile = async (
  tutorId: string,
  tutorPayload: Partial<TutorProfile>,
) => {
  const result = await prisma.tutorProfile.update({
    where: { id: tutorId },
    data: tutorPayload,
  });
  return result;
};

export const TutorsService = {
  CreateTutorProfile,
  UpdateTutorProfile,
};
