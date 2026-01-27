import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { TutorsService } from './tutors.service';

const CreateTutorProfile = catchAsync(async (req: Request, res: Response) => {
  const tutorPayload = req.body;

  const result = await TutorsService.CreateTutorProfile(tutorPayload);
  res.status(201).json({
    success: true,
    message: 'Tutor profile created successfully',
    data: result,
  });
});

const UpdateTutorProfile = catchAsync(async (req: Request, res: Response) => {
  const { tutorId } = req.params;
  const tutorPayload = req.body;

  const result = await TutorsService.UpdateTutorProfile(
    tutorId as string,
    tutorPayload,
  );
  res.status(200).json({
    success: true,
    message: 'Tutor profile updated successfully',
    data: result,
  });
});

export const TutorsController = {
  CreateTutorProfile,
  UpdateTutorProfile,
};
