import { Router } from 'express';
import { ChatbotController } from './chatbot.controller';
import { chatbotRateLimit } from '../../app/middleware/chatbotRateLimit';

const router = Router();

router.post('/message', chatbotRateLimit, ChatbotController.sendMessage);

export const ChatbotRoutes = router;
