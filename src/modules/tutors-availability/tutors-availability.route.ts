import { Router } from 'express';
import { TutorsAvailabilityController } from './tutors-availability.controller';
import auth, { UserRole } from '../../middlewares/auth';

const router = Router();

router.get(
  '/',
  auth(UserRole.STUDENT),
  TutorsAvailabilityController.GetAllAvailability,
);

router.get(
  '/:tutorId',
  auth(UserRole.TUTOR),
  TutorsAvailabilityController.GetTutorAvailabilityByTutorId,
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
