import { Booking } from '../../../generated/prisma/client';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../errors/AppError';

const CreateSession = async ({
  tutorId,
  subjectId,
  availabilityId,
  studentId,
}: Booking) => {
  const booking = await prisma.$transaction(async tx => {
    const slot = await tx.availability.findFirst({
      where: { id: availabilityId, tutorId, isBooked: false },
    });

    if (!slot) new AppError(404,'Slot not available');

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
  const result = await prisma.booking.findMany({
    where: { studentId },
  });
  return result;
};

export const BookingSessionService = {
  CreateSession,
  GetAllBooking,
};
