import { Router } from 'express';
import auth, { UserRole } from '../../middlewares/auth';
import { UsersController } from './users.controller';

const router = Router();
router.get('/', auth(UserRole.ADMIN), UsersController.GetAllUsers);
router.patch(
  '/:userId',
  auth(UserRole.ADMIN),
  UsersController.UpdateUserStatus,
);
router.patch(
  '/update-student/:userId',
  auth(UserRole.STUDENT),
  UsersController.UpdateUserProfile,
);

export const UsersRouters = router;
