import { Router } from 'express';
import { CategoriesRouter } from '../modules/categories/categories.route';

const router = Router();

router.use('/categories', CategoriesRouter);

export { router };
