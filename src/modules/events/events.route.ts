import { Router } from 'express';
import auth, { UserRole } from '../../middlewares/auth';
import { EventsController } from './events.controller';

const router = Router();

router.get('/', EventsController.GetAllEvents);
router.post('/', auth(UserRole.ADMIN), EventsController.CreateEvent);
router.patch('/:eventId', auth(UserRole.ADMIN), EventsController.UpdateEvent);
router.delete('/:eventId', auth(UserRole.ADMIN), EventsController.DeleteEvent);

export const EventsRouters = router;
