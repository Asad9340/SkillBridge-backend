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
        },
      },
      subjects: {
        select: {
          subject: true,
        },
      },
      availability: {
        select: {
          date: true,
          isBooked: true,
          startTime: true,
          endTime: true,
        },
      },
    },
  });

  return result.map(({ user, subjects, ...tutor }) => ({
    ...tutor,
    userId: user.id,
    name: user.name,
    email: user.email,
    subjects: subjects.map(s => s.subject),
  }));
};
const GetTutorProfileById = async (tutorId: string) => {
  const result = await prisma.tutorProfile.findUnique({
    where: { userId: tutorId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!result) return null;

  const { user, ...tutor } = result;

  return {
    ...tutor,
    userId: user.id,
    name: user.name,
    email: user.email,
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
