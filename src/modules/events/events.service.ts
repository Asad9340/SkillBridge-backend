import { prisma } from '../../../lib/prisma';

export interface EventsQuery {
  search?: string;
  category?: string;
  status?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}

const GetAllEvents = async (queryData: EventsQuery) => {
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
    sortBy = 'startsAt',
    sortOrder = 'asc',
    page = '1',
    limit = '10',
  } = queryData;

  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.min(50, Math.max(1, Number(limit) || 10));
  const skip = (pageNumber - 1) * limitNumber;

  const where: Record<string, any> = {};

  if (search?.trim()) {
    const value = search.trim();
    where.OR = [
      { title: { contains: value, mode: 'insensitive' } },
      { description: { contains: value, mode: 'insensitive' } },
      { category: { contains: value, mode: 'insensitive' } },
      { location: { contains: value, mode: 'insensitive' } },
    ];
  }

  if (category?.trim()) {
    where.category = { contains: category.trim(), mode: 'insensitive' };
  }

  if (status?.trim() && status !== 'ALL') {
    where.status = status as any;
  }

  if (location?.trim()) {
    where.location = { contains: location.trim(), mode: 'insensitive' };
  }

  if (minRating && !Number.isNaN(Number(minRating))) {
    where.rating = { gte: Number(minRating) };
  }

  if (minPrice && !Number.isNaN(Number(minPrice))) {
    where.price = { ...(where.price || {}), gte: Number(minPrice) };
  }

  if (maxPrice && !Number.isNaN(Number(maxPrice))) {
    where.price = { ...(where.price || {}), lte: Number(maxPrice) };
  }

  const parsedDateFrom = dateFrom ? new Date(dateFrom) : null;
  const parsedDateTo = dateTo ? new Date(dateTo) : null;
  const hasValidDateFrom = Boolean(
    parsedDateFrom && !Number.isNaN(parsedDateFrom.getTime()),
  );
  const hasValidDateTo = Boolean(
    parsedDateTo && !Number.isNaN(parsedDateTo.getTime()),
  );

  if (hasValidDateFrom || hasValidDateTo) {
    where.startsAt = {
      ...(hasValidDateFrom ? { gte: parsedDateFrom as Date } : {}),
      ...(hasValidDateTo ? { lte: parsedDateTo as Date } : {}),
    };
  }

  const allowedSortBy = new Set(['startsAt', 'price', 'rating', 'createdAt']);
  const safeSortBy = allowedSortBy.has(sortBy) ? sortBy : 'startsAt';
  const safeSortOrder = sortOrder === 'desc' ? 'desc' : 'asc';

  const [events, total, categories] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { [safeSortBy]: safeSortOrder },
      skip,
      take: limitNumber,
    }),
    prisma.event.count({ where }),
    prisma.event.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    }),
  ]);

  return {
    meta: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.max(1, Math.ceil(total / limitNumber)),
    },
    filters: {
      categories: categories.map((item: { category: string }) => item.category),
    },
    data: events,
  };
};

type EventPayload = {
  title: string;
  description: string;
  category: string;
  location: string;
  startsAt: Date;
  endsAt: Date;
  price: number;
  rating: number;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  mediaUrls: string[];
};

const CreateEvent = async (payload: EventPayload) => {
  const result = await prisma.event.create({
    data: payload,
  });

  return result;
};

const UpdateEvent = async (id: string, payload: Partial<EventPayload>) => {
  const result = await prisma.event.update({
    where: { id },
    data: payload,
  });

  return result;
};

const DeleteEvent = async (id: string) => {
  await prisma.event.delete({ where: { id } });
};

export const EventsService = {
  GetAllEvents,
  CreateEvent,
  UpdateEvent,
  DeleteEvent,
};
