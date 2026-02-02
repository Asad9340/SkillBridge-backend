// src/app.ts
import express from "express";
import { toNodeHandler } from "better-auth/node";

// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// lib/prisma.ts
import "dotenv/config";

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
  "inlineSchema": 'enum BookingStatus {\n  PENDING\n  CONFIRMED\n  COMPLETED\n  CANCELLED\n}\n\nmodel Booking {\n  id             String        @id @default(uuid())\n  studentId      String\n  tutorId        String\n  subjectId      String\n  availabilityId String\n  status         BookingStatus @default(PENDING)\n  createdAt      DateTime      @default(now())\n  updatedAt      DateTime      @default(now())\n\n  student      User         @relation("StudentBookings", fields: [studentId], references: [id])\n  tutor        TutorProfile @relation("TutorBookings", fields: [tutorId], references: [id])\n  subject      Subject      @relation(fields: [subjectId], references: [id])\n  availability Availability @relation(fields: [availabilityId], references: [id])\n\n  @@unique([availabilityId])\n}\n\nmodel Review {\n  id        String       @id @default(uuid())\n  student   User         @relation("StudentReviews", fields: [studentId], references: [id])\n  studentId String\n  tutor     TutorProfile @relation("TutorReviews", fields: [tutorId], references: [id])\n  tutorId   String\n  rating    Int          @default(5)\n  comment   String?\n  createdAt DateTime     @default(now())\n  updatedAt DateTime     @updatedAt\n}\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel Category {\n  id          String  @id @default(uuid())\n  name        String  @unique\n  description String?\n\n  subjects Subject[]\n}\n\nmodel Subject {\n  id             String         @id @default(uuid())\n  name           String\n  categoryId     String\n  category       Category       @relation(fields: [categoryId], references: [id])\n  tutors         TutorSubject[]\n  bookings       Booking[]\n  availabilities Availability[]\n}\n\nmodel TutorSubject {\n  id        String @id @default(uuid())\n  tutorId   String\n  subjectId String\n\n  tutor   TutorProfile @relation(fields: [tutorId], references: [id])\n  subject Subject      @relation(fields: [subjectId], references: [id])\n\n  @@unique([tutorId, subjectId])\n}\n\nmodel TutorProfile {\n  id           String   @id @default(uuid())\n  userId       String   @unique\n  user         User     @relation(fields: [userId], references: [id])\n  bio          String?\n  hourlyRate   Float\n  rating       Float    @default(0)\n  totalReviews Int      @default(0)\n  createdAt    DateTime @default(now())\n  updatedAt    DateTime @updatedAt\n\n  subjects     TutorSubject[]\n  availability Availability[]\n  bookings     Booking[]      @relation("TutorBookings")\n  reviews      Review[]       @relation("TutorReviews")\n}\n\nmodel Availability {\n  id        String   @id @default(uuid())\n  tutorId   String\n  subjectId String\n  date      DateTime\n  startTime String\n  endTime   String\n  isBooked  Boolean  @default(false)\n\n  tutor   TutorProfile @relation(fields: [tutorId], references: [id])\n  subject Subject      @relation(fields: [subjectId], references: [id])\n  booking Booking?\n\n  @@index([tutorId])\n}\n\nenum Role {\n  STUDENT\n  TUTOR\n  ADMIN\n}\n\nenum UserStatus {\n  ACTIVE\n  INACTIVE\n  SUSPENDED\n}\n\nmodel User {\n  id            String      @id\n  name          String\n  email         String      @unique\n  emailVerified Boolean     @default(false)\n  image         String?\n  role          Role?       @default(STUDENT)\n  phone         String?\n  status        UserStatus? @default(ACTIVE)\n  bio           String?\n  createdAt     DateTime    @default(now())\n  updatedAt     DateTime    @updatedAt\n\n  tutorProfile TutorProfile?\n  bookings     Booking[]     @relation("StudentBookings")\n  reviews      Review[]      @relation("StudentReviews")\n  sessions     Session[]\n  accounts     Account[]\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String   @unique\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"Booking":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"subjectId","kind":"scalar","type":"String"},{"name":"availabilityId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"BookingStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"student","kind":"object","type":"User","relationName":"StudentBookings"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"TutorBookings"},{"name":"subject","kind":"object","type":"Subject","relationName":"BookingToSubject"},{"name":"availability","kind":"object","type":"Availability","relationName":"AvailabilityToBooking"}],"dbName":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"User","relationName":"StudentReviews"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"TutorReviews"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"subjects","kind":"object","type":"Subject","relationName":"CategoryToSubject"}],"dbName":null},"Subject":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToSubject"},{"name":"tutors","kind":"object","type":"TutorSubject","relationName":"SubjectToTutorSubject"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToSubject"},{"name":"availabilities","kind":"object","type":"Availability","relationName":"AvailabilityToSubject"}],"dbName":null},"TutorSubject":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"subjectId","kind":"scalar","type":"String"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"TutorProfileToTutorSubject"},{"name":"subject","kind":"object","type":"Subject","relationName":"SubjectToTutorSubject"}],"dbName":null},"TutorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"TutorProfileToUser"},{"name":"bio","kind":"scalar","type":"String"},{"name":"hourlyRate","kind":"scalar","type":"Float"},{"name":"rating","kind":"scalar","type":"Float"},{"name":"totalReviews","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"subjects","kind":"object","type":"TutorSubject","relationName":"TutorProfileToTutorSubject"},{"name":"availability","kind":"object","type":"Availability","relationName":"AvailabilityToTutorProfile"},{"name":"bookings","kind":"object","type":"Booking","relationName":"TutorBookings"},{"name":"reviews","kind":"object","type":"Review","relationName":"TutorReviews"}],"dbName":null},"Availability":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"subjectId","kind":"scalar","type":"String"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"startTime","kind":"scalar","type":"String"},{"name":"endTime","kind":"scalar","type":"String"},{"name":"isBooked","kind":"scalar","type":"Boolean"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"AvailabilityToTutorProfile"},{"name":"subject","kind":"object","type":"Subject","relationName":"AvailabilityToSubject"},{"name":"booking","kind":"object","type":"Booking","relationName":"AvailabilityToBooking"}],"dbName":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"phone","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"bio","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorProfileToUser"},{"name":"bookings","kind":"object","type":"Booking","relationName":"StudentBookings"},{"name":"reviews","kind":"object","type":"Review","relationName":"StudentReviews"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"}],"dbName":null},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":null},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null}},"enums":{},"types":{}}');
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

