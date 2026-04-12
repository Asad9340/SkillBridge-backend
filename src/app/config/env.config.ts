import dotenv from 'dotenv';
import AppError from '../errorHelpers/AppError';

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;
  FRONTEND_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  TRUSTED_ORIGINS: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  ACCESS_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_SECRET: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  EMAIL_SENDER: {
    SMTP_USER: string;
    SMTP_PASS: string;
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_FROM: string;
  };
  CLOUDINARY: {
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
  };
  OPENROUTER: {
    API_KEY: string;
    API_URL: string;
    MODEL: string;
    FALLBACK_MODEL: string;
  };
}

const required = ['DATABASE_URL'];

required.forEach(variable => {
  if (!process.env[variable]) {
    throw new AppError(
      500,
      `Environment variable ${variable} is required but not set in .env file.`,
    );
  }
});

const toBoolean = (value: string | undefined, defaultValue: boolean) => {
  if (!value) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  return !(normalized === 'false' || normalized === '0' || normalized === 'no');
};

export const envVars: EnvConfig & { IS_PRODUCTION: boolean } = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '5000',
  DATABASE_URL: process.env.DATABASE_URL as string,
  FRONTEND_URL:
    process.env.FRONTEND_URL?.trim() ||
    process.env.PROD_APP_URL?.trim() ||
    'http://localhost:3000',
  BETTER_AUTH_SECRET:
    process.env.BETTER_AUTH_SECRET || 'thisisasecretforbetterauth',
  BETTER_AUTH_URL:
    process.env.BETTER_AUTH_URL?.trim() || 'http://localhost:5000',
  TRUSTED_ORIGINS:
    process.env.TRUSTED_ORIGINS?.trim() ||
    process.env.FRONTEND_URL?.trim() ||
    process.env.PROD_APP_URL?.trim() ||
    'http://localhost:3000',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  ACCESS_TOKEN_SECRET:
    process.env.ACCESS_TOKEN_SECRET ||
    process.env.JWT_ACCESS_SECRET ||
    'skillbridge-access-secret',
  ACCESS_TOKEN_EXPIRES_IN:
    process.env.ACCESS_TOKEN_EXPIRES_IN ||
    process.env.JWT_ACCESS_EXPIRES_IN ||
    '1d',
  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET ||
    process.env.JWT_REFRESH_SECRET ||
    'skillbridge-refresh-secret',
  REFRESH_TOKEN_EXPIRES_IN:
    process.env.REFRESH_TOKEN_EXPIRES_IN ||
    process.env.JWT_REFRESH_EXPIRES_IN ||
    '7d',
  EMAIL_SENDER: {
    SMTP_USER:
      process.env.EMAIL_SENDER_SMTP_USER || process.env.NODEMAILER_GMAIL || '',
    SMTP_PASS:
      process.env.EMAIL_SENDER_SMTP_PASS ||
      process.env.NODEMAILER_PASSWORD ||
      '',
    SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT || '587',
    SMTP_FROM:
      process.env.EMAIL_SENDER_SMTP_FROM ||
      process.env.NODEMAILER_GMAIL ||
      'no-reply@skillbridge.local',
  },
  CLOUDINARY: {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME?.trim() || '',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY?.trim() || '',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET?.trim() || '',
  },
  OPENROUTER: {
    API_KEY: process.env.OPENROUTER_API_KEY?.trim() || '',
    API_URL:
      process.env.OPENROUTER_API_URL?.trim() ||
      'https://openrouter.ai/api/v1/chat/completions',
    MODEL: process.env.OPENROUTER_MODEL?.trim() || 'openai/gpt-4o-mini',
    FALLBACK_MODEL:
      process.env.OPENROUTER_FALLBACK_MODEL?.trim() ||
      'deepseek/deepseek-chat-v3-0324:free',
  },
  IS_PRODUCTION: toBoolean(process.env.NODE_ENV, false),
};
