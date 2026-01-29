import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { StudentProfileService } from './user-profile.service';

const UpdateStudentProfile = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.params.studentId;
  const profilePayload = req.body;
  const result = await StudentProfileService.UpdateStudentProfile(
    studentId as string,
    profilePayload,
  );
  res.status(200).json({
    success: true,
    message: 'User profile updated Successfully',
    data: result,
  });
});

export const StudentProfileController = {
  UpdateStudentProfile,
};
