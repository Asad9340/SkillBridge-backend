import { Prisma, TutorProfile } from '../../../generated/prisma/client';
import { prisma } from '../../../lib/prisma';
export interface TutorQuery {
  category?: string;
  search?: string;
  page?: string;
  limit?: string;
}
export const GetAllTutors = async (queryData: TutorQuery) => {
  const { category, search, page = '1', limit = '10' } = queryData;

  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.min(50, Math.max(1, Number(limit)));
  const skip = (pageNumber - 1) * limitNumber;

  const andConditions: any[] = [];
  if (category?.trim() && category.trim().toLowerCase() !== 'all') {
    const trimmedCat = category.trim();
    andConditions.push({
      subjects: {
        some: {
          subject: {
            OR: [
              { category: { id: { equals: trimmedCat } } },
              {
                category: {
                  name: { contains: trimmedCat, mode: 'insensitive' },
                },
              },
            ],
          },
        },
      },
    });
  }
  if (search?.trim()) {
    const trimmed = search.trim();
    const num = Number(trimmed);

    if (!isNaN(num)) {
      andConditions.push({
        OR: [{ rating: { gte: num } }, { hourlyRate: { equals: num } }],
      });
    } else {
      andConditions.push({
        OR: [
          { bio: { contains: trimmed, mode: 'insensitive' } },
          { user: { name: { contains: trimmed, mode: 'insensitive' } } },
          {
            subjects: {
              some: {
                subject: {
                  OR: [
                    { name: { contains: trimmed, mode: 'insensitive' } },
                    {
                      category: {
                        name: { contains: trimmed, mode: 'insensitive' },
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      });
    }
  }

  const whereCondition = andConditions.length ? { AND: andConditions } : {};
  const [tutors, total] = await Promise.all([
    prisma.tutorProfile.findMany({
      where: whereCondition,
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        subjects: {
          include: {
            subject: { include: { category: true } },
          },
        },
      },
      orderBy: { rating: 'desc' },
      skip,
      take: limitNumber,
    }),

    prisma.tutorProfile.count({ where: whereCondition }),
  ]);

  const data = tutors.map(({ user, subjects, ...tutor }) => ({
    id: tutor.id,
    userId: user.id,
    bio: tutor.bio,
    hourlyRate: tutor.hourlyRate,
    rating: tutor.rating,
    totalReviews: tutor.totalReviews,
    name: user.name,
    email: user.email,
    image: user.image,
    subjects: subjects.map(s => s.subject.name),
    categories: subjects.map(s => s.subject.category.name),
  }));

  return {
    meta: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
    data,
  };
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

      reviews: {
        select: {
          rating: true,
          comment: true,
          student: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!result) return null;

  const { user, availability, reviews, ...tutor } = result;

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

  const formattedReviews = reviews.map(r => ({
    reviewerName: r.student.name,
    reviewerImage: r.student.image,
    rating: r.rating,
    review: r.comment,
  }));

  return {
    ...tutor,
    userId: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    availability: flatAvailability,
    reviews: formattedReviews,
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
