import { prisma } from '../../../lib/prisma';

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
const GetAdminAnalytics = async (studentId: string) => {
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

  const totalTutors = await prisma.tutorProfile.count();
  const totalStudents = await prisma.user.count();

  return {
    bookingSummary,
    totalTutors,
    totalStudents,
  };
};

export const AnalyticsService = {
  GetTutorAnalytics,
  GetStudentAnalytics,
  GetAdminAnalytics,
};
