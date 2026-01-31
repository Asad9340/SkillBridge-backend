import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { ReviewController } from "./reviews.controller";



const router = Router();

router.post("/",auth(UserRole.STUDENT), ReviewController.CreateReview)

export const ReviewRouters = router;