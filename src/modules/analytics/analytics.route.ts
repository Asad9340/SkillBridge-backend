import { Router } from 'express';
import auth, { UserRole } from '../../middlewares/auth';
import { AnalyticsController } from './analytics.controller';

const router = Router();

router.get(
  '/tutor/:tutorId',
  auth(UserRole.TUTOR),
  AnalyticsController.GetTutorAnalytics,
);
router.get(
  '/student',
  auth(UserRole.STUDENT),
  AnalyticsController.GetStudentAnalytics,
);
router.get(
  '/admin',
  auth(UserRole.ADMIN),
  AnalyticsController.GetAdminAnalytics,
);

export const AnalyticsRouters = router;
