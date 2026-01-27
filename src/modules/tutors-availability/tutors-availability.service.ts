
import { prisma } from '../../../lib/prisma';

const GetTutorAvailabilityById = async (tutorId: string) => {
  const result = await prisma.availability.findMany({
    where: { tutorId },
  });
  return result;
};

const CreateTutorAvailability = async (availabilityPayload: Availability) => {
  const result = await prisma.availability.create({
    data: availabilityPayload,
  });
  return result;
};
const UpdateTutorAvailability = async (
  availabilityId: string,
  availabilityPayload: Partial<Availability>,
) => {
  const result = await prisma.availability.update({
    where: { id: availabilityId },
    data: availabilityPayload,
  });
  return result;
};

const DeleteTutorAvailability = async (availabilityId: string) => {
  await prisma.availability.delete({
    where: { id: availabilityId },
  });
};

export const TutorsAvailabilityService = {
  GetTutorAvailabilityById,
  CreateTutorAvailability,
  UpdateTutorAvailability,
  DeleteTutorAvailability,
};
