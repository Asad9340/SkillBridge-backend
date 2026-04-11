import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { EventsService } from './events.service';

const GetAllEvents = catchAsync(async (req: Request, res: Response) => {
  const result = await EventsService.GetAllEvents(req.query as any);

  res.status(200).json({
    success: true,
    message: 'Events fetched successfully',
    data: result,
  });
});

const CreateEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventsService.CreateEvent(req.body);

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: result,
  });
});

const UpdateEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventsService.UpdateEvent(
    req.params.eventId as string,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: 'Event updated successfully',
    data: result,
  });
});

const DeleteEvent = catchAsync(async (req: Request, res: Response) => {
  await EventsService.DeleteEvent(req.params.eventId as string);

  res.status(200).json({
    success: true,
    message: 'Event deleted successfully',
  });
});

export const EventsController = {
  GetAllEvents,
  CreateEvent,
  UpdateEvent,
  DeleteEvent,
};
