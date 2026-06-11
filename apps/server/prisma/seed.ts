import { Prisma, PrismaClient } from '@prisma/client';
import {
  countPlaces,
  mockDayPlans,
  pickCover,
  pickTheme,
} from '../src/trips/trip-builder';

const prisma = new PrismaClient();

/** 与前端 seedTrips 对齐的本地 mock 数据，仅写入本机 dev.db */
const seedTrips = [
  {
    destination: '烟台',
    days: 3,
    preferences: ['自然风光'],
    title: '烟台三日海韵慢行',
    nights: '3天2晚',
    coverIndex: 0,
    themeIndex: 0,
  },
  {
    destination: '成都',
    days: 2,
    preferences: ['美食'],
    title: '成都美食周末游',
    nights: '2天1晚',
    coverIndex: 1,
    themeIndex: 1,
  },
];

async function main() {
  console.log('清空旧行程...');
  await prisma.trip.deleteMany();

  for (const item of seedTrips) {
    const dayPlans = mockDayPlans(item.destination, item.days);

    await prisma.trip.create({
      data: {
        destination: item.destination,
        days: item.days,
        preferences: item.preferences,
        title: item.title,
        nights: item.nights,
        placeCount: countPlaces(dayPlans),
        cover: pickCover(item.coverIndex),
        theme: pickTheme(item.themeIndex),
        dayPlans: dayPlans as unknown as Prisma.InputJsonValue,
      },
    });

    console.log(`已写入：${item.title}`);
  }

  console.log(`完成，共 ${seedTrips.length} 条 mock 行程。`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
