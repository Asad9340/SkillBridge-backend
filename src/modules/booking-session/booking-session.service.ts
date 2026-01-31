import { Booking } from '../../../generated/prisma/client';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../errors/AppError';

const CreateSession = async ({
  tutorId,
  subjectId,
  availabilityId,
  studentId,
}: Booking) => {
  console.log(tutorId, subjectId, availabilityId, studentId);
  const booking = await prisma.$transaction(async tx => {
    const slot = await tx.availability.findFirst({
      where: { id: availabilityId, tutorId, isBooked: false },
    });

    if (!slot) new AppError(404, 'Slot not available');

    const newBooking = await tx.booking.create({
      data: { studentId, tutorId, subjectId, availabilityId },
    });

    await tx.availability.update({
      where: { id: availabilityId },
      data: { isBooked: true },
    });
    return newBooking;
  });
  return booking;
};
const GetAllBooking = async (studentId: string) => {
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
              image: true,
            },
          },
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
      availability: {
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          isBooked: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const flatBookings = bookings.map(b => ({
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
    updatedAt: b.updatedAt,
  }));

  return flatBookings;
};
const UpdateBooking = async (
  bookingId: string,
  bookingPayload: Partial<Booking>,
) => {
  const result = await prisma.booking.update({
    where: { id: bookingId },
    data: bookingPayload,
  });
  return result;
};
export const BookingSessionService = {
  CreateSession,
  GetAllBooking,
  UpdateBooking,
};
