import { Availability } from '../../../generated/prisma/client';
import { prisma } from '../../../lib/prisma';

const GetAllAvailability = async () => {
  const result = await prisma.availability.findMany({
    include: {
      tutor: {
        select: {
          subjects: true,
        },
      },
    },
  });
  return result;
};
const GetTutorAvailabilityByTutorId = async (tutorId: string) => {
  const result = await prisma.availability.findMany({
    where: { tutorId },
    include: {
      subject: {
        select: {
          name: true,
        },
      },
    },
  });

  return result.map(({ subject, ...rest }) => ({
    ...rest,
    subject: subject.name,
  }));
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
  GetAllAvailability,
  GetTutorAvailabilityByTutorId,
  CreateTutorAvailability,
  UpdateTutorAvailability,
  DeleteTutorAvailability,
};
