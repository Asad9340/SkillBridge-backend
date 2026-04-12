import { Router } from 'express';
import { ChatbotController } from './chatbot.controller';
import { chatbotRateLimit } from '../../app/middleware/chatbotRateLimit';

const router = Router();

router.post('/message', chatbotRateLimit, ChatbotController.sendMessage);
router.post(
  '/study-plan',
  chatbotRateLimit,
  ChatbotController.generateStudyPlan,
);
router.post(
  '/profile-feedback',
  chatbotRateLimit,
  ChatbotController.generateTutorProfileFeedback,
);

export const ChatbotRoutes = router;
