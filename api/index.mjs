// src/app.ts
import express from "express";
import path3 from "path";
import qs from "qs";
import { toNodeHandler } from "better-auth/node";
import cookieParser from "cookie-parser";
import cors from "cors";

// src/app/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";

// generated/prisma/enums.ts
var Role = {
  SUPER_ADMIN: "SUPER_ADMIN",
  MANAGER: "MANAGER",
  ORGANIZER: "ORGANIZER",
  STUDENT: "STUDENT",
  TUTOR: "TUTOR",
  ADMIN: "ADMIN"
};
var UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED"
};

// src/app/config/env.config.ts
import dotenv from "dotenv";

// src/app/errorHelpers/AppError.ts
var AppError = class extends Error {
  statusCode;
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var AppError_default = AppError;

// src/app/config/env.config.ts
dotenv.config();
var required = ["DATABASE_URL"];
required.forEach((variable) => {
  if (!process.env[variable]) {
    throw new AppError_default(
      500,
      `Environment variable ${variable} is required but not set in .env file.`
    );
  }
});
var toBoolean = (value, defaultValue) => {
  if (!value) {
    return defaultValue;
  }
  const normalized = value.trim().toLowerCase();
  return !(normalized === "false" || normalized === "0" || normalized === "no");
};
var envVars = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "5000",
  DATABASE_URL: process.env.DATABASE_URL,
  FRONTEND_URL: process.env.FRONTEND_URL?.trim() || process.env.PROD_APP_URL?.trim() || "http://localhost:3000",
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "thisisasecretforbetterauth",
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL?.trim() || "http://localhost:5000",
  TRUSTED_ORIGINS: process.env.TRUSTED_ORIGINS?.trim() || process.env.FRONTEND_URL?.trim() || process.env.PROD_APP_URL?.trim() || "http://localhost:3000",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || process.env.JWT_ACCESS_SECRET || "skillbridge-access-secret",
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || process.env.JWT_ACCESS_EXPIRES_IN || "1d",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || process.env.JWT_REFRESH_SECRET || "skillbridge-refresh-secret",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  EMAIL_SENDER: {
    SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER || process.env.NODEMAILER_GMAIL || "",
    SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS || process.env.NODEMAILER_PASSWORD || "",
    SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST || "smtp.gmail.com",
    SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT || "587",
    SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM || process.env.NODEMAILER_GMAIL || "no-reply@skillbridge.local"
  },
  CLOUDINARY: {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME?.trim() || "",
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY?.trim() || "",
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET?.trim() || ""
  },
  OPENROUTER: {
    API_KEY: process.env.OPENROUTER_API_KEY?.trim() || "",
    API_URL: process.env.OPENROUTER_API_URL?.trim() || "https://openrouter.ai/api/v1/chat/completions",
    MODEL: process.env.OPENROUTER_MODEL?.trim() || "openai/gpt-4o-mini",
    FALLBACK_MODEL: process.env.OPENROUTER_FALLBACK_MODEL?.trim() || "deepseek/deepseek-chat-v3-0324:free"
  },
  IS_PRODUCTION: toBoolean(process.env.NODE_ENV, false)
};

// src/app/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.3.0",
  "engineVersion": "9d6ad21cbbceab97458517b147a6a09ff43aa735",
  "activeProvider": "postgresql",
  "inlineSchema": 'enum BookingStatus {\n  PENDING\n  CONFIRMED\n  COMPLETED\n  CANCELLED\n}\n\nmodel Booking {\n  id             String        @id @default(uuid())\n  studentId      String\n  tutorId        String\n  subjectId      String\n  availabilityId String\n  status         BookingStatus @default(PENDING)\n  createdAt      DateTime      @default(now())\n  updatedAt      DateTime      @default(now())\n\n  student      User         @relation("StudentBookings", fields: [studentId], references: [id])\n  tutor        TutorProfile @relation("TutorBookings", fields: [tutorId], references: [id])\n  subject      Subject      @relation(fields: [subjectId], references: [id])\n  availability Availability @relation(fields: [availabilityId], references: [id])\n\n  @@unique([availabilityId])\n}\n\nmodel Review {\n  id        String       @id @default(uuid())\n  student   User         @relation("StudentReviews", fields: [studentId], references: [id])\n  studentId String\n  tutor     TutorProfile @relation("TutorReviews", fields: [tutorId], references: [id])\n  tutorId   String\n  rating    Int          @default(5)\n  comment   String?\n  createdAt DateTime     @default(now())\n  updatedAt DateTime     @updatedAt\n}\n\nenum EventStatus {\n  UPCOMING\n  ONGOING\n  COMPLETED\n  CANCELLED\n}\n\nmodel Event {\n  id          String      @id @default(uuid())\n  title       String\n  description String\n  category    String\n  location    String\n  startsAt    DateTime\n  endsAt      DateTime\n  price       Float       @default(0)\n  rating      Float       @default(0)\n  status      EventStatus @default(UPCOMING)\n  mediaUrls   String[]\n  createdAt   DateTime    @default(now())\n  updatedAt   DateTime    @updatedAt\n\n  @@index([category])\n  @@index([status])\n  @@index([startsAt])\n  @@index([location])\n}\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel Category {\n  id          String  @id @default(uuid())\n  name        String  @unique\n  description String?\n\n  subjects Subject[]\n}\n\nmodel Subject {\n  id             String         @id @default(uuid())\n  name           String\n  categoryId     String\n  category       Category       @relation(fields: [categoryId], references: [id])\n  tutors         TutorSubject[]\n  bookings       Booking[]\n  availabilities Availability[]\n}\n\nmodel TutorSubject {\n  id        String @id @default(uuid())\n  tutorId   String\n  subjectId String\n\n  tutor   TutorProfile @relation(fields: [tutorId], references: [id])\n  subject Subject      @relation(fields: [subjectId], references: [id])\n\n  @@unique([tutorId, subjectId])\n}\n\nmodel TutorProfile {\n  id           String   @id @default(uuid())\n  userId       String   @unique\n  user         User     @relation(fields: [userId], references: [id])\n  bio          String?\n  hourlyRate   Float\n  rating       Float    @default(0)\n  totalReviews Int      @default(0)\n  createdAt    DateTime @default(now())\n  updatedAt    DateTime @updatedAt\n\n  subjects     TutorSubject[]\n  availability Availability[]\n  bookings     Booking[]      @relation("TutorBookings")\n  reviews      Review[]       @relation("TutorReviews")\n}\n\nmodel Availability {\n  id        String   @id @default(uuid())\n  tutorId   String\n  subjectId String\n  date      DateTime\n  startTime String\n  endTime   String\n  isBooked  Boolean  @default(false)\n\n  tutor   TutorProfile @relation(fields: [tutorId], references: [id])\n  subject Subject      @relation(fields: [subjectId], references: [id])\n  booking Booking?\n\n  @@index([tutorId])\n}\n\nenum Role {\n  SUPER_ADMIN\n  MANAGER\n  ORGANIZER\n  STUDENT\n  TUTOR\n  ADMIN\n}\n\nenum UserStatus {\n  ACTIVE\n  INACTIVE\n  SUSPENDED\n}\n\nmodel User {\n  id            String      @id\n  name          String\n  email         String      @unique\n  emailVerified Boolean     @default(false)\n  image         String?\n  role          Role?       @default(STUDENT)\n  phone         String?\n  status        UserStatus? @default(ACTIVE)\n  bio           String?\n  createdAt     DateTime    @default(now())\n  updatedAt     DateTime    @updatedAt\n\n  tutorProfile TutorProfile?\n  bookings     Booking[]     @relation("StudentBookings")\n  reviews      Review[]      @relation("StudentReviews")\n  sessions     Session[]\n  accounts     Account[]\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String   @unique\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"Booking":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"subjectId","kind":"scalar","type":"String"},{"name":"availabilityId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"BookingStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"student","kind":"object","type":"User","relationName":"StudentBookings"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"TutorBookings"},{"name":"subject","kind":"object","type":"Subject","relationName":"BookingToSubject"},{"name":"availability","kind":"object","type":"Availability","relationName":"AvailabilityToBooking"}],"dbName":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"User","relationName":"StudentReviews"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"TutorReviews"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Event":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"category","kind":"scalar","type":"String"},{"name":"location","kind":"scalar","type":"String"},{"name":"startsAt","kind":"scalar","type":"DateTime"},{"name":"endsAt","kind":"scalar","type":"DateTime"},{"name":"price","kind":"scalar","type":"Float"},{"name":"rating","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"EventStatus"},{"name":"mediaUrls","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"subjects","kind":"object","type":"Subject","relationName":"CategoryToSubject"}],"dbName":null},"Subject":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToSubject"},{"name":"tutors","kind":"object","type":"TutorSubject","relationName":"SubjectToTutorSubject"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToSubject"},{"name":"availabilities","kind":"object","type":"Availability","relationName":"AvailabilityToSubject"}],"dbName":null},"TutorSubject":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"subjectId","kind":"scalar","type":"String"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"TutorProfileToTutorSubject"},{"name":"subject","kind":"object","type":"Subject","relationName":"SubjectToTutorSubject"}],"dbName":null},"TutorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"TutorProfileToUser"},{"name":"bio","kind":"scalar","type":"String"},{"name":"hourlyRate","kind":"scalar","type":"Float"},{"name":"rating","kind":"scalar","type":"Float"},{"name":"totalReviews","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"subjects","kind":"object","type":"TutorSubject","relationName":"TutorProfileToTutorSubject"},{"name":"availability","kind":"object","type":"Availability","relationName":"AvailabilityToTutorProfile"},{"name":"bookings","kind":"object","type":"Booking","relationName":"TutorBookings"},{"name":"reviews","kind":"object","type":"Review","relationName":"TutorReviews"}],"dbName":null},"Availability":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"subjectId","kind":"scalar","type":"String"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"startTime","kind":"scalar","type":"String"},{"name":"endTime","kind":"scalar","type":"String"},{"name":"isBooked","kind":"scalar","type":"Boolean"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"AvailabilityToTutorProfile"},{"name":"subject","kind":"object","type":"Subject","relationName":"AvailabilityToSubject"},{"name":"booking","kind":"object","type":"Booking","relationName":"AvailabilityToBooking"}],"dbName":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"phone","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"bio","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorProfileToUser"},{"name":"bookings","kind":"object","type":"Booking","relationName":"StudentBookings"},{"name":"reviews","kind":"object","type":"Review","relationName":"StudentReviews"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"}],"dbName":null},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":null},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/app/lib/prisma.ts
