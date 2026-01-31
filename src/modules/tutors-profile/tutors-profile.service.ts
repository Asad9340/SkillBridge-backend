import { TutorProfile } from '../../../generated/prisma/client';
import { prisma } from '../../../lib/prisma';

interface TutorQuery {
  category?: string;
  subject?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  page?: string;
  limit?: string;
}
const GetAllTutors = async (queryData: TutorQuery) => {
  const result = await prisma.tutorProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return result.map(({ user, ...tutor }) => ({
    ...tutor,
    userId: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
  }));
};

const GetTutorProfileById = async (tutorId: string) => {
  const result = await prisma.tutorProfile.findUnique({
    where: { userId: tutorId },
    select: {
      id: true,
      bio: true,
      hourlyRate: true,
      rating: true,
      totalReviews: true,
      createdAt: true,
      updatedAt: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },

      availability: {
        select: {
          id: true,
          tutorId: true,
          subjectId: true,
          date: true,
          startTime: true,
          endTime: true,
          isBooked: true,

          subject: {
            select: {
              id: true,
              name: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!result) return null;

  const { user, availability, ...tutor } = result;

  const flatAvailability = availability.map(slot => ({
    id: slot.id,
    tutorId: slot.tutorId,
    subjectId: slot.subjectId,
    subjectName: slot.subject.name,
    categoryId: slot.subject.category.id,
    categoryName: slot.subject.category.name,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    isBooked: slot.isBooked,
  }));

  return {
    ...tutor,
    userId: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    availability: flatAvailability,
  };
};

export const CreateTutorProfile = async (tutorPayload: TutorProfile) => {
  const tutorProfile = await prisma.tutorProfile.create({
    data: tutorPayload,
  });

  await prisma.user.update({
    where: { id: tutorPayload.userId },
    data: { role: 'TUTOR' },
  });

  return tutorProfile;
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

const UpdateUserprofileForSubjects = async (
  tutorId: string,
  subjectIds: string[],
) => {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { userId: tutorId },
    include: {
      subjects: {
        select: { subjectId: true },
      },
    },
  });

  if (!tutor) {
    throw new Error('Tutor profile not found');
  }

  const existingSubjectIds = tutor.subjects.map(s => s.subjectId);

  const newSubjectIds = subjectIds.filter(
    id => !existingSubjectIds.includes(id),
  );

  if (newSubjectIds.length === 0) {
    return tutor;
  }

  const updatedTutor = await prisma.tutorProfile.update({
    where: { userId: tutorId },
    data: {
      subjects: {
        create: newSubjectIds.map(subjectId => ({
          subjectId,
        })),
      },
    },
    include: {
      subjects: true,
    },
  });
  return updatedTutor;
};

export const TutorsProfileService = {
  GetAllTutors,
  GetTutorProfileById,
  CreateTutorProfile,
  UpdateTutorProfile,
  UpdateUserprofileForSubjects,
};
