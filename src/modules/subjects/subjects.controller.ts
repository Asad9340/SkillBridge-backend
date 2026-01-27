import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { SubjectsService } from './subjects.service';

const GetAllSubjects = catchAsync(async (req: Request, res: Response) => {
  const result = await SubjectsService.GetAllSubjects();
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const CreateSubject = catchAsync(async (req: Request, res: Response) => {
  const subjectPayload = req.body;
  const result = await SubjectsService.CreateSubject(subjectPayload);
  res.status(201).json({
    status: 'success',
    message: 'Subject created successfully',
    data: result,
  });
});

const UpdateSubject = catchAsync(async (req: Request, res: Response) => {
  const subjectId = req.params.subjectId;
  const subjectPayload = req.body;
  const result = await SubjectsService.UpdateSubject(
    subjectId as string,
    subjectPayload,
  );
  res.status(200).json({
    status: 'success',
    message: 'Subject updated successfully',
    data: result,
  });
});

const DeleteSubject = catchAsync(async (req: Request, res: Response) => {
  const subjectId = req.params.subjectId;
  await SubjectsService.DeleteSubject(subjectId as string);
  res.status(200).json({
    status: 'success',
    message: 'Subject deleted successfully',
  });
});

export const SubjectsController = {
  GetAllSubjects,
  CreateSubject,
  UpdateSubject,
  DeleteSubject,
};
