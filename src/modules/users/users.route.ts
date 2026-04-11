import { Router } from 'express';
import auth, { UserRole } from '../../middlewares/auth';
import { UsersController } from './users.controller';

const router = Router();
router.get(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER),
  UsersController.GetAllUsers,
);
router.patch(
  '/:userId',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UsersController.UpdateUserStatus,
);
router.patch(
  '/:userId/role',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UsersController.UpdateUserRole,
);
router.patch(
  '/update-student/:userId',
  auth(
    UserRole.STUDENT,
    UserRole.TUTOR,
    UserRole.ORGANIZER,
    UserRole.MANAGER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  UsersController.UpdateUserProfile,
);

export const UsersRouters = router;
