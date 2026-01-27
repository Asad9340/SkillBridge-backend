import { Subject } from '../../../generated/prisma/client';
import { prisma } from '../../../lib/prisma';

const GetAllSubjects = async () => {
  const result = await prisma.subject.findMany();
  return result;
};

const CreateSubject = async (subjectPayload: Subject) => {
  const result = await prisma.subject.create({
    data: subjectPayload,
  });
  return result;
};

const UpdateSubject = async (
  subjectId: string,
  subjectPayload: Partial<Subject>,
) => {
  console.log(subjectId,subjectPayload)
  const result = await prisma.subject.update({
    where: { id: subjectId },
    data: subjectPayload,
  });
  return result;
};

const DeleteSubject = async (subjectId: string) => {
  await prisma.subject.delete({
    where: { id: subjectId },
  });
};

export const SubjectsService = {
  GetAllSubjects,
  CreateSubject,
  UpdateSubject,
  DeleteSubject,
};
