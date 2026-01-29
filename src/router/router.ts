import { Router } from 'express';
import { CategoriesRouters } from '../modules/categories/categories.route';
import { UsersRouters } from '../modules/users/users.route';
import { TutorsProfileRouters } from '../modules/tutors-profile/tutors-profile.route';
import { TutorsAvailabilityRoutes } from '../modules/tutors-availability/tutors-availability.route';
import { SubjectsRouters } from '../modules/subjects/subjects.route';
import { UserProfileRouter } from '../modules/user-profile/user-profile.route';
import { BookingSessionRouter } from '../modules/booking-session/booking-session.route';

const router = Router();

router.use('/categories', CategoriesRouters);
router.use('/subjects', SubjectsRouters);
router.use('/manage-users', UsersRouters);
router.use('/student-profile', UserProfileRouter)
router.use('/tutors-profile', TutorsProfileRouters);
router.use('/tutors-availability', TutorsAvailabilityRoutes);
router.use("/booking-session",BookingSessionRouter)


export { router };