var connectionString = envVars.DATABASE_URL;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/app/utils/email.ts
import nodemailer from "nodemailer";
import ejs from "ejs";
import path2 from "path";
var transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  secure: Number(envVars.EMAIL_SENDER.SMTP_PORT) === 465,
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS
  },
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT)
});
var sendEmail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments
}) => {
  try {
    const templatePath = path2.resolve(
      process.cwd(),
      `src/app/templates/${templateName}.ejs`
    );
    const html = await ejs.renderFile(templatePath, templateData);
    await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to,
      subject,
      html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType
      }))
    });
  } catch (error) {
    throw new AppError_default(500, "Failed to send email.");
  }
};

// src/app/lib/auth.ts
var localDevOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:4000",
  "http://localhost:5000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002",
  "http://127.0.0.1:4000",
  "http://127.0.0.1:5000"
];
var trustedOrigins = [
  envVars.BETTER_AUTH_URL,
  envVars.FRONTEND_URL,
  ...envVars.TRUSTED_ORIGINS.split(",").map((origin) => origin.trim()),
  ...localDevOrigins
].filter(Boolean);
var hasGoogleOAuth = Boolean(envVars.GOOGLE_CLIENT_ID) && Boolean(envVars.GOOGLE_CLIENT_SECRET);
var betterAuthBaseURL = envVars.NODE_ENV === "production" ? envVars.BETTER_AUTH_URL : `http://localhost:${envVars.PORT}`;
var auth = betterAuth({
  baseURL: betterAuthBaseURL,
  basePath: "/api/auth",
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.STUDENT
      },
      phone: {
        type: "string",
        required: false
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE
      },
      bio: {
        type: "string",
        required: false
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    // Enable email verification for better security
    requireEmailVerification: false
  },
  socialProviders: hasGoogleOAuth ? {
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      mapProfileToUser: () => ({
        role: Role.STUDENT,
        status: UserStatus.ACTIVE,
        emailVerified: true
      })
    }
  } : void 0,
  emailVerification: {
    sendOnSignUp: false,
    sendOnSignIn: false,
    autoSignInAfterVerification: false
  },
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: false,
      async sendVerificationOTP({ email, otp, type }) {
        const user = await prisma.user.findUnique({
          where: { email }
        });
        if (!user) {
          return;
        }
        if (type === "email-verification" && !user.emailVerified) {
          await sendEmail({
            to: email,
            subject: "Verify your SkillBridge email",
            templateName: "otp",
            templateData: {
              name: user.name,
              otp
            }
          });
        }
        if (type === "forget-password") {
          await sendEmail({
            to: email,
            subject: "SkillBridge password reset OTP",
            templateName: "otp",
            templateData: {
              name: user.name,
              otp
            }
          });
        }
      },
      expiresIn: 2 * 60,
      otpLength: 6
    })
  ],
  session: {
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24
    }
  },
  trustedOrigins,
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: Role.STUDENT,
              emailVerified: true
            }
          };
        }
      }
    }
  },
  advanced: {
    useSecureCookies: envVars.NODE_ENV === "production",
    cookies: {
      state: {
        attributes: {
          sameSite: envVars.NODE_ENV === "production" ? "none" : "lax",
          secure: envVars.NODE_ENV === "production",
          httpOnly: true,
          path: "/"
        }
      },
      sessionToken: {
        attributes: {
          sameSite: envVars.NODE_ENV === "production" ? "none" : "lax",
          secure: envVars.NODE_ENV === "production",
          httpOnly: true,
          path: "/"
        }
      }
    }
  }
});

// src/app/routes/index.ts
import { Router as Router13 } from "express";

// src/modules/categories/categories.route.ts
import { Router } from "express";

// src/modules/categories/categories.service.ts
var GetAllCategories = async () => {
  const result = await prisma.category.findMany();
  return result;
};
var CreateCategory = async (categoryPayload) => {
  const result = await prisma.category.create({
    data: categoryPayload
  });
  return result;
};
var UpdateCategory = async (categoryId, categoryPayload) => {
  const result = await prisma.category.update({
    where: { id: categoryId },
    data: categoryPayload
  });
  return result;
};
var DeleteCategory = async (categoryId) => {
  await prisma.category.delete({
    where: { id: categoryId }
  });
};
var CategoriesService = {
  GetAllCategories,
  CreateCategory,
  UpdateCategory,
  DeleteCategory
};

// src/utils/catchAsync.ts
var catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// src/modules/categories/categories.controller.ts
var GetAllCategories2 = catchAsync(async (req, res) => {
  const result = await CategoriesService.GetAllCategories();
  res.status(200).json({
    success: true,
    message: "Categories fetched successfully",
    data: result
  });
});
var CreateCategory2 = catchAsync(async (req, res) => {
  const categoryPayload = req.body;
  const result = await CategoriesService.CreateCategory(categoryPayload);
  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: result
  });
});
var UpdateCategory2 = catchAsync(async (req, res) => {
  const categoryId = req.params.id;
  const categoryPayload = req.body;
  const result = await CategoriesService.UpdateCategory(
    categoryId,
    categoryPayload
  );
  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: result
  });
});
var DeleteCategory2 = catchAsync(async (req, res) => {
  const categoryId = req.params.id;
  await CategoriesService.DeleteCategory(categoryId);
  res.status(200).json({
    success: true,
    message: "Category deleted successfully"
  });
});
var CategoriesController = {
  GetAllCategories: GetAllCategories2,
  CreateCategory: CreateCategory2,
  UpdateCategory: UpdateCategory2,
  DeleteCategory: DeleteCategory2
};

// src/middlewares/auth.ts
import jwt from "jsonwebtoken";
var parseAccessTokenFromHeader = (cookieHeader) => {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)accessToken=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
};
var auth2 = (...roles) => {
  return async (req, res, next) => {
    try {
      let userId = null;
      let userRole = null;
      let userName = "";
      let userEmail = "";
      let userEmailVerified = false;
      let session = null;
      try {
        session = await auth.api.getSession({
          headers: req.headers
        });
      } catch {
      }
      if (session) {
        if (session.user.status && session.user.status !== "ACTIVE") {
          return res.status(403).json({
            success: false,
            message: `Your account is ${session.user.status}. Please contact support!`
          });
        }
        if (!session.user.emailVerified) {
          await prisma.user.update({
            where: { id: session.user.id },
            data: { emailVerified: true }
          });
        }
        userId = session.user.id;
        userRole = session.user.role;
        userName = session.user.name ?? "";
        userEmail = session.user.email ?? "";
        userEmailVerified = session.user.emailVerified ?? false;
      }
      if (!userId) {
        const rawCookie = Array.isArray(req.headers.cookie) ? req.headers.cookie[0] : req.headers.cookie;
        const accessToken = req.cookies?.accessToken || parseAccessTokenFromHeader(rawCookie);
        if (accessToken) {
          try {
            const decoded = jwt.verify(
              accessToken,
              envVars.ACCESS_TOKEN_SECRET
            );
            if (decoded?.userId) {
              const dbUser = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                  id: true,
                  email: true,
                  name: true,
                  role: true,
                  status: true,
                  emailVerified: true
                }
              });
              if (!dbUser) {
                return res.status(401).json({ success: false, message: "User not found." });
              }
              if (dbUser.status !== "ACTIVE") {
                return res.status(403).json({
                  success: false,
                  message: `Your account is ${dbUser.status}. Please contact support!`
                });
              }
              userId = dbUser.id;
              userRole = dbUser.role;
              userName = dbUser.name ?? "";
              userEmail = dbUser.email ?? "";
              userEmailVerified = dbUser.emailVerified ?? false;
            }
          } catch {
          }
        }
      }
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized!"
        });
      }
      req.user = {
        id: userId,
        email: userEmail,
        name: userName,
        role: userRole,
        emailVerified: userEmailVerified
      };
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden! You don't have permission to access this resources!"
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
var auth_default = auth2;

// src/modules/categories/categories.route.ts
var router = Router();
router.get("/", CategoriesController.GetAllCategories);
router.post("/", auth_default("ADMIN" /* ADMIN */), CategoriesController.CreateCategory);
router.patch("/:id", auth_default("ADMIN" /* ADMIN */), CategoriesController.UpdateCategory);
router.delete(
  "/:id",
  auth_default("ADMIN" /* ADMIN */),
  CategoriesController.DeleteCategory
);
var CategoriesRouters = router;

// src/modules/users/users.route.ts
import { Router as Router2 } from "express";

