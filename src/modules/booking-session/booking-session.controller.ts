import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { BookingSessionService } from './booking-session.service';

const CreateSession = catchAsync(async (req: Request, res: Response) => {
  const bookingPayload = req.body;
  bookingPayload.studentId = req.user?.id;
  const result = await BookingSessionService.CreateSession(bookingPayload);
  res.status(201).json({
    success: true,
    message: 'Booking Session Created Successfully',
    data: result,
  });
});

const GetAllBooking = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user?.id;
  const result = await BookingSessionService.GetAllBooking(studentId as string);
  res.status(200).json({
    success: true,
    message: 'Booing fetched successfully',
    data: result,
  });
});

const UpdateBooking = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.params.bookingId;
  const bookingPayload = req.body;
  const result = await BookingSessionService.UpdateBooking(
    studentId as string,
    bookingPayload,
  );
  res.status(200).json({
    success: true,
    message: 'Booing updated successfully',
    data: result,
  });
});

export const BookingSessionController = {
  CreateSession,
  GetAllBooking,
  UpdateBooking,
};
