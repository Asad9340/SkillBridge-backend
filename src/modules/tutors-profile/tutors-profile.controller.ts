import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { TutorsProfileService } from './tutors-profile.service';

const GetAllTutors = catchAsync(async (req: Request, res: Response) => {
 const filters = req.query;

  const result = await TutorsProfileService.GetAllTutors(filters);
   res.status(200).json({
     success: true,
     message: 'All Tutor fetched successfully',
     data: result,
   });
})
const GetTutorProfileById = catchAsync(async (req: Request, res: Response) => {
  const tutorId = req.params.tutorId;

  const result = await TutorsProfileService.GetTutorProfileById(
    tutorId as string,
  );
  res.status(200).json({
    success: true,
    message: 'Tutor profile fetched successfully',
    data: result,
  });
});

const CreateTutorProfile = catchAsync(async (req: Request, res: Response) => {
  const tutorPayload = req.body;

  const result = await TutorsProfileService.CreateTutorProfile(tutorPayload);
  res.status(201).json({
    success: true,
    message: 'Tutor profile created successfully',
    data: result,
  });
});

const UpdateTutorProfile = catchAsync(async (req: Request, res: Response) => {
  const { tutorId } = req.params;
  const tutorPayload = req.body;
  const result = await TutorsProfileService.UpdateTutorProfile(
    tutorId as string,
    tutorPayload,
  );
  res.status(200).json({
    success: true,
    message: 'Tutor profile updated successfully',
    data: result,
  });
});

const UpdateUserprofileForSubjects = catchAsync(
  async (req: Request, res: Response) => {
    const tutorId = req.params.tutorId;
    const { subjectIds } = req.body;
    const result = await TutorsProfileService.UpdateUserprofileForSubjects(
      tutorId as string,
      subjectIds,
    );
    res.status(200).json({
      success: true,
      message: 'Tutor profile updated successfully',
      data: result,
    });
  },
);

export const TutorsProfileController = {
  GetAllTutors,
  GetTutorProfileById,
  CreateTutorProfile,
  UpdateTutorProfile,
  UpdateUserprofileForSubjects,
};
