import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.NODEMAILER_GMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  trustedOrigins: [process.env.TRUSTED_ORIGINS || 'http://localhost:5000'],
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'STUDENT',
        required: false,
      },
      phone: {
        type: 'string',
        required: false,
      },
      status: {
        type: 'string',
        defaultValue: 'ACTIVE',
        required: false,
      },
      bio:{
        type:"string",
        required:false
      }
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationUrl = `${url}/verify-email?token=${token}`;

        await transporter.sendMail({
          from: '"Level 2" <no-reply@yourapp.com>',
          to: user.email,
          subject: 'Verify your email address',
          html: `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta charset="UTF-8" />
                    <title>Verify Email</title>
                  </head>
                  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <table width="600" style="background:#ffffff;border-radius:8px;padding:32px">
                            <tr>
                              <td>
                                <h2>Hello ${user.name || 'there'},</h2>
                                <p>Please verify your email address.</p>

                                <p style="margin:24px 0">
                                  <a href="${verificationUrl}"
                                    style="background:#4f46e5;color:#ffffff;
                                            padding:14px 28px;border-radius:6px;
                                            text-decoration:none;font-weight:bold">
                                    Verify Email
                                  </a>
                                </p>

                                <p>If the button doesn’t work, use this link:</p>
                                <p>${verificationUrl}</p>

                                <p>This link expires in <strong>15 minutes</strong>.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                  </html>
        `,
        });
      } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Could not send verification email');
      }
    },
  },
  socialProviders: {
    google: {
      prompt: 'select_account consent',
      accessType: 'offline',
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
