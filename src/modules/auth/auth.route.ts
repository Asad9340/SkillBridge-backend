import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();

router.post('/login', AuthController.Login);
router.post('/register', AuthController.Register);
router.get('/me', AuthController.GetMe);
router.post('/refresh-token', AuthController.RefreshToken);

export const AuthRouters = router;