// src/modules/users/users.service.ts
var GetAllUsers = async () => {
  const result = await prisma.user.findMany();
  return result;
};
var UpdateUserStatus = async (userId, status) => {
  const result = await prisma.user.update({
    where: { id: userId },
    data: { status }
  });
  return result;
};
var UpdateUserRole = async (userId, role) => {
  const result = await prisma.user.update({
    where: { id: userId },
    data: { role }
  });
  return result;
};
var UpdateUserProfile = async (userId, userPayload) => {
  const result = await prisma.user.update({
    where: { id: userId },
    data: userPayload
  });
  return result;
};
var UsersService = {
  GetAllUsers,
  UpdateUserStatus,
  UpdateUserRole,
  UpdateUserProfile
};

// src/modules/users/users.controller.ts
var GetAllUsers2 = catchAsync(async (req, res) => {
  const result = await UsersService.GetAllUsers();
  res.status(200).json({
    success: true,
    message: "Users retrieved successfully",
    data: result
  });
});
var UpdateUserStatus2 = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const { status } = req.body;
  const result = await UsersService.UpdateUserStatus(userId, status);
  res.status(200).json({
    success: true,
    message: "User status updated successfully",
    data: result
  });
});
var UpdateUserRole2 = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const { role } = req.body;
  const result = await UsersService.UpdateUserRole(userId, role);
  res.status(200).json({
    success: true,
    message: "User role updated successfully",
    data: result
  });
});
var UpdateUserProfile2 = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const userPayload = req.body;
  const result = await UsersService.UpdateUserProfile(
    userId,
    userPayload
  );
  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: result
  });
});
var UsersController = {
  GetAllUsers: GetAllUsers2,
  UpdateUserStatus: UpdateUserStatus2,
  UpdateUserRole: UpdateUserRole2,
  UpdateUserProfile: UpdateUserProfile2
};

// src/modules/users/users.route.ts
var router2 = Router2();
router2.get(
  "/",
  auth_default("ADMIN" /* ADMIN */, "SUPER_ADMIN" /* SUPER_ADMIN */, "MANAGER" /* MANAGER */),
  UsersController.GetAllUsers
);
router2.patch(
  "/:userId",
  auth_default("ADMIN" /* ADMIN */, "SUPER_ADMIN" /* SUPER_ADMIN */),
  UsersController.UpdateUserStatus
);
router2.patch(
  "/:userId/role",
  auth_default("ADMIN" /* ADMIN */, "SUPER_ADMIN" /* SUPER_ADMIN */),
  UsersController.UpdateUserRole
);
router2.patch(
  "/update-student/:userId",
  auth_default(
    "STUDENT" /* STUDENT */,
    "TUTOR" /* TUTOR */,
    "ORGANIZER" /* ORGANIZER */,
    "MANAGER" /* MANAGER */,
    "ADMIN" /* ADMIN */,
    "SUPER_ADMIN" /* SUPER_ADMIN */
  ),
  UsersController.UpdateUserProfile
);
var UsersRouters = router2;

// src/modules/tutors-profile/tutors-profile.route.ts
import { Router as Router3 } from "express";

