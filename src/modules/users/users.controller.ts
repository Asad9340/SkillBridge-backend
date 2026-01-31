import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { UsersService } from './users.service';

const GetAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UsersService.GetAllUsers();
  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const UpdateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const { status } = req.body;
  const result = await UsersService.UpdateUserStatus(userId as string, status);
  res.status(200).json({
    success: true,
    message: 'User status updated successfully',
    data: result,
  });
});

const UpdateUserProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const userPayload = req.body;
  const result = await UsersService.UpdateUserProfile(userId as string, userPayload);
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: result,
    });
})

export const UsersController = {
  GetAllUsers,
  UpdateUserStatus,
  UpdateUserProfile,
};
