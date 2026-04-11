import { Router } from 'express';
import auth, { UserRole } from '../../middlewares/auth';
import { StudentProfileController } from './user-profile.controller';
import { upload } from '../../app/config/multer.config';

const router = Router();

router.patch(
  '/:studentId',
  auth(
    UserRole.STUDENT,
    UserRole.TUTOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.MANAGER,
    UserRole.ORGANIZER,
  ),
  StudentProfileController.UpdateStudentProfile,
);

router.post(
  '/:studentId/avatar',
  auth(
    UserRole.STUDENT,
    UserRole.TUTOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.MANAGER,
    UserRole.ORGANIZER,
  ),
  upload.single('image'),
  StudentProfileController.UploadStudentAvatar,
);

export const UserProfileRouter = router;
