import { envVars } from '../../app/config/env.config';

type TChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type TOpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const SKILLBRIDGE_PROMPT =
  'You are SkillBridge Assistant. Help with tutor discovery, booking prep, learning plans, interview prep, and profile improvements. Keep answers practical, concise, and student-friendly.';

const normalizeContent = (content: unknown): string => {
  if (typeof content === 'string') {
    return content;
  }

  if (!Array.isArray(content)) {
    return '';
  }

  return content
    .map(item => {
      if (
        item &&
        typeof item === 'object' &&
        'type' in item &&
        'text' in item &&
        (item as { type?: unknown }).type === 'text'
      ) {
        return String((item as { text?: unknown }).text || '');
      }

      return '';
    })
    .join('');
};

const requestOpenRouter = async (
  apiKey: string,
  modelName: string,
  messages: TChatMessage[],
) => {
  const response = await fetch(envVars.OPENROUTER.API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': envVars.FRONTEND_URL,
      'X-Title': 'SkillBridge Assistant',
    },
    body: JSON.stringify({
      model: modelName,
      messages,
      temperature: 0.45,
      max_tokens: 280,
    }),
  });

  const rawBody = await response.text();

  if (!response.ok) {
    return {
      ok: false as const,
      statusCode: response.status,
      modelName,
      rawBody,
    };
  }

  const parsed = JSON.parse(rawBody) as TOpenRouterResponse;
  const reply = normalizeContent(parsed.choices?.[0]?.message?.content).trim();

  if (!reply) {
    return {
      ok: false as const,
      statusCode: 502,
      modelName,
      rawBody: 'OpenRouter returned empty response.',
    };
  }

  return {
    ok: true as const,
    modelName,
    reply,
  };
};

const getReply = async (payload: {
  message?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}) => {
  const message = payload.message?.trim() || '';

  if (!message) {
    throw new Error('Message is required');
  }

  const apiKey = envVars.OPENROUTER.API_KEY;
  if (!apiKey) {
    throw new Error(
      'Chatbot service is not configured. Missing OPENROUTER_API_KEY.',
    );
  }

  const history = (payload.history || [])
    .filter(item => item.content?.trim())
    .slice(-8)
    .map(item => ({
      role: item.role,
      content: item.content.trim(),
    }));

  const messages: TChatMessage[] = [
    {
      role: 'system',
      content: SKILLBRIDGE_PROMPT,
    },
    ...history,
    { role: 'user', content: message },
  ];

  const models = [
    envVars.OPENROUTER.MODEL,
    envVars.OPENROUTER.FALLBACK_MODEL,
  ].filter(Boolean);
  let lastError: string | null = null;

  for (const modelName of models) {
    const response = await requestOpenRouter(apiKey, modelName, messages);

    if (response.ok) {
      return { reply: response.reply };
    }

    lastError = `Model ${response.modelName} failed (${response.statusCode}).`;
  }

  return {
    reply:
      'I am temporarily unavailable. Please try again in a moment. ' +
      (lastError ? `(${lastError})` : ''),
  };
};

const generateStudyPlan = async (payload: {
  topic?: string;
  level?: string;
  days?: number;
  dailyMinutes?: number;
  goal?: string;
}) => {
  const topic = payload.topic?.trim() || '';
  if (!topic) {
    throw new Error('Topic is required');
  }

  const level = payload.level?.trim() || 'beginner';
  const days =
    typeof payload.days === 'number' && payload.days > 0
      ? Math.min(payload.days, 30)
      : 14;
  const dailyMinutes =
    typeof payload.dailyMinutes === 'number' && payload.dailyMinutes > 0
      ? Math.min(payload.dailyMinutes, 240)
      : 60;
  const goal = payload.goal?.trim() || 'Build consistent progress';

  const planPrompt = [
    `Create a ${days}-day study plan for: ${topic}.`,
    `Level: ${level}.`,
    `Daily time: ${dailyMinutes} minutes.`,
    `Goal: ${goal}.`,
    'Return concise markdown with sections: Overview, Day-by-Day Plan, Weekly Checkpoint, Common Mistakes to Avoid.',
  ].join(' ');

  return getReply({ message: planPrompt, history: [] });
};

const generateTutorProfileFeedback = async (payload: {
  bio?: string;
  subjects?: string;
  experience?: string;
  style?: string;
}) => {
  const bio = payload.bio?.trim() || '';
  if (!bio) {
    throw new Error('Bio is required');
  }

  const subjects = payload.subjects?.trim() || 'Not specified';
  const experience = payload.experience?.trim() || 'Not specified';
  const style = payload.style?.trim() || 'Friendly and practical';

  const reviewPrompt = [
    'You are helping improve a tutor profile on SkillBridge.',
    `Current bio: ${bio}`,
    `Subjects: ${subjects}`,
    `Experience: ${experience}`,
    `Teaching style: ${style}`,
    'Provide: 1) quick critique, 2) rewritten improved bio (120-180 words), 3) 5 profile headline options, 4) 3 trust-building tips.',
  ].join(' ');

  return getReply({ message: reviewPrompt, history: [] });
};

export const ChatbotService = {
  getReply,
  generateStudyPlan,
  generateTutorProfileFeedback,
};
