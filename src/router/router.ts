import { Router } from 'express';
import { CategoriesRouter } from '../modules/categories/categories.route';
import { UsersRouter } from '../modules/users/users.route';
import { TutorsRouter } from '../modules/tutors-profile/tutors-profile.route';

const router = Router();

router.use('/categories', CategoriesRouter);
router.use('/users', UsersRouter);

router.use('/tutors', TutorsRouter);

export { router };
