import { Subject, TutorProfile } from '../../../generated/prisma/client';
import { prisma } from '../../../lib/prisma';

const GetTutorProfileById = async (tutorId: string) => {
  const result = await prisma.tutorProfile.findUnique({
    where: { id: tutorId },
    include: { availability: true, subjects: true },
  });
  return result;
};

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
  GetTutorProfileById,
  CreateTutorProfile,
  UpdateTutorProfile,
  UpdateUserprofileForSubjects,
};
