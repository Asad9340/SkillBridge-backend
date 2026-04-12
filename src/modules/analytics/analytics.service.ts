import { prisma } from '../../../lib/prisma';
import { Role } from '../../../generated/prisma/enums';
import { envVars } from '../../app/config/env.config';

type TOpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

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
  prompt: string,
) => {
  const response = await fetch(envVars.OPENROUTER.API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': envVars.FRONTEND_URL,
      'X-Title': 'SkillBridge Admin Insights',
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        {
          role: 'system',
          content:
            'You are an operations intelligence assistant for a learning platform. Analyze data and provide practical, low-risk recommendations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.25,
      max_tokens: 420,
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

const GetTutorAnalytics = async (tutorId: string) => {
  const bookingStats = await prisma.booking.groupBy({
    by: ['status'],
    where: { tutorId },
    _count: { status: true },
  });
  const bookingSummary = {
    totalBookings: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  };
  bookingStats.forEach(item => {
    const count = item._count.status;
    bookingSummary.totalBookings += count;
    if (item.status === 'PENDING') bookingSummary.pending = count;
    if (item.status === 'CONFIRMED') bookingSummary.confirmed = count;
    if (item.status === 'COMPLETED') bookingSummary.completed = count;
    if (item.status === 'CANCELLED') bookingSummary.cancelled = count;
  });
  const reviewStats = await prisma.review.aggregate({
    where: { tutorId },
    _count: { id: true },
    _avg: { rating: true },
  });

  return {
    bookingSummary,
    reviewSummary: {
      totalReviews: reviewStats._count.id || 0,
      averageRating: Number(reviewStats._avg.rating || 0).toFixed(2),
    },
  };
};

const GetStudentAnalytics = async (studentId: string) => {
  const bookingStats = await prisma.booking.groupBy({
    by: ['status'],
    where: { studentId },
    _count: { status: true },
  });
  const bookingSummary = {
    totalBookings: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  };

  bookingStats.forEach(item => {
    const count = item._count.status;
    bookingSummary.totalBookings += count;
    if (item.status === 'PENDING') bookingSummary.pending = count;
    if (item.status === 'CONFIRMED') bookingSummary.confirmed = count;
    if (item.status === 'COMPLETED') bookingSummary.completed = count;
    if (item.status === 'CANCELLED') bookingSummary.cancelled = count;
  });

  return bookingSummary;
};
const GetAdminAnalytics = async (_adminId: string) => {
  const bookingStats = await prisma.booking.groupBy({
    by: ['status'],
    _count: { status: true },
  });

  const bookingSummary = {
    totalBookings: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  };

  bookingStats.forEach(item => {
    const count = item._count.status;
    bookingSummary.totalBookings += count;
    if (item.status === 'PENDING') bookingSummary.pending = count;
    if (item.status === 'CONFIRMED') bookingSummary.confirmed = count;
    if (item.status === 'COMPLETED') bookingSummary.completed = count;
    if (item.status === 'CANCELLED') bookingSummary.cancelled = count;
  });

  const [
    totalTutors,
    totalStudents,
    totalAdmins,
    totalManagers,
    totalOrganizers,
    totalSuperAdmins,
    totalUsers,
  ] = await Promise.all([
    prisma.user.count({ where: { role: Role.TUTOR } }),
    prisma.user.count({ where: { role: Role.STUDENT } }),
    prisma.user.count({ where: { role: Role.ADMIN } }),
    prisma.user.count({ where: { role: Role.MANAGER } }),
    prisma.user.count({ where: { role: Role.ORGANIZER } }),
    prisma.user.count({ where: { role: Role.SUPER_ADMIN } }),
    prisma.user.count(),
  ]);

  return {
    bookingSummary,
    totalTutors,
    totalStudents,
    totalUsers,
    roleSummary: {
      totalAdmins,
      totalManagers,
      totalOrganizers,
      totalSuperAdmins,
    },
  };
};

const GetAdminAIInsights = async (_adminId: string) => {
  const twentyOneDaysAgo = new Date();
  twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 20);

  const [recentBookings, recentUsers] = await Promise.all([
    prisma.booking.findMany({
      where: {
        createdAt: {
          gte: twentyOneDaysAgo,
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
    }),
    prisma.user.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 30,
      select: {
        id: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const dailyMap = new Map<string, number>();
  for (let i = 20; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, 0);
  }

  recentBookings.forEach(booking => {
    const key = booking.createdAt.toISOString().slice(0, 10);
    dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
  });

  const trendSeries = Array.from(dailyMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  const baselineSeries = trendSeries.slice(0, -1).map(item => item.count);
  const baselineAvg =
    baselineSeries.length > 0
      ? baselineSeries.reduce((sum, c) => sum + c, 0) / baselineSeries.length
      : 0;
  const todayCount = trendSeries[trendSeries.length - 1]?.count || 0;

  const anomalyFlags: string[] = [];
  if (baselineAvg >= 4 && todayCount >= Math.ceil(baselineAvg * 1.8)) {
    anomalyFlags.push('Possible booking spike detected in latest day.');
  }
  if (baselineAvg >= 4 && todayCount <= Math.floor(baselineAvg * 0.5)) {
    anomalyFlags.push('Possible booking drop detected in latest day.');
  }
  if (anomalyFlags.length === 0) {
    anomalyFlags.push('No major spike/drop detected by heuristic threshold.');
  }

  const summaryPayload = {
    bookingTrendLast21Days: trendSeries,
    baselineAverage: Number(baselineAvg.toFixed(2)),
    latestDayCount: todayCount,
    anomalyFlags,
    recentUsers: recentUsers.map(user => ({
      id: user.id,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })),
  };

  const apiKey = envVars.OPENROUTER.API_KEY;
  const models = [
    envVars.OPENROUTER.MODEL,
    envVars.OPENROUTER.FALLBACK_MODEL,
  ].filter(Boolean);

  let aiInsightsText =
    'AI insights are unavailable right now. Please verify OpenRouter configuration.';

  if (apiKey) {
    const prompt = [
      'Analyze the following admin analytics JSON.',
      'Tasks:',
      '1) Report booking trend anomalies (spike/drop/normal).',
      '2) Recommend role/status review actions from recent user activity.',
      'Rules: Be conservative, do not force automatic demotion/promotion. Mention manual review checks.',
      'Return markdown with exactly these headings:',
      '## Anomaly Insights',
      '## Suggested Role/Status Actions',
      '## Immediate Next Steps',
      JSON.stringify(summaryPayload),
    ].join('\n');

    for (const modelName of models) {
      const response = await requestOpenRouter(apiKey, modelName, prompt);
      if (response.ok) {
        aiInsightsText = response.reply;
        break;
      }
    }
  }

  return {
    trendSeries,
    anomalyFlags,
    aiInsights: aiInsightsText,
  };
};

export const AnalyticsService = {
  GetTutorAnalytics,
  GetStudentAnalytics,
  GetAdminAnalytics,
  GetAdminAIInsights,
};
