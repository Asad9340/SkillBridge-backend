import { envVars } from '../../app/config/env.config';

type TChatMessage = {
  role: 'user' | 'assistant';
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
      messages: [
        {
          role: 'system',
          content: SKILLBRIDGE_PROMPT,
        },
        ...messages,
      ],
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

export const ChatbotService = {
  getReply,
};
