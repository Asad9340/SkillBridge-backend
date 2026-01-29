import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { StudentProfileController } from "./user-profile.controller";



const router = Router();

router.post("/:studentId", auth(UserRole.STUDENT), StudentProfileController.UpdateStudentProfile)

export const UserProfileRouter = router;