import { Router } from 'express';
import { SubjectsController } from './subjects.controller';
import auth, { UserRole } from '../../middlewares/auth';

const router = Router();

router.get('/', SubjectsController.GetAllSubjects);
router.post('/', auth(UserRole.ADMIN), SubjectsController.CreateSubject);
router.patch(
  '/:subjectId',
  auth(UserRole.ADMIN),
  SubjectsController.UpdateSubject,
);
router.delete('/:subjectId', SubjectsController.DeleteSubject);

export const SubjectsRouters = router;
