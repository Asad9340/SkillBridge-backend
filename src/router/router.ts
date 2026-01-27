import { Router } from 'express';
import { CategoriesRouters } from '../modules/categories/categories.route';
import { UsersRouters } from '../modules/users/users.route';
import { TutorsProfileRouters } from '../modules/tutors-profile/tutors-profile.route';
import { TutorsAvailabilityRoutes } from '../modules/tutors-availability/tutors-availability.route';
import { SubjectsRouters } from '../modules/subjects/subjects.route';

const router = Router();

router.use('/categories', CategoriesRouters);
router.use('/subjects', SubjectsRouters);

router.use('/users', UsersRouters);

router.use('/tutors-profile', TutorsProfileRouters);

router.use('/tutors-availability', TutorsAvailabilityRoutes);


export { router };
