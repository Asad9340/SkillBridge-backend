import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { AnalyticsService } from './analytics.service';

const GetTutorAnalytics = catchAsync(async (req: Request, res: Response) => {
  const tutorId = req.params?.tutorId;
  const result = await AnalyticsService.GetTutorAnalytics(tutorId as string);
  res.status(200).json({
    success: true,
    message: 'Tutor analytics fetched successfully',
    data: result,
  });
});
const GetStudentAnalytics = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user?.id;
  const result = await AnalyticsService.GetStudentAnalytics(studentId as string);
  res.status(200).json({
    success: true,
    message: 'Student analytics fetched successfully',
    data: result,
  });
});
const GetAdminAnalytics = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.user?.id;
  const result = await AnalyticsService.GetAdminAnalytics(adminId as string);
  res.status(200).json({
    success: true,
    message: 'Admin analytics fetched successfully',
    data: result,
  });
});

export const AnalyticsController = {
  GetTutorAnalytics,
  GetStudentAnalytics,
  GetAdminAnalytics,
};
