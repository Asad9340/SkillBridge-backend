import { Router } from 'express';
import { CategoriesRouter } from '../modules/categories/categories.route';
import { UsersRouter } from '../modules/users/users.route';

const router = Router();

router.use('/categories', CategoriesRouter);
router.use('/users', UsersRouter);

export { router };
