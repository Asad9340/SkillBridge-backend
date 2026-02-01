import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ReviewService } from './reviews.service';

const CreateReview = catchAsync(async (req: Request, res: Response) => {
  let payload = req.body;
  payload.studentId = req.user?.id;
  const result = await ReviewService.CreateReview(payload);
  res.status(200).json({
    success: true,
    message: 'Review Created successfully',
    data: result,
  });
});

const GetAllRating = catchAsync(async (req: Request, res: Response) => {
  const tutorId = req.params.tutorId;
  const result = await ReviewService.GetAllRating(tutorId as string);
  res.status(200).json({
    success: true,
    message: 'Review fetched successfully',
    data: result,
  });
});

const GetAllRatingPublic = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.GetAllRatingPublic();
  res.status(200).json({
    success: true,
    message: 'Review fetched successfully',
    data: result,
  });
});

export const ReviewController = {
  CreateReview,
  GetAllRating,
  GetAllRatingPublic,
};
