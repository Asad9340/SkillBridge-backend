import { Router } from 'express';
import { TutorsController } from './tutors.controller';
import auth, { UserRole } from '../../middlewares/auth';

const router = Router();

router.post('/', auth(UserRole.TUTOR), TutorsController.CreateTutorProfile);
router.patch(
  '/:tutorId',
  auth(UserRole.TUTOR),
  TutorsController.UpdateTutorProfile,
);

export const TutorsRouter = router;
