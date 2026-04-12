import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ChatbotService } from './chatbot.service';

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as {
    message?: string;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  };

  const result = await ChatbotService.getReply(payload);

  res.status(200).json({
    success: true,
    message: 'Chatbot response generated successfully',
    data: result,
  });
});

const generateStudyPlan = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as {
    topic?: string;
    level?: string;
    days?: number;
    dailyMinutes?: number;
    goal?: string;
  };

  const result = await ChatbotService.generateStudyPlan(payload);

  res.status(200).json({
    success: true,
    message: 'Study plan generated successfully',
    data: result,
  });
});

const generateTutorProfileFeedback = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body as {
      bio?: string;
      subjects?: string;
      experience?: string;
      style?: string;
    };

    const result = await ChatbotService.generateTutorProfileFeedback(payload);

    res.status(200).json({
      success: true,
      message: 'Tutor profile feedback generated successfully',
      data: result,
    });
  },
);

export const ChatbotController = {
  sendMessage,
  generateStudyPlan,
  generateTutorProfileFeedback,
};
