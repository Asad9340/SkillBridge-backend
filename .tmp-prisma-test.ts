import { prisma } from './src/app/lib/prisma';

async function main() {
  console.time('connect');
  await prisma.$connect();
  console.timeEnd('connect');
  console.log('ok');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