// lib/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// lib/auth.ts
var auth = betterAuth({
  baseURL: "https://skill-bridge-sooty-five.vercel.app/api/auth",
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  // trustedOrigins: [process.env.TRUSTED_ORIGINS || 'http://localhost:5000'],
  trustedOrigins: async (request) => {
    const origin = request?.headers.get("origin");
    const allowedOrigins2 = [
      process.env.TRUSTED_ORIGINS,
      process.env.BETTER_AUTH_URL,
      "http://localhost:3000",
      "http://localhost:4000",
      "http://localhost:5000",
      "https://skill-bridge-backend-nine.vercel.app",
      "https://skill-bridge-sooty-five.vercel.app"
    ].filter(Boolean);
    if (!origin || allowedOrigins2.includes(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return [origin];
    }
    return [];
  },
  basePath: "/api/auth",
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
        required: false
      },
      phone: {
        type: "string",
        required: false
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false
      },
      bio: {
        type: "string",
        required: false
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true
    // sendVerificationEmail: async ({ user, url, token }, request) => {
    //   try {
    //     const verificationUrl = `${url}/verify-email?token=${token}`;
    //     await transporter.sendMail({
    //       from: '"Level 2" <no-reply@yourapp.com>',
    //       to: user.email,
    //       subject: 'Verify your email address',
    //       html: `
    //               <!DOCTYPE html>
    //               <html>
    //               <head>
    //                 <meta charset="UTF-8" />
    //                 <title>Verify Email</title>
    //               </head>
    //               <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial">
    //                 <table width="100%" cellpadding="0" cellspacing="0">
    //                   <tr>
    //                     <td align="center">
    //                       <table width="600" style="background:#ffffff;border-radius:8px;padding:32px">
    //                         <tr>
    //                           <td>
    //                             <h2>Hello ${user.name || 'there'},</h2>
    //                             <p>Please verify your email address.</p>
    //                             <p style="margin:24px 0">
    //                               <a href="${verificationUrl}"
    //                                 style="background:#4f46e5;color:#ffffff;
    //                                         padding:14px 28px;border-radius:6px;
    //                                         text-decoration:none;font-weight:bold">
    //                                 Verify Email
    //                               </a>
    //                             </p>
    //                             <p>If the button doesn’t work, use this link:</p>
    //                             <p>${verificationUrl}</p>
    //                             <p>This link expires in <strong>15 minutes</strong>.</p>
    //                           </td>
    //                         </tr>
    //                       </table>
    //                     </td>
    //                   </tr>
    //                 </table>
    //               </body>
    //               </html>
    //     `,
    //     });
    //   } catch (error) {
    //     console.error('Error sending verification email:', error);
    //     throw new Error('Could not send verification email');
    //   }
    // },
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  },
  // session: {
  //   cookieCache: {
  //     enabled: true,
  //     maxAge: 5 * 60, // 5 minutes
  //   },
  // },
  // advanced: {
  //   cookiePrefix: 'better-auth',
  //   useSecureCookies: process.env.NODE_ENV === 'production',
  //   crossSubDomainCookies: {
  //     enabled: false,
  //   },
  //   disableCSRFCheck: true,
  // },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
      path: "/"
    },
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          path: "/"
        }
      }
    },
    trustProxy: true
  },
  secret: "thisisasecretforbetterauth"
});