// src/modules/tutors-profile/tutors-profile.service.ts
var GetAllTutors = async (queryData) => {
  const {
    category,
    search,
    page = "1",
    limit = "10",
    minPrice,
    maxPrice,
    minRating,
    sortBy = "rating",
    sortOrder = "desc"
  } = queryData;
  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.min(50, Math.max(1, Number(limit)));
  const skip = (pageNumber - 1) * limitNumber;
  const andConditions = [];
  if (category?.trim() && category.trim().toLowerCase() !== "all") {
    const trimmedCat = category.trim();
    andConditions.push({
      subjects: {
        some: {
          subject: {
            OR: [
              { category: { id: { equals: trimmedCat } } },
              {
                category: {
                  name: { contains: trimmedCat, mode: "insensitive" }
                }
              }
            ]
          }
        }
      }
    });
  }
  if (search?.trim()) {
    const trimmed = search.trim();
    andConditions.push({
      OR: [
        { bio: { contains: trimmed, mode: "insensitive" } },
        { user: { name: { contains: trimmed, mode: "insensitive" } } },
        {
          subjects: {
            some: {
              subject: {
                OR: [
                  { name: { contains: trimmed, mode: "insensitive" } },
                  {
                    category: {
                      name: { contains: trimmed, mode: "insensitive" }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    });
  }
  if (minPrice || maxPrice) {
    const priceCondition = {};
    if (minPrice && !isNaN(Number(minPrice)))
      priceCondition.gte = Number(minPrice);
    if (maxPrice && !isNaN(Number(maxPrice)))
      priceCondition.lte = Number(maxPrice);
    if (Object.keys(priceCondition).length) {
      andConditions.push({ hourlyRate: priceCondition });
    }
  }
  if (minRating && !isNaN(Number(minRating)) && Number(minRating) > 0) {
    andConditions.push({ rating: { gte: Number(minRating) } });
  }
  const allowedSortFields = ["rating", "hourlyRate", "totalReviews"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "rating";
  const order = sortOrder === "asc" ? "asc" : "desc";
  andConditions.push({ user: { role: "TUTOR" } });
  const whereCondition = { AND: andConditions };
  const [tutors, total] = await Promise.all([
    prisma.tutorProfile.findMany({
      where: whereCondition,
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        },
        subjects: {
          include: {
            subject: { include: { category: true } }
          }
        }
      },
      orderBy: { [sortField]: order },
      skip,
      take: limitNumber
    }),
    prisma.tutorProfile.count({ where: whereCondition })
  ]);
  const data = tutors.map(({ user, subjects, ...tutor }) => ({
    id: tutor.id,
    userId: user.id,
    bio: tutor.bio,
    hourlyRate: tutor.hourlyRate,
    rating: tutor.rating,
    totalReviews: tutor.totalReviews,
    name: user.name,
    email: user.email,
    image: user.image,
    subjects: subjects.map((s) => s.subject.name),
    categories: subjects.map((s) => s.subject.category.name)
  }));
  return {
    meta: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber)
    },
    data
  };
};
var GetTutorProfileById = async (tutorId) => {
  const result = await prisma.tutorProfile.findUnique({
    where: { userId: tutorId },
    select: {
      id: true,
      bio: true,
      hourlyRate: true,
      rating: true,
      totalReviews: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      },
      availability: {
        select: {
          id: true,
          tutorId: true,
          subjectId: true,
          date: true,
          startTime: true,
          endTime: true,
          isBooked: true,
          subject: {
            select: {
              id: true,
              name: true,
              category: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      },
      reviews: {
        select: {
          rating: true,
          comment: true,
          student: {
            select: {
              name: true,
              image: true
            }
          }
        }
      }
    }
  });
  if (!result) return null;
  const { user, availability, reviews, ...tutor } = result;
  const flatAvailability = availability.map((slot) => ({
    id: slot.id,
    tutorId: slot.tutorId,
    subjectId: slot.subjectId,
    subjectName: slot.subject.name,
    categoryId: slot.subject.category.id,
    categoryName: slot.subject.category.name,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    isBooked: slot.isBooked
  }));
  const formattedReviews = reviews.map((r) => ({
    reviewerName: r.student.name,
    reviewerImage: r.student.image,
    rating: r.rating,
    review: r.comment
  }));
  return {
    ...tutor,
    userId: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    availability: flatAvailability,
    reviews: formattedReviews
  };
};
var CreateTutorProfile = async (tutorPayload) => {
  const tutorProfile = await prisma.tutorProfile.upsert({
    where: { userId: tutorPayload.userId },
    create: tutorPayload,
    update: {}
  });
  await prisma.user.update({
    where: { id: tutorPayload.userId },
    data: { role: "TUTOR" }
  });
  return tutorProfile;
};
var UpdateTutorProfile = async (tutorId, tutorPayload) => {
  const result = await prisma.tutorProfile.update({
    where: { id: tutorId },
    data: tutorPayload
  });
  return result;
};
var UpdateUserprofileForSubjects = async (tutorId, subjectIds) => {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { userId: tutorId },
    include: {
      subjects: {
        select: { subjectId: true }
      }
    }
  });
  if (!tutor) {
    throw new Error("Tutor profile not found");
  }
  const existingSubjectIds = tutor.subjects.map((s) => s.subjectId);
  const newSubjectIds = subjectIds.filter(
    (id) => !existingSubjectIds.includes(id)
  );
  if (newSubjectIds.length === 0) {
    return tutor;
  }
  const updatedTutor = await prisma.tutorProfile.update({
    where: { userId: tutorId },
    data: {
      subjects: {
        create: newSubjectIds.map((subjectId) => ({
          subjectId
        }))
      }
    },
    include: {
      subjects: true
    }
  });
  return updatedTutor;
};
var TutorsProfileService = {
  GetAllTutors,
  GetTutorProfileById,
  CreateTutorProfile,
  UpdateTutorProfile,
  UpdateUserprofileForSubjects
};

// src/modules/tutors-profile/tutors-profile.controller.ts
var GetAllTutors2 = catchAsync(async (req, res) => {
  const result = await TutorsProfileService.GetAllTutors(req.query);
  res.status(200).json({
    success: true,
    message: "Tutors fetched successfully",
    data: result
  });
});
var GetTutorProfileById2 = catchAsync(async (req, res) => {
  const tutorId = req.params.tutorId;
  const result = await TutorsProfileService.GetTutorProfileById(
    tutorId
  );
  res.status(200).json({
    success: true,
    message: "Tutor profile fetched successfully",
    data: result
  });
});
var CreateTutorProfile2 = catchAsync(async (req, res) => {
  const tutorPayload = req.body;
  const result = await TutorsProfileService.CreateTutorProfile(tutorPayload);
  res.status(201).json({
    success: true,
    message: "Tutor profile created successfully",
    data: result
  });
});
var UpdateTutorProfile2 = catchAsync(async (req, res) => {
  const { tutorId } = req.params;
  const tutorPayload = req.body;
  const result = await TutorsProfileService.UpdateTutorProfile(
    tutorId,
    tutorPayload
  );
  res.status(200).json({
    success: true,
    message: "Tutor profile updated successfully",
    data: result
  });
});
var UpdateUserprofileForSubjects2 = catchAsync(
  async (req, res) => {
    const tutorId = req.params.tutorId;
    const { subjectIds } = req.body;
    const result = await TutorsProfileService.UpdateUserprofileForSubjects(
      tutorId,
      subjectIds
    );
    res.status(200).json({
      success: true,
      message: "Tutor profile updated successfully",
      data: result
    });
  }
);
var TutorsProfileController = {
  GetAllTutors: GetAllTutors2,
  GetTutorProfileById: GetTutorProfileById2,
  CreateTutorProfile: CreateTutorProfile2,
  UpdateTutorProfile: UpdateTutorProfile2,
  UpdateUserprofileForSubjects: UpdateUserprofileForSubjects2
};

// src/modules/tutors-profile/tutors-profile.route.ts
var router3 = Router3();
router3.get("/", TutorsProfileController.GetAllTutors);
router3.get("/:tutorId", TutorsProfileController.GetTutorProfileById);
router3.post(
  "/",
  auth_default("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */),
  TutorsProfileController.CreateTutorProfile
);
router3.patch(
  "/:tutorId",
  auth_default("TUTOR" /* TUTOR */),
  TutorsProfileController.UpdateTutorProfile
);
router3.patch(
  "/subjects/:tutorId",
  auth_default("TUTOR" /* TUTOR */),
  TutorsProfileController.UpdateUserprofileForSubjects
);
var TutorsProfileRouters = router3;

// src/modules/tutors-availability/tutors-availability.route.ts
import { Router as Router4 } from "express";

// src/modules/tutors-availability/tutors-availability.service.ts
var GetAllAvailability = async () => {
  const result = await prisma.availability.findMany({
    include: {
      tutor: {
        select: {
          subjects: true
        }
      }
    }
  });
  return result;
};
var GetTutorAvailabilityByTutorId = async (tutorId) => {
  const result = await prisma.availability.findMany({
    where: { tutorId },
    include: {
      subject: {
        select: {
          name: true
        }
      }
    }
  });
  return result.map(({ subject, ...rest }) => ({
    ...rest,
    subject: subject.name
  }));
};
var CreateTutorAvailability = async (availabilityPayload) => {
  const result = await prisma.availability.create({
    data: availabilityPayload
  });
  return result;
};
var UpdateTutorAvailability = async (availabilityId, availabilityPayload) => {
  const result = await prisma.availability.update({
    where: { id: availabilityId },
    data: availabilityPayload
  });
  return result;
};
var DeleteTutorAvailability = async (availabilityId) => {
  await prisma.availability.delete({
    where: { id: availabilityId }
  });
};
var TutorsAvailabilityService = {
  GetAllAvailability,
  GetTutorAvailabilityByTutorId,
  CreateTutorAvailability,
  UpdateTutorAvailability,
  DeleteTutorAvailability
};

// src/modules/tutors-availability/tutors-availability.controller.ts
var GetAllAvailability2 = catchAsync(async (req, res) => {
  const result = await TutorsAvailabilityService.GetAllAvailability();
  res.status(200).json({
    success: true,
    message: "All Tutors availability fetched successfully",
    data: result
  });
});
var GetTutorAvailabilityByTutorId2 = catchAsync(
  async (req, res) => {
    const tutorId = req.params.tutorId;
    const result = await TutorsAvailabilityService.GetTutorAvailabilityByTutorId(
      tutorId
    );
    res.status(200).json({
      success: true,
      message: "Tutor availability fetched successfully",
      data: result
    });
  }
);
var CreateTutorAvailability2 = catchAsync(
  async (req, res) => {
    const availabilityPayload = req.body;
    const result = await TutorsAvailabilityService.CreateTutorAvailability(
      availabilityPayload
    );
    res.status(201).json({
      success: true,
      message: "Tutor availability created successfully",
      data: result
    });
  }
);
var UpdateTutorAvailability2 = catchAsync(
  async (req, res) => {
    const availabilityId = req.params.availabilityId;
    const availabilityPayload = req.body;
    const result = await TutorsAvailabilityService.UpdateTutorAvailability(
      availabilityId,
      availabilityPayload
    );
    res.status(200).json({
      success: true,
      message: "Tutor availability updated successfully",
      data: result
    });
  }
);
var DeleteTutorAvailability2 = catchAsync(
  async (req, res) => {
    const availabilityId = req.params.availabilityId;
    await TutorsAvailabilityService.DeleteTutorAvailability(
      availabilityId
    );
    res.status(200).json({
      success: true,
      message: "Tutor availability deleted successfully"
    });
  }
);
var TutorsAvailabilityController = {
  GetAllAvailability: GetAllAvailability2,
  GetTutorAvailabilityByTutorId: GetTutorAvailabilityByTutorId2,
  CreateTutorAvailability: CreateTutorAvailability2,
  UpdateTutorAvailability: UpdateTutorAvailability2,
  DeleteTutorAvailability: DeleteTutorAvailability2
};

// src/modules/tutors-availability/tutors-availability.route.ts
var router4 = Router4();
router4.get(
  "/",
  auth_default("STUDENT" /* STUDENT */),
  TutorsAvailabilityController.GetAllAvailability
);
router4.get(
  "/:tutorId",
  auth_default("TUTOR" /* TUTOR */),
  TutorsAvailabilityController.GetTutorAvailabilityByTutorId
);
router4.post(
  "/",
  auth_default("TUTOR" /* TUTOR */),
  TutorsAvailabilityController.CreateTutorAvailability
);
router4.patch(
  "/:availabilityId",
  auth_default("TUTOR" /* TUTOR */),
  TutorsAvailabilityController.UpdateTutorAvailability
);
router4.delete(
  "/:availabilityId",
  auth_default("TUTOR" /* TUTOR */),
  TutorsAvailabilityController.DeleteTutorAvailability
);
var TutorsAvailabilityRoutes = router4;

// src/modules/subjects/subjects.route.ts
import { Router as Router5 } from "express";

// src/modules/subjects/subjects.service.ts
var GetAllSubjects = async () => {
  const result = await prisma.subject.findMany();
  return result;
};
var CreateSubject = async (subjectPayload) => {
  const result = await prisma.subject.create({
    data: subjectPayload
  });
  return result;
};
var UpdateSubject = async (subjectId, subjectPayload) => {
  const result = await prisma.subject.update({
    where: { id: subjectId },
    data: subjectPayload
  });
  return result;
};
var DeleteSubject = async (subjectId) => {
  await prisma.subject.delete({
    where: { id: subjectId }
  });
};
var SubjectsService = {
  GetAllSubjects,
  CreateSubject,
  UpdateSubject,
  DeleteSubject
};

// src/modules/subjects/subjects.controller.ts
var GetAllSubjects2 = catchAsync(async (req, res) => {
  const result = await SubjectsService.GetAllSubjects();
  res.status(200).json({
    status: "success",
    data: result
  });
});
var CreateSubject2 = catchAsync(async (req, res) => {
  const subjectPayload = req.body;
  const result = await SubjectsService.CreateSubject(subjectPayload);
  res.status(201).json({
    status: "success",
    message: "Subject created successfully",
    data: result
  });
});
var UpdateSubject2 = catchAsync(async (req, res) => {
  const subjectId = req.params.subjectId;
  const subjectPayload = req.body;
  const result = await SubjectsService.UpdateSubject(
    subjectId,
    subjectPayload
  );
  res.status(200).json({
    status: "success",
    message: "Subject updated successfully",
    data: result
  });
});
var DeleteSubject2 = catchAsync(async (req, res) => {
  const subjectId = req.params.subjectId;
  await SubjectsService.DeleteSubject(subjectId);
  res.status(200).json({
    status: "success",
    message: "Subject deleted successfully"
  });
});
var SubjectsController = {
  GetAllSubjects: GetAllSubjects2,
  CreateSubject: CreateSubject2,
  UpdateSubject: UpdateSubject2,
  DeleteSubject: DeleteSubject2
};

// src/modules/subjects/subjects.route.ts
var router5 = Router5();
router5.get("/", SubjectsController.GetAllSubjects);
router5.post("/", auth_default("ADMIN" /* ADMIN */), SubjectsController.CreateSubject);
router5.patch(
  "/:subjectId",
  auth_default("ADMIN" /* ADMIN */),
  SubjectsController.UpdateSubject
);
router5.delete("/:subjectId", SubjectsController.DeleteSubject);
var SubjectsRouters = router5;

// src/modules/user-profile/user-profile.route.ts
import { Router as Router6 } from "express";

// src/modules/user-profile/user-profile.service.ts
var GetUserProfile = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      status: true,
      emailVerified: true,
      phone: true,
      bio: true,
      createdAt: true,
      updatedAt: true
    }
  });
};
var UpdateStudentProfile = async (studentId, profilePayload) => {
  const data = {};
  if (profilePayload.name) data.name = profilePayload.name;
  if (profilePayload.image) data.image = profilePayload.image;
  if (profilePayload.phone) data.phone = profilePayload.phone;
  if (profilePayload.bio) data.bio = profilePayload.bio;
  const result = await prisma.user.update({
    where: { id: studentId },
    data
  });
  return result;
};
var StudentProfileService = {
  GetUserProfile,
  UpdateStudentProfile
};

// src/app/config/cloudinary.config.ts
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET
});
var assertCloudinaryConfig = () => {
  if (!envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME || !envVars.CLOUDINARY.CLOUDINARY_API_KEY || !envVars.CLOUDINARY.CLOUDINARY_API_SECRET) {
    throw new AppError_default(
      500,
      "Cloudinary environment variables are missing. Configure CLOUDINARY_* values."
    );
  }
};
var uploadFileToCloudinary = async (buffer, fileName) => {
  assertCloudinaryConfig();
  if (!buffer || !fileName) {
    throw new AppError_default(
      400,
      "File buffer and file name are required for Cloudinary upload."
    );
  }
  const extension = fileName.split(".").pop()?.toLowerCase();
  const fileNameWithoutExtension = fileName.split(".").slice(0, -1).join(".").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
  const uniqueName = `${Math.random().toString(36).slice(2)}-${Date.now()}-${fileNameWithoutExtension}`;
  const folder = extension === "pdf" ? "pdfs" : "images";
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        public_id: `skill-bridge/${folder}/${uniqueName}`,
        folder: `skill-bridge/${folder}`
      },
      (error, result) => {
        if (error) {
          const cloudinaryMessage = typeof error?.message === "string" && error.message.trim().length > 0 ? error.message : "Unknown Cloudinary error";
          reject(
            new AppError_default(
              500,
              `Failed to upload file to Cloudinary: ${cloudinaryMessage}`
            )
          );
          return;
        }
        resolve(result);
      }
    ).end(buffer);
  });
};
var deleteFileFromCloudinary = async (url) => {
  if (!url) {
    return;
  }
  try {
    const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;
    const match = url.match(regex);
    if (match?.[1]) {
      await cloudinary.uploader.destroy(match[1], {
        resource_type: "image"
      });
    }
  } catch {
    throw new AppError_default(500, "Failed to delete file from Cloudinary.");
  }
};

