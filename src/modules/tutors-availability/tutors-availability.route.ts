import { Router } from 'express';
import { TutorsAvailabilityController } from './tutors-availability.controller';
import auth, { UserRole } from '../../middlewares/auth';

const router = Router();

router.get(
  '/:availabilityId',
  auth(UserRole.TUTOR, UserRole.STUDENT),
  TutorsAvailabilityController.GetTutorAvailabilityById,
);

router.post(
  '/',
  auth(UserRole.TUTOR),
  TutorsAvailabilityController.CreateTutorAvailability,
);

router.patch(
  '/:availabilityId',
  auth(UserRole.TUTOR),
  TutorsAvailabilityController.UpdateTutorAvailability,
);

router.delete(
  '/:availabilityId',
  auth(UserRole.TUTOR),
  TutorsAvailabilityController.DeleteTutorAvailability,
);

export const TutorsAvailabilityRoutes = router;