// src/app.ts
import cors from "cors";

// src/router/router.ts
import { Router as Router10 } from "express";

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
var auth2 = (...roles) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers
      });
      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized!"
        });
      }
      if (!session.user.emailVerified) {
        const id = session.user.id;
        await prisma.user.update({
          where: { id },
          data: {
            emailVerified: true
          }
        });
      }
      if (session.user.status && session.user.status !== "ACTIVE") {
        return res.status(403).json({
          success: false,
          message: `Your account is ${session.user.status}. Please contact support!`
        });
      }
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        emailVerified: session.user.emailVerified
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
var UpdateUserProfile2 = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const userPayload = req.body;
  const result = await UsersService.UpdateUserProfile(userId, userPayload);
  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: result
  });
});
var UsersController = {
  GetAllUsers: GetAllUsers2,
  UpdateUserStatus: UpdateUserStatus2,
  UpdateUserProfile: UpdateUserProfile2
};

// src/modules/users/users.route.ts
var router2 = Router2();
router2.get("/", auth_default("ADMIN" /* ADMIN */), UsersController.GetAllUsers);
router2.patch(
  "/:userId",
  auth_default("ADMIN" /* ADMIN */),
  UsersController.UpdateUserStatus
);
router2.patch(
  "/update-student/:userId",
  auth_default("STUDENT" /* STUDENT */),
  UsersController.UpdateUserProfile
);
var UsersRouters = router2;

// src/modules/tutors-profile/tutors-profile.route.ts
import { Router as Router3 } from "express";

// src/modules/tutors-profile/tutors-profile.service.ts
var GetAllTutors = async (queryData) => {
  const { category, search, page = "1", limit = "10" } = queryData;
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
    const num = Number(trimmed);
    if (!isNaN(num)) {
      andConditions.push({
        OR: [{ rating: { gte: num } }, { hourlyRate: { equals: num } }]
      });
    } else {
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
  }
  const whereCondition = andConditions.length ? { AND: andConditions } : {};
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
      orderBy: { rating: "desc" },
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
  const tutorProfile = await prisma.tutorProfile.create({
    data: tutorPayload
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
router3.get(
  "/:tutorId",
  TutorsProfileController.GetTutorProfileById
);
router3.post(
  "/",
  auth_default("STUDENT" /* STUDENT */),
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
    const tutorId = req.params.availabilityId;
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
  UpdateStudentProfile
};

// src/modules/user-profile/user-profile.controller.ts
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
var StudentProfileController = {
  UpdateStudentProfile: UpdateStudentProfile2
};

// src/modules/user-profile/user-profile.route.ts
var router6 = Router6();
router6.post("/:studentId", auth_default("STUDENT" /* STUDENT */), StudentProfileController.UpdateStudentProfile);
var UserProfileRouter = router6;

// src/modules/booking-session/booking-session.route.ts
import { Router as Router7 } from "express";

// src/errors/AppError.ts
var AppError = class extends Error {
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
      throw new AppError(404, "Slot not available");
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
  auth_default("ADMIN" /* ADMIN */),
  AnalyticsController.GetAdminAnalytics
);
var AnalyticsRouters = router9;

// src/router/router.ts
var router10 = Router10();
router10.use("/categories", CategoriesRouters);
router10.use("/subjects", SubjectsRouters);
router10.use("/manage-users", UsersRouters);
router10.use("/student-profile", UserProfileRouter);
router10.use("/tutors-profile", TutorsProfileRouters);
router10.use("/tutors-availability", TutorsAvailabilityRoutes);
router10.use("/booking-session", BookingSessionRouter);
router10.use("/reviews", ReviewRouters);
router10.use("/analytics", AnalyticsRouters);

// src/middlewares/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong",
    errors: err.errors || null
  });
};

// src/app.ts
var app = express();
app.set("trust proxy", true);
var allowedOrigins = [
  "https://skill-bridge-backend-nine.vercel.app",
  process.env.PROD_APP_URL,
  "http://localhost:3000",
  "http://localhost:4000",
  "http://localhost:5000"
].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.includes(origin) || /^https:\/\/skill-bridge-backend-nine.*\.vercel\.app$/.test(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin);
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"]
  })
);
app.use(express.json());
app.all("/api/auth/*splat", toNodeHandler(auth));
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Connect with Expert Tutors, Learn Anything"
  });
});
app.use("/api/v1", router10);
app.use(globalErrorHandler);
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