// src/modules/user-profile/user-profile.controller.ts
var GetUserProfile2 = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const result = await StudentProfileService.GetUserProfile(userId);
  if (!result) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }
  res.status(200).json({ success: true, message: "User profile retrieved", data: result });
});
var UpdateStudentProfile2 = catchAsync(async (req, res) => {
  const studentId = req.params.studentId;
  const profilePayload = req.body;
  const result = await StudentProfileService.UpdateStudentProfile(
    studentId,
    profilePayload
  );
  res.status(200).json({
    success: true,
    message: "User profile updated Successfully",
    data: result
  });
});
var UploadStudentAvatar = catchAsync(async (req, res) => {
  const studentId = req.params.studentId;
  const file = req.file;
  if (!file?.buffer || !file.originalname) {
    res.status(400).json({
      success: false,
      message: "Image file is required"
    });
    return;
  }
  const uploadedImage = await uploadFileToCloudinary(
    file.buffer,
    file.originalname
  );
  const result = await StudentProfileService.UpdateStudentProfile(
    studentId,
    {
      image: uploadedImage.secure_url
    }
  );
  res.status(200).json({
    success: true,
    message: "Profile image updated Successfully",
    data: {
      image: result.image
    }
  });
});
var StudentProfileController = {
  GetUserProfile: GetUserProfile2,
  UpdateStudentProfile: UpdateStudentProfile2,
  UploadStudentAvatar
};

// src/app/config/multer.config.ts
import multer from "multer";
var storage = multer.memoryStorage();
var upload = multer({ storage });

// src/modules/user-profile/user-profile.route.ts
var router6 = Router6();
router6.get(
  "/:userId",
  auth_default(
    "STUDENT" /* STUDENT */,
    "TUTOR" /* TUTOR */,
    "ADMIN" /* ADMIN */,
    "SUPER_ADMIN" /* SUPER_ADMIN */,
    "MANAGER" /* MANAGER */,
    "ORGANIZER" /* ORGANIZER */
  ),
  StudentProfileController.GetUserProfile
);
router6.patch(
  "/:studentId",
  auth_default(
    "STUDENT" /* STUDENT */,
    "TUTOR" /* TUTOR */,
    "ADMIN" /* ADMIN */,
    "SUPER_ADMIN" /* SUPER_ADMIN */,
    "MANAGER" /* MANAGER */,
    "ORGANIZER" /* ORGANIZER */
  ),
  StudentProfileController.UpdateStudentProfile
);
router6.post(
  "/:studentId/avatar",
  auth_default(
    "STUDENT" /* STUDENT */,
    "TUTOR" /* TUTOR */,
    "ADMIN" /* ADMIN */,
    "SUPER_ADMIN" /* SUPER_ADMIN */,
    "MANAGER" /* MANAGER */,
    "ORGANIZER" /* ORGANIZER */
  ),
  upload.single("image"),
  StudentProfileController.UploadStudentAvatar
);
var UserProfileRouter = router6;

// src/modules/booking-session/booking-session.route.ts
import { Router as Router7 } from "express";

// src/errors/AppError.ts
var AppError2 = class extends Error {
  statusCode;
  errors;
  constructor(statusCode, message, errors) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
};

