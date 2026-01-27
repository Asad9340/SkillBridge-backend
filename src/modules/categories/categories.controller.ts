import { Request, Response } from 'express';
import { CategoriesService } from './categories.service';
import { catchAsync } from '../../utils/catchAsync';

const GetAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoriesService.GetAllCategories();
  res.status(200).json({
    success: true,
    message: 'Categories fetched successfully',
    data: result,
  });
});

const CreateCategory = catchAsync(async (req: Request, res: Response) => {
  const categoryPayload = req.body;
  const result = await CategoriesService.CreateCategory(categoryPayload);
  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: result,
  });
});

const UpdateCategory = catchAsync(async (req: Request, res: Response) => {
  const categoryId = req.params.id;
  const categoryPayload = req.body;
  const result = await CategoriesService.UpdateCategory(
    categoryId as string,
    categoryPayload,
  );
  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: result,
  });
});

const DeleteCategory = catchAsync(async (req: Request, res: Response) => {
  const categoryId = req.params.id;
  await CategoriesService.DeleteCategory(categoryId as string);
  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
  });
});

export const CategoriesController = {
  GetAllCategories,
  CreateCategory,
  UpdateCategory,
  DeleteCategory,
};
