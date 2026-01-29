import { Router } from 'express';
import { TutorsProfileController } from './tutors-profile.controller';
import auth, { UserRole } from '../../middlewares/auth';

const router = Router();

router.get(
  '/:tutorId',
  auth(UserRole.TUTOR),
  TutorsProfileController.GetTutorProfileById,
);
router.post(
  '/',
  auth(UserRole.TUTOR),
  TutorsProfileController.CreateTutorProfile,
);
router.patch(
  '/:tutorId',
  auth(UserRole.TUTOR),
  TutorsProfileController.UpdateTutorProfile,
);
router.patch(
  '/subjects/:tutorId',
  auth(UserRole.TUTOR),
  TutorsProfileController.UpdateUserprofileForSubjects,
);

export const TutorsProfileRouters = router;