// src/modules/booking-session/booking-session.service.ts
var CreateSession = async (payload) => {
  const { tutorId, subjectId, availabilityId, studentId } = payload;
  return await prisma.$transaction(async (tx) => {
    const slot = await tx.availability.findFirst({
      where: {
        id: availabilityId,
        tutorId,
        isBooked: false
      }
    });
    if (!slot) {
      throw new AppError2(404, "Slot not available");
    }
    const newBooking = await tx.booking.create({
      data: {
        tutorId,
        subjectId,
        availabilityId,
        studentId
      }
    });
    await tx.availability.update({
      where: { id: availabilityId },
      data: { isBooked: true }
    });
    return newBooking;
  });
};
var GetAllBooking = async (studentId) => {
  const bookings = await prisma.booking.findMany({
    where: { studentId },
    include: {
      tutor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      },
      subject: {
        select: {
          id: true,
          name: true
        }
      },
      availability: {
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          isBooked: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  const flatBookings = bookings.map((b) => ({
    id: b.id,
    studentId: b.studentId,
    tutorId: b.tutorId,
    tutorName: b.tutor.user.name,
    tutorEmail: b.tutor.user.email,
    tutorImage: b.tutor.user.image,
    subjectId: b.subject.id,
    subjectName: b.subject.name,
    availabilityId: b.availability.id,
    date: b.availability.date,
    startTime: b.availability.startTime,
    endTime: b.availability.endTime,
    isBooked: b.availability.isBooked,
    status: b.status,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt
  }));
  return flatBookings;
};
var GetAllBookingByTutorId = async (tutorId) => {
  const bookings = await prisma.booking.findMany({
    where: { tutorId },
    include: {
      tutor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      },
      subject: {
        select: {
          id: true,
          name: true
        }
      },
      availability: {
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          isBooked: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  const flatBookings = bookings.map((b) => ({
    id: b.id,
    studentId: b.studentId,
    tutorId: b.tutorId,
    tutorName: b.tutor.user.name,
    tutorEmail: b.tutor.user.email,
    tutorImage: b.tutor.user.image,
    subjectId: b.subject.id,
    subjectName: b.subject.name,
    availabilityId: b.availability.id,
    date: b.availability.date,
    startTime: b.availability.startTime,
    endTime: b.availability.endTime,
    isBooked: b.availability.isBooked,
    status: b.status,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt
  }));
  return flatBookings;
};
var UpdateBooking = async (bookingId, bookingPayload) => {
  const result = await prisma.booking.update({
    where: { id: bookingId },
    data: bookingPayload
  });
  return result;
};
var BookingSessionService = {
  CreateSession,
  GetAllBooking,
  GetAllBookingByTutorId,
  UpdateBooking
};

// src/modules/booking-session/booking-session.controller.ts
var CreateSession2 = catchAsync(async (req, res) => {
  const bookingPayload = req.body;
  bookingPayload.studentId = req.user?.id;
  const result = await BookingSessionService.CreateSession(bookingPayload);
  res.status(201).json({
    success: true,
    message: "Booking Session Created Successfully",
    data: result
  });
});
var GetAllBooking2 = catchAsync(async (req, res) => {
  const studentId = req.user?.id;
  const result = await BookingSessionService.GetAllBooking(studentId);
  res.status(200).json({
    success: true,
    message: "Booing fetched successfully",
    data: result
  });
});
var GetAllBookingByTutorId2 = catchAsync(
  async (req, res) => {
    const tutorId = req.params.tutorId;
    const result = await BookingSessionService.GetAllBookingByTutorId(tutorId);
    res.status(200).json({
      success: true,
      message: "Booing fetched successfully",
      data: result
    });
  }
);
var UpdateBooking2 = catchAsync(async (req, res) => {
  const studentId = req.params.bookingId;
  const bookingPayload = req.body;
  const result = await BookingSessionService.UpdateBooking(
    studentId,
    bookingPayload
  );
  res.status(200).json({
    success: true,
    message: "Booing updated successfully",
    data: result
  });
});
var BookingSessionController = {
  CreateSession: CreateSession2,
  GetAllBooking: GetAllBooking2,
  UpdateBooking: UpdateBooking2,
  GetAllBookingByTutorId: GetAllBookingByTutorId2
};

// src/modules/booking-session/booking-session.route.ts
var router7 = Router7();
router7.post("/", auth_default("STUDENT" /* STUDENT */), BookingSessionController.CreateSession);
router7.get("/", auth_default("STUDENT" /* STUDENT */), BookingSessionController.GetAllBooking);
router7.get(
  "/:tutorId",
  auth_default("TUTOR" /* TUTOR */),
  BookingSessionController.GetAllBookingByTutorId
);
router7.patch(
  "/:bookingId",
  auth_default("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */),
  BookingSessionController.UpdateBooking
);
var BookingSessionRouter = router7;

// src/modules/reviews/reviews.route.ts
import { Router as Router8 } from "express";

// src/modules/reviews/reviews.service.ts
var CreateReview = async (payload) => {
  const { tutorId, studentId, rating, comment } = payload;
  return await prisma.$transaction(async (tx) => {
    const tutor = await tx.tutorProfile.findUnique({
      where: { id: tutorId },
      select: {
        rating: true,
        totalReviews: true
      }
    });
    if (!tutor) {
      throw new Error("Tutor not found");
    }
    const newTotalReviews = tutor.totalReviews + 1;
    const newAverageRating = (tutor.rating * tutor.totalReviews + rating) / newTotalReviews;
    const review = await tx.review.create({
      data: {
        tutorId,
        studentId,
        rating,
        comment
      }
    });
    await tx.tutorProfile.update({
      where: { id: tutorId },
      data: {
        totalReviews: newTotalReviews,
        rating: Number(newAverageRating.toFixed(2))
      }
    });
    return review;
  });
};
var GetAllRating = async (tutorId) => {
  const result = await prisma.review.findMany({
    where: { tutorId },
    include: {
      student: {
        select: {
          name: true,
          email: true,
          image: true
        }
      }
    }
  });
  return result;
};
var GetAllRatingPublic = async () => {
  const result = await prisma.review.findMany({
    include: {
      student: {
        select: {
          name: true,
          email: true,
          image: true
        }
      }
    },
    take: 8
  });
  return result;
};
var ReviewService = {
  CreateReview,
  GetAllRating,
  GetAllRatingPublic
};

// src/modules/reviews/reviews.controller.ts
var CreateReview2 = catchAsync(async (req, res) => {
  let payload = req.body;
  payload.studentId = req.user?.id;
  const result = await ReviewService.CreateReview(payload);
  res.status(200).json({
    success: true,
    message: "Review Created successfully",
    data: result
  });
});
var GetAllRating2 = catchAsync(async (req, res) => {
  const tutorId = req.params.tutorId;
  const result = await ReviewService.GetAllRating(tutorId);
  res.status(200).json({
    success: true,
    message: "Review fetched successfully",
    data: result
  });
});
var GetAllRatingPublic2 = catchAsync(async (req, res) => {
  const result = await ReviewService.GetAllRatingPublic();
  res.status(200).json({
    success: true,
    message: "Review fetched successfully",
    data: result
  });
});
var ReviewController = {
  CreateReview: CreateReview2,
  GetAllRating: GetAllRating2,
  GetAllRatingPublic: GetAllRatingPublic2
};

// src/modules/reviews/reviews.route.ts
var router8 = Router8();
router8.post("/", auth_default("STUDENT" /* STUDENT */), ReviewController.CreateReview);
router8.get("/", ReviewController.GetAllRatingPublic);
router8.get("/:tutorId", auth_default("TUTOR" /* TUTOR */), ReviewController.GetAllRating);
var ReviewRouters = router8;

// src/modules/analytics/analytics.route.ts
import { Router as Router9 } from "express";

// src/modules/analytics/analytics.service.ts
var GetTutorAnalytics = async (tutorId) => {
  const bookingStats = await prisma.booking.groupBy({
    by: ["status"],
    where: { tutorId },
    _count: { status: true }
  });
  const bookingSummary = {
    totalBookings: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  };
  bookingStats.forEach((item) => {
    const count = item._count.status;
    bookingSummary.totalBookings += count;
    if (item.status === "PENDING") bookingSummary.pending = count;
    if (item.status === "CONFIRMED") bookingSummary.confirmed = count;
    if (item.status === "COMPLETED") bookingSummary.completed = count;
    if (item.status === "CANCELLED") bookingSummary.cancelled = count;
  });
  const reviewStats = await prisma.review.aggregate({
    where: { tutorId },
    _count: { id: true },
    _avg: { rating: true }
  });
  return {
    bookingSummary,
    reviewSummary: {
      totalReviews: reviewStats._count.id || 0,
      averageRating: Number(reviewStats._avg.rating || 0).toFixed(2)
    }
  };
};
var GetStudentAnalytics = async (studentId) => {
  const bookingStats = await prisma.booking.groupBy({
    by: ["status"],
    where: { studentId },
    _count: { status: true }
  });
  const bookingSummary = {
    totalBookings: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  };
  bookingStats.forEach((item) => {
    const count = item._count.status;
    bookingSummary.totalBookings += count;
    if (item.status === "PENDING") bookingSummary.pending = count;
    if (item.status === "CONFIRMED") bookingSummary.confirmed = count;
    if (item.status === "COMPLETED") bookingSummary.completed = count;
    if (item.status === "CANCELLED") bookingSummary.cancelled = count;
  });
  return bookingSummary;
};
var GetAdminAnalytics = async (studentId) => {
  const bookingStats = await prisma.booking.groupBy({
    by: ["status"],
    _count: { status: true }
  });
  const bookingSummary = {
    totalBookings: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  };
  bookingStats.forEach((item) => {
    const count = item._count.status;
    bookingSummary.totalBookings += count;
    if (item.status === "PENDING") bookingSummary.pending = count;
    if (item.status === "CONFIRMED") bookingSummary.confirmed = count;
    if (item.status === "COMPLETED") bookingSummary.completed = count;
    if (item.status === "CANCELLED") bookingSummary.cancelled = count;
  });
  const totalTutors = await prisma.tutorProfile.count();
  const totalStudents = await prisma.user.count();
  return {
    bookingSummary,
    totalTutors,
    totalStudents
  };
};
var AnalyticsService = {
  GetTutorAnalytics,
  GetStudentAnalytics,
  GetAdminAnalytics
};

// src/modules/analytics/analytics.controller.ts
var GetTutorAnalytics2 = catchAsync(async (req, res) => {
  const tutorId = req.params?.tutorId;
  const result = await AnalyticsService.GetTutorAnalytics(tutorId);
  res.status(200).json({
    success: true,
    message: "Tutor analytics fetched successfully",
    data: result
  });
});
var GetStudentAnalytics2 = catchAsync(async (req, res) => {
  const studentId = req.user?.id;
  const result = await AnalyticsService.GetStudentAnalytics(studentId);
  res.status(200).json({
    success: true,
    message: "Student analytics fetched successfully",
    data: result
  });
});
var GetAdminAnalytics2 = catchAsync(async (req, res) => {
  const adminId = req.user?.id;
  const result = await AnalyticsService.GetAdminAnalytics(adminId);
  res.status(200).json({
    success: true,
    message: "Admin analytics fetched successfully",
    data: result
  });
});
var AnalyticsController = {
  GetTutorAnalytics: GetTutorAnalytics2,
  GetStudentAnalytics: GetStudentAnalytics2,
  GetAdminAnalytics: GetAdminAnalytics2
};

// src/modules/analytics/analytics.route.ts
var router9 = Router9();
router9.get(
  "/tutor/:tutorId",
  auth_default("TUTOR" /* TUTOR */),
  AnalyticsController.GetTutorAnalytics
);
router9.get(
  "/student",
  auth_default("STUDENT" /* STUDENT */),
  AnalyticsController.GetStudentAnalytics
);
router9.get(
  "/admin",
  auth_default("ADMIN" /* ADMIN */, "SUPER_ADMIN" /* SUPER_ADMIN */, "MANAGER" /* MANAGER */),
  AnalyticsController.GetAdminAnalytics
);
var AnalyticsRouters = router9;

// src/modules/events/events.route.ts
import { Router as Router10 } from "express";

// src/modules/events/events.service.ts
var GetAllEvents = async (queryData) => {
  const {
    search,
    category,
    status,
    location,
    minPrice,
    maxPrice,
    minRating,
    dateFrom,
    dateTo,
    sortBy = "startsAt",
    sortOrder = "asc",
    page = "1",
    limit = "10"
  } = queryData;
  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.min(50, Math.max(1, Number(limit) || 10));
  const skip = (pageNumber - 1) * limitNumber;
  const where = {};
  if (search?.trim()) {
    const value = search.trim();
    where.OR = [
      { title: { contains: value, mode: "insensitive" } },
      { description: { contains: value, mode: "insensitive" } },
      { category: { contains: value, mode: "insensitive" } },
      { location: { contains: value, mode: "insensitive" } }
    ];
  }
  if (category?.trim()) {
    where.category = { contains: category.trim(), mode: "insensitive" };
  }
  if (status?.trim() && status !== "ALL") {
    where.status = status;
  }
  if (location?.trim()) {
    where.location = { contains: location.trim(), mode: "insensitive" };
  }
  if (minRating && !Number.isNaN(Number(minRating))) {
    where.rating = { gte: Number(minRating) };
  }
  if (minPrice && !Number.isNaN(Number(minPrice))) {
    where.price = { ...where.price || {}, gte: Number(minPrice) };
  }
  if (maxPrice && !Number.isNaN(Number(maxPrice))) {
    where.price = { ...where.price || {}, lte: Number(maxPrice) };
  }
  const parsedDateFrom = dateFrom ? new Date(dateFrom) : null;
  const parsedDateTo = dateTo ? new Date(dateTo) : null;
  const hasValidDateFrom = Boolean(
    parsedDateFrom && !Number.isNaN(parsedDateFrom.getTime())
  );
  const hasValidDateTo = Boolean(
    parsedDateTo && !Number.isNaN(parsedDateTo.getTime())
  );
  if (hasValidDateFrom || hasValidDateTo) {
    where.startsAt = {
      ...hasValidDateFrom ? { gte: parsedDateFrom } : {},
      ...hasValidDateTo ? { lte: parsedDateTo } : {}
    };
  }
  const allowedSortBy = /* @__PURE__ */ new Set(["startsAt", "price", "rating", "createdAt"]);
  const safeSortBy = allowedSortBy.has(sortBy) ? sortBy : "startsAt";
  const safeSortOrder = sortOrder === "desc" ? "desc" : "asc";
  const [events, total, categories] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { [safeSortBy]: safeSortOrder },
      skip,
      take: limitNumber
    }),
    prisma.event.count({ where }),
    prisma.event.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" }
    })
  ]);
  return {
    meta: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.max(1, Math.ceil(total / limitNumber))
    },
    filters: {
      categories: categories.map((item) => item.category)
    },
    data: events
  };
};
var CreateEvent = async (payload) => {
  const result = await prisma.event.create({
    data: payload
  });
  return result;
};
var UpdateEvent = async (id, payload) => {
  const result = await prisma.event.update({
    where: { id },
    data: payload
  });
  return result;
};
var DeleteEvent = async (id) => {
  await prisma.event.delete({ where: { id } });
};
var EventsService = {
  GetAllEvents,
  CreateEvent,
  UpdateEvent,
  DeleteEvent
};

