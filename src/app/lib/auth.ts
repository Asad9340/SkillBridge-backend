import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { bearer, emailOTP } from 'better-auth/plugins';
import { Role, UserStatus } from '../../../generated/prisma/enums';
import { envVars } from '../config/env.config';
import { prisma } from './prisma';
import { sendEmail } from '../utils/email';

const localDevOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:4000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:4000',
  'http://127.0.0.1:5000',
];

const trustedOrigins = [
  envVars.BETTER_AUTH_URL,
  envVars.FRONTEND_URL,
  ...envVars.TRUSTED_ORIGINS.split(',').map(origin => origin.trim()),
  ...localDevOrigins,
].filter(Boolean);

const hasGoogleOAuth =
  Boolean(envVars.GOOGLE_CLIENT_ID) && Boolean(envVars.GOOGLE_CLIENT_SECRET);

const betterAuthBaseURL =
  envVars.NODE_ENV === 'production'
    ? envVars.BETTER_AUTH_URL
    : `http://localhost:${envVars.PORT}`;

export const auth = betterAuth({
  baseURL: betterAuthBaseURL,
  basePath: '/api/auth',
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: Role.STUDENT,
      },
      phone: {
        type: 'string',
        required: false,
      },
      status: {
        type: 'string',
        required: true,
        defaultValue: UserStatus.ACTIVE,
      },
      bio: {
        type: 'string',
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    // Enable email verification for better security
    requireEmailVerification: true,
  },
  socialProviders: hasGoogleOAuth
    ? {
        google: {
          clientId: envVars.GOOGLE_CLIENT_ID,
          clientSecret: envVars.GOOGLE_CLIENT_SECRET,
          mapProfileToUser: () => ({
            role: Role.STUDENT,
            status: UserStatus.ACTIVE,
            emailVerified: true,
          }),
        },
      }
    : undefined,
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: false,
      async sendVerificationOTP({ email, otp, type }) {
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return;
        }

        if (type === 'email-verification' && !user.emailVerified) {
          await sendEmail({
            to: email,
            subject: 'Verify your SkillBridge email',
            templateName: 'otp',
            templateData: {
              name: user.name,
              otp,
            },
          });
        }

        if (type === 'forget-password') {
          await sendEmail({
            to: email,
            subject: 'SkillBridge password reset OTP',
            templateName: 'otp',
            templateData: {
              name: user.name,
              otp,
            },
          });
        }
      },
      expiresIn: 2 * 60,
      otpLength: 6,
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24,
    },
  },
  trustedOrigins,
  advanced: {
    trustProxy: true,
    useSecureCookies: envVars.NODE_ENV === 'production',
    cookies: {
      state: {
        attributes: {
          sameSite: envVars.NODE_ENV === 'production' ? 'none' : 'lax',
          secure: envVars.NODE_ENV === 'production',
          httpOnly: true,
          path: '/',
        },
      },
      sessionToken: {
        attributes: {
          sameSite: envVars.NODE_ENV === 'production' ? 'none' : 'lax',
          secure: envVars.NODE_ENV === 'production',
          httpOnly: true,
          path: '/',
        },
      },
    },
  },
});
