import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { TutorsAvailabilityService } from './tutors-availability.service';

const GetTutorAvailabilityById = catchAsync(
  async (req: Request, res: Response) => {
    const tutorId = req.params.availabilityId;
    const result = await TutorsAvailabilityService.GetTutorAvailabilityById(
      tutorId as string,
    );
    res.status(200).json({
      success: true,
      message: 'Tutor availability fetched successfully',
      data: result,
    });
  },
);

const CreateTutorAvailability = catchAsync(
  async (req: Request, res: Response) => {
    const availabilityPayload = req.body;
    const result =
      await TutorsAvailabilityService.CreateTutorAvailability(
        availabilityPayload,
      );
    res.status(201).json({
      success: true,
      message: 'Tutor availability created successfully',
      data: result,
    });
  },
);

const UpdateTutorAvailability = catchAsync(
  async (req: Request, res: Response) => {
    const availabilityId = req.params.availabilityId;
    const availabilityPayload = req.body;
    const result = await TutorsAvailabilityService.UpdateTutorAvailability(
      availabilityId as string,
      availabilityPayload,
    );
    res.status(200).json({
      success: true,
      message: 'Tutor availability updated successfully',
      data: result,
    });
  },
);

const DeleteTutorAvailability = catchAsync(
  async (req: Request, res: Response) => {
    const availabilityId = req.params.availabilityId;
    await TutorsAvailabilityService.DeleteTutorAvailability(
      availabilityId as string,
    );
    res.status(200).json({
      success: true,
      message: 'Tutor availability deleted successfully',
    });
  },
);

export const TutorsAvailabilityController = {
  GetTutorAvailabilityById,
  CreateTutorAvailability,
  UpdateTutorAvailability,
  DeleteTutorAvailability,
};
