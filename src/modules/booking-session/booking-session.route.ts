import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { BookingSessionController } from "./booking-session.controller";


const router = Router();
router.post('/', auth(UserRole.STUDENT), BookingSessionController.CreateSession);
router.get('/',auth(UserRole.STUDENT), BookingSessionController.GetAllBooking)


export const BookingSessionRouter = router;