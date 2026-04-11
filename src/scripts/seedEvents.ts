import { prisma } from '../app/lib/prisma';

const DAY = 24 * 60 * 60 * 1000;

const seedEvents = async () => {
  const existingCount = await prisma.event.count();
  if (existingCount > 0) {
    console.log(`Events already exist: ${existingCount}`);
    return;
  }

  const now = new Date();

  await prisma.event.createMany({
    data: [
      {
        title: 'SAT Math Bootcamp',
        description: 'Intensive problem-solving workshop for SAT Math success.',
        category: 'Exam Prep',
        location: 'Dhaka',
        startsAt: new Date(now.getTime() + DAY * 3),
        endsAt: new Date(now.getTime() + DAY * 3 + 2 * 60 * 60 * 1000),
        price: 1200,
        rating: 4.8,
        status: 'UPCOMING',
        mediaUrls: [
          'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
        ],
      },
      {
        title: 'Spoken English Live Clinic',
        description: 'Practice speaking confidence with live tutor feedback.',
        category: 'Language',
        location: 'Chattogram',
        startsAt: new Date(now.getTime() + DAY * 5),
        endsAt: new Date(now.getTime() + DAY * 5 + 90 * 60 * 1000),
        price: 800,
        rating: 4.6,
        status: 'UPCOMING',
        mediaUrls: [
          'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
        ],
      },
      {
        title: 'React Project Sprint',
        description:
          'Build and deploy a modern React app with mentor guidance.',
        category: 'Programming',
        location: 'Online',
        startsAt: new Date(now.getTime() + DAY),
        endsAt: new Date(now.getTime() + DAY + 3 * 60 * 60 * 1000),
        price: 1500,
        rating: 4.9,
        status: 'ONGOING',
        mediaUrls: [
          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        ],
      },
      {
        title: 'Physics Revision Marathon',
        description: 'Core concept revision for HSC physics students.',
        category: 'Science',
        location: 'Sylhet',
        startsAt: new Date(now.getTime() - DAY * 2),
        endsAt: new Date(now.getTime() - DAY * 2 + 2 * 60 * 60 * 1000),
        price: 600,
        rating: 4.3,
        status: 'COMPLETED',
        mediaUrls: [
          'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
        ],
      },
      {
        title: 'UI Design Fundamentals',
        description: 'Learn Figma workflow and practical UI principles.',
        category: 'Design',
        location: 'Khulna',
        startsAt: new Date(now.getTime() + DAY * 10),
        endsAt: new Date(now.getTime() + DAY * 10 + 2 * 60 * 60 * 1000),
        price: 900,
        rating: 4.5,
        status: 'UPCOMING',
        mediaUrls: [
          'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=1200&q=80',
        ],
      },
      {
        title: 'Data Analysis with Excel',
        description: 'Hands-on data cleaning and dashboard building session.',
        category: 'Business',
        location: 'Rajshahi',
        startsAt: new Date(now.getTime() + DAY * 7),
        endsAt: new Date(now.getTime() + DAY * 7 + 2 * 60 * 60 * 1000),
        price: 700,
        rating: 4.4,
        status: 'UPCOMING',
        mediaUrls: [
          'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
        ],
      },
    ],
  });

  const seededCount = await prisma.event.count();
  console.log(`Seeded events. Total now: ${seededCount}`);
};

seedEvents()
  .catch(error => {
    console.error('Failed to seed events:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