// src/modules/events/events.controller.ts
var GetAllEvents2 = catchAsync(async (req, res) => {
  const result = await EventsService.GetAllEvents(req.query);
  res.status(200).json({
    success: true,
    message: "Events fetched successfully",
    data: result
  });
});
var CreateEvent2 = catchAsync(async (req, res) => {
  const result = await EventsService.CreateEvent(req.body);
  res.status(201).json({
    success: true,
    message: "Event created successfully",
    data: result
  });
});
var UpdateEvent2 = catchAsync(async (req, res) => {
  const result = await EventsService.UpdateEvent(
    req.params.eventId,
    req.body
  );
  res.status(200).json({
    success: true,
    message: "Event updated successfully",
    data: result
  });
});
var DeleteEvent2 = catchAsync(async (req, res) => {
  await EventsService.DeleteEvent(req.params.eventId);
  res.status(200).json({
    success: true,
    message: "Event deleted successfully"
  });
});
var EventsController = {
  GetAllEvents: GetAllEvents2,
  CreateEvent: CreateEvent2,
  UpdateEvent: UpdateEvent2,
  DeleteEvent: DeleteEvent2
};

// src/modules/events/events.route.ts
var router10 = Router10();
router10.get("/", EventsController.GetAllEvents);
router10.post("/", auth_default("ADMIN" /* ADMIN */), EventsController.CreateEvent);
router10.patch("/:eventId", auth_default("ADMIN" /* ADMIN */), EventsController.UpdateEvent);
router10.delete("/:eventId", auth_default("ADMIN" /* ADMIN */), EventsController.DeleteEvent);
var EventsRouters = router10;

// src/modules/chatbot/chatbot.route.ts
import { Router as Router11 } from "express";

// src/modules/chatbot/chatbot.service.ts
var SKILLBRIDGE_PROMPT = "You are SkillBridge Assistant. Help with tutor discovery, booking prep, learning plans, interview prep, and profile improvements. Keep answers practical, concise, and student-friendly.";
var normalizeContent = (content) => {
  if (typeof content === "string") {
    return content;
  }
  if (!Array.isArray(content)) {
    return "";
  }
  return content.map((item) => {
    if (item && typeof item === "object" && "type" in item && "text" in item && item.type === "text") {
      return String(item.text || "");
    }
    return "";
  }).join("");
};
var requestOpenRouter = async (apiKey, modelName, messages) => {
  const response = await fetch(envVars.OPENROUTER.API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": envVars.FRONTEND_URL,
      "X-Title": "SkillBridge Assistant"
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        {
          role: "system",
          content: SKILLBRIDGE_PROMPT
        },
        ...messages
      ],
      temperature: 0.45,
      max_tokens: 280
    })
  });
  const rawBody = await response.text();
  if (!response.ok) {
    return {
      ok: false,
      statusCode: response.status,
      modelName,
      rawBody
    };
  }
  const parsed = JSON.parse(rawBody);
  const reply = normalizeContent(parsed.choices?.[0]?.message?.content).trim();
  if (!reply) {
    return {
      ok: false,
      statusCode: 502,
      modelName,
      rawBody: "OpenRouter returned empty response."
    };
  }
  return {
    ok: true,
    modelName,
    reply
  };
};
var getReply = async (payload) => {
  const message = payload.message?.trim() || "";
  if (!message) {
    throw new Error("Message is required");
  }
  const apiKey = envVars.OPENROUTER.API_KEY;
  if (!apiKey) {
    throw new Error(
      "Chatbot service is not configured. Missing OPENROUTER_API_KEY."
    );
  }
  const history = (payload.history || []).filter((item) => item.content?.trim()).slice(-8).map((item) => ({
    role: item.role,
    content: item.content.trim()
  }));
  const messages = [
    ...history,
    { role: "user", content: message }
  ];
  const models = [
    envVars.OPENROUTER.MODEL,
    envVars.OPENROUTER.FALLBACK_MODEL
  ].filter(Boolean);
  let lastError = null;
  for (const modelName of models) {
    const response = await requestOpenRouter(apiKey, modelName, messages);
    if (response.ok) {
      return { reply: response.reply };
    }
    lastError = `Model ${response.modelName} failed (${response.statusCode}).`;
  }
  return {
    reply: "I am temporarily unavailable. Please try again in a moment. " + (lastError ? `(${lastError})` : "")
  };
};
var ChatbotService = {
  getReply
};

// src/modules/chatbot/chatbot.controller.ts
var sendMessage = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await ChatbotService.getReply(payload);
  res.status(200).json({
    success: true,
    message: "Chatbot response generated successfully",
    data: result
  });
});
var ChatbotController = {
  sendMessage
};

// src/app/middleware/chatbotRateLimit.ts
var REQUEST_LIMIT = 20;
var WINDOW_MS = 60 * 1e3;
var rateStore = /* @__PURE__ */ new Map();
var getClientIdentifier = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0] || "unknown";
  }
  return req.ip || "unknown";
};
var clearExpiredEntries = (now) => {
  for (const [key, value] of rateStore.entries()) {
    if (value.resetAt <= now) {
      rateStore.delete(key);
    }
  }
};
var chatbotRateLimit = (req, res, next) => {
  const now = Date.now();
  clearExpiredEntries(now);
  const clientId = getClientIdentifier(req);
  const currentRecord = rateStore.get(clientId);
  if (!currentRecord || currentRecord.resetAt <= now) {
    rateStore.set(clientId, {
      count: 1,
      resetAt: now + WINDOW_MS
    });
    next();
    return;
  }
  if (currentRecord.count >= REQUEST_LIMIT) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((currentRecord.resetAt - now) / 1e3)
    );
    res.setHeader("Retry-After", String(retryAfterSeconds));
    next(new AppError_default(429, "Too many requests. Please try again shortly."));
    return;
  }
  currentRecord.count += 1;
  rateStore.set(clientId, currentRecord);
  next();
};

// src/modules/chatbot/chatbot.route.ts
var router11 = Router11();
router11.post("/message", chatbotRateLimit, ChatbotController.sendMessage);
var ChatbotRoutes = router11;

// src/modules/auth/auth.route.ts
import { Router as Router12 } from "express";

// src/app/utils/cookie.ts
var setCookie = (res, key, value, options) => {
  res.cookie(key, value, options);
};
var getCookieOptions = (isProduction) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/"
});
var CookieUtils = {
  setCookie,
  getCookieOptions
};

// src/app/utils/jwt.ts
import jwt2 from "jsonwebtoken";
var createToken = (payload, secret, { expiresIn }) => {
  const token = jwt2.sign(payload, secret, { expiresIn });
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const decoded = jwt2.verify(token, secret);
    return {
      success: true,
      data: decoded
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error
    };
  }
};
var decodeToken = (token) => {
  const decoded = jwt2.decode(token);
  return decoded;
};
var jwtUtils = {
  createToken,
  verifyToken,
  decodeToken
};

// src/app/utils/token.ts
var accessTokenExpiresIn = envVars.ACCESS_TOKEN_EXPIRES_IN;
var refreshTokenExpiresIn = envVars.REFRESH_TOKEN_EXPIRES_IN;
var getAccessToken = (payload) => {
  const accessToken = jwtUtils.createToken(payload, envVars.ACCESS_TOKEN_SECRET, {
    expiresIn: accessTokenExpiresIn
  });
  return accessToken;
};
var getRefreshToken = (payload) => {
  const refreshToken = jwtUtils.createToken(payload, envVars.REFRESH_TOKEN_SECRET, {
    expiresIn: refreshTokenExpiresIn
  });
  return refreshToken;
};
var setAccessTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: envVars.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 1e3 * 60 * 60 * 24
  });
};
var setRefreshTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: envVars.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 1e3 * 60 * 60 * 24 * 7
  });
};
var setBetterAuthSessionCookie = (res, token) => {
  CookieUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: envVars.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 1e3 * 60 * 60 * 24
  });
};
var tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie
};

