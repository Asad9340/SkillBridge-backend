import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { StudentProfileService } from './user-profile.service';
import { uploadFileToCloudinary } from '../../app/config/cloudinary.config';

const GetUserProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const result = await StudentProfileService.GetUserProfile(userId);
  if (!result) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res
    .status(200)
    .json({ success: true, message: 'User profile retrieved', data: result });
});

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

const UploadStudentAvatar = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.params.studentId;
  const file = req.file as Express.Multer.File | undefined;

  if (!file?.buffer || !file.originalname) {
    res.status(400).json({
      success: false,
      message: 'Image file is required',
    });
    return;
  }

  const uploadedImage = await uploadFileToCloudinary(
    file.buffer,
    file.originalname,
  );

  const result = await StudentProfileService.UpdateStudentProfile(
    studentId as string,
    {
      image: uploadedImage.secure_url,
    },
  );

  res.status(200).json({
    success: true,
    message: 'Profile image updated Successfully',
    data: {
      image: result.image,
    },
  });
});

export const StudentProfileController = {
  GetUserProfile,
  UpdateStudentProfile,
  UploadStudentAvatar,
};
