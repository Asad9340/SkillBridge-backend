import { prisma } from '../../../lib/prisma';

interface ICategoryPayload {
  name: string;
  description?: string;
}

const GetAllCategories = async () => {
  const result = await prisma.category.findMany();
  return result;
}

const CreateCategory = async (categoryPayload: ICategoryPayload) => {
  const result = await prisma.category.create({
    data: categoryPayload,
  });
  return result;
};

const UpdateCategory = async (
  categoryId: string,
  categoryPayload: ICategoryPayload,
) => {
  const result = await prisma.category.update({
    where: { id: categoryId },
    data: categoryPayload,
  });
  return result;
};

const DeleteCategory = async (categoryId: string) => {
  await prisma.category.delete({
    where: { id: categoryId },
  });
};

export const CategoriesService = {
  GetAllCategories,
  CreateCategory,
  UpdateCategory,
  DeleteCategory,
};