// src/modules/auth/auth.controller.ts
var resolveBetterAuthSessionCookie = (cookies) => {
  const directCandidates = [
    "better-auth.session_token",
    "__Secure-better-auth.session_token"
  ];
  for (const name of directCandidates) {
    const value = cookies?.[name];
    if (typeof value === "string" && value.length > 0) {
      return { name, value };
    }
  }
  const dynamicMatch = Object.entries(cookies ?? {}).find(
    ([name, value]) => typeof value === "string" && value.length > 0 && name.endsWith("better-auth.session_token")
  );
  if (dynamicMatch) {
    const [name, value] = dynamicMatch;
    return { name, value };
  }
  return null;
};
var Login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  let signInData;
  try {
    signInData = await auth.api.signInEmail({
      body: { email, password }
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err?.message || "Invalid credentials"
    });
  }
  if (!signInData?.user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }
  const { user, token } = signInData;
  const jwtPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified
  };
  const accessToken = tokenUtils.getAccessToken(jwtPayload);
  const refreshToken = tokenUtils.getRefreshToken(jwtPayload);
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      accessToken,
      refreshToken,
      user
    }
  });
});
var Register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  let signUpData;
  try {
    signUpData = await auth.api.signUpEmail({
      body: { name, email, password }
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err?.message || "Registration failed"
    });
  }
  if (!signUpData?.user) {
    return res.status(400).json({
      success: false,
      message: "Registration failed"
    });
  }
  const { user, token } = signUpData;
  const jwtPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified
  };
  const accessToken = tokenUtils.getAccessToken(jwtPayload);
  const refreshToken = tokenUtils.getRefreshToken(jwtPayload);
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token ?? "");
  return res.status(201).json({
    success: true,
    message: "Registration successful",
    data: {
      token,
      accessToken,
      refreshToken,
      user
    }
  });
});
var GetMe = catchAsync(async (req, res) => {
  const session = await auth.api.getSession({
    headers: req.headers
  });
  if (!session) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated"
    });
  }
  const { user } = session;
  return res.status(200).json({
    success: true,
    message: "User retrieved successfully",
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      image: user.image,
      status: user.status
    }
  });
});
var RefreshToken = catchAsync(async (req, res) => {
  const webHeaders = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") {
      webHeaders.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((v) => webHeaders.append(key, v));
    }
  }
  const session = await auth.api.getSession({ headers: webHeaders });
  if (!session) {
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid. Please log in again."
    });
  }
  const { user } = session;
  const jwtPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified
  };
  const accessToken = tokenUtils.getAccessToken(jwtPayload);
  const refreshToken = tokenUtils.getRefreshToken(jwtPayload);
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  const sessionCookie = resolveBetterAuthSessionCookie(
    req.cookies
  );
  tokenUtils.setBetterAuthSessionCookie(res, sessionCookie?.value || "");
  return res.status(200).json({
    success: true,
    message: "Tokens refreshed successfully",
    data: { accessToken, refreshToken }
  });
});
var LoginWithGoogle = catchAsync(async (req, res) => {
  let redirectPath = "/dashboard";
  if (typeof req.query.redirect === "string" && req.query.redirect) {
    redirectPath = req.query.redirect;
  } else if (typeof req.query.callbackURL === "string" && req.query.callbackURL) {
    try {
      const parsed = new URL(req.query.callbackURL);
      redirectPath = parsed.pathname + (parsed.search || "");
    } catch {
      redirectPath = "/dashboard";
    }
  }
  const betterAuthBaseUrl = envVars.BETTER_AUTH_URL.replace(/\/$/, "");
  const callbackURL = `${betterAuthBaseUrl}/api/v1/auth/google/success?redirect=${encodeURIComponent(redirectPath)}`;
  return res.render("googleRedirect", {
    callbackURL,
    betterAuthUrl: betterAuthBaseUrl
  });
});
var GoogleLoginSuccess = catchAsync(async (req, res) => {
  const redirectPath = req.query.redirect || "/dashboard";
  const sessionCookie = resolveBetterAuthSessionCookie(
    req.cookies
  );
  if (!sessionCookie?.value) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
  }
  const sessionToken = sessionCookie.value;
  const session = await auth.api.getSession({
    headers: new Headers({
      Cookie: `${sessionCookie.name}=${sessionToken}`
    })
  });
  if (!session?.user) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`);
  }
  const jwtPayload = {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    emailVerified: session.user.emailVerified
  };
  const accessToken = tokenUtils.getAccessToken(jwtPayload);
  const refreshToken = tokenUtils.getRefreshToken(jwtPayload);
  const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
  const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";
  const callbackUrl = new URL(
    `${envVars.FRONTEND_URL}/api/auth/google/callback`
  );
  callbackUrl.searchParams.set("accessToken", accessToken);
  callbackUrl.searchParams.set("refreshToken", refreshToken);
  callbackUrl.searchParams.set("sessionToken", sessionToken);
  callbackUrl.searchParams.set("redirect", finalRedirectPath);
  return res.redirect(callbackUrl.toString());
});
var HandleOAuthError = catchAsync((req, res) => {
  const error = req.query.error || "oauth_failed";
  return res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
});
var AuthController = {
  Login,
  Register,
  GetMe,
  RefreshToken,
  LoginWithGoogle,
  GoogleLoginSuccess,
  HandleOAuthError
};

// src/modules/auth/auth.route.ts
var router12 = Router12();
router12.post("/login", AuthController.Login);
router12.get("/login/google", AuthController.LoginWithGoogle);
router12.get("/google/success", AuthController.GoogleLoginSuccess);
router12.get("/oauth/error", AuthController.HandleOAuthError);
router12.post("/register", AuthController.Register);
router12.get("/me", AuthController.GetMe);
router12.post("/refresh-token", AuthController.RefreshToken);
var AuthRouters = router12;

// src/app/routes/index.ts
var router13 = Router13();
router13.use("/categories", CategoriesRouters);
router13.use("/subjects", SubjectsRouters);
router13.use("/manage-users", UsersRouters);
router13.use("/student-profile", UserProfileRouter);
router13.use("/tutors-profile", TutorsProfileRouters);
router13.use("/tutors-availability", TutorsAvailabilityRoutes);
router13.use("/booking-session", BookingSessionRouter);
router13.use("/reviews", ReviewRouters);
router13.use("/analytics", AnalyticsRouters);
router13.use("/events", EventsRouters);
router13.use("/chatbot", ChatbotRoutes);
router13.use("/auth", AuthRouters);
var IndexRoutes = router13;

// src/app/middleware/globalErrorHandler.ts
import z from "zod";

// src/app/errorHelpers/handleZodError.ts
var handleZodError = (err) => {
  const statusCode = 400;
  const message = "Zod Validation Error";
  const errorSources = [];
  err.issues.forEach((issue) => {
    errorSources.push({
      path: issue.path.join(" => "),
      message: issue.message
    });
  });
  return {
    success: false,
    message,
    errorSources,
    statusCode
  };
};

// src/app/middleware/globalErrorHandler.ts
var globalErrorHandler = async (err, req, res, _next) => {
  if (req.file?.path) {
    await deleteFileFromCloudinary(req.file.path);
  }
  if (Array.isArray(req.files) && req.files.length > 0) {
    const imageUrls = req.files.map((file) => "path" in file ? file.path : "").filter(Boolean);
    await Promise.all(imageUrls.map((url) => deleteFileFromCloudinary(url)));
  }
  let statusCode = 500;
  let message = "Internal Server Error";
  let stack;
  let errorSources = [];
  if (err instanceof AppError_default) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorSources = [{ path: "", message: err.message }];
  } else if (err instanceof z.ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode || 400;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err instanceof Error) {
    message = err.message;
    stack = err.stack;
    errorSources = [{ path: "", message: err.message }];
  }
  const errorResponse = {
    statusCode,
    success: false,
    message,
    errorSources
  };
  if (envVars.NODE_ENV === "development") {
    errorResponse.error = err;
    if (stack) {
      errorResponse.stack = stack;
    }
  }
  res.status(statusCode).json(errorResponse);
};

// src/app/middleware/notFound.ts
var notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} Not Found`
  });
};

// src/app.ts
var app = express();
var LOCAL_ORIGIN_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
app.set("query parser", (str) => qs.parse(str));
app.set("view engine", "ejs");
app.set("views", path3.resolve(process.cwd(), "src/app/templates"));
app.set("trust proxy", true);
var allowedOrigins = [
  envVars.FRONTEND_URL,
  envVars.BETTER_AUTH_URL,
  ...envVars.TRUSTED_ORIGINS.split(",").map((origin) => origin.trim()),
  "http://localhost:3000",
  "http://localhost:4000",
  "http://localhost:5000"
].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.includes(origin) || LOCAL_ORIGIN_REGEX.test(origin) || /^https:\/\/skill-bridge-backend-nine.*\.vercel\.app$/.test(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin);
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin"
    ]
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", toNodeHandler(auth));
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Connect with Expert Tutors, Learn Anything"
  });
});
app.use("/api/v1", IndexRoutes);
app.use(globalErrorHandler);
app.use(notFound);
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
