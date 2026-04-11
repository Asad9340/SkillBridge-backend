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

export const ChatbotController = {
  sendMessage,
};
