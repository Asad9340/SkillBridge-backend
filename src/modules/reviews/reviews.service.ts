import { Review } from '../../../generated/prisma/client';
import { prisma } from '../../../lib/prisma';

const CreateReview = async (payload: Review) => {
  const result = await prisma.review.create({
    data: payload,
  });
  return result;
};

export const ReviewService = {
  CreateReview,
};