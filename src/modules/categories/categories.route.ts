import { Router } from 'express';
import { CategoriesController } from './categories.controller';
import auth, { UserRole } from '../../middlewares/auth';

const router = Router();

router.get('/', CategoriesController.GetAllCategories);

router.post('/', auth(UserRole.ADMIN), CategoriesController.CreateCategory);
router.patch('/:id', auth(UserRole.ADMIN), CategoriesController.UpdateCategory);

router.delete(
  '/:id',
  auth(UserRole.ADMIN),
  CategoriesController.DeleteCategory,
);

export const CategoriesRouter = router;
