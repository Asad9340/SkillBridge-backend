import { Review } from '../../../generated/prisma/client';
import { prisma } from '../../../lib/prisma';

const CreateReview = async (payload: Review) => {
  const { tutorId, studentId, rating, comment } = payload;

  return await prisma.$transaction(async tx => {
    const tutor = await tx.tutorProfile.findUnique({
      where: { id: tutorId },
      select: {
        rating: true,
        totalReviews: true,
      },
    });

    if (!tutor) {
      throw new Error('Tutor not found');
    }

    const newTotalReviews = tutor.totalReviews + 1;
    const newAverageRating =
      (tutor.rating * tutor.totalReviews + rating) / newTotalReviews;

    const review = await tx.review.create({
      data: {
        tutorId,
        studentId,
        rating,
        comment,
      },
    });

    await tx.tutorProfile.update({
      where: { id: tutorId },
      data: {
        totalReviews: newTotalReviews,
        rating: Number(newAverageRating.toFixed(2)),
      },
    });

    return review;
  });
};
const GetAllRating = async (tutorId: string) => {
  const result = await prisma.review.findMany({
    where: { tutorId },
    include: {
      student: {
        select: {
          name: true,
          email: true,
          image:true,
        }
      }
    }
  });
  return result;
};
export const ReviewService = {
  CreateReview,
  GetAllRating,
};
