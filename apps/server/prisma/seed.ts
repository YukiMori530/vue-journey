import * as bcrypt from 'bcrypt';
import { Prisma, PrismaClient } from '@prisma/client';
import {
  countPlaces,
  mockDayPlans,
  pickCover,
  pickTheme,
} from '../src/trips/trip-builder';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@tuhui.com';
const DEMO_PASSWORD = '123456';

/** 演示账号 + mock 行程，仅用于本地 PostgreSQL */
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
  console.log('创建演示用户...');
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { nickname: '演示用户', password },
    create: {
      email: DEMO_EMAIL,
      password,
      nickname: '演示用户',
    },
  });

  console.log(`演示账号：${DEMO_EMAIL} / ${DEMO_PASSWORD}`);

  console.log('清空该用户旧行程...');
  await prisma.trip.deleteMany({ where: { userId: user.id } });

  for (const item of seedTrips) {
    const dayPlans = mockDayPlans(item.destination, item.days);

    await prisma.trip.create({
      data: {
        userId: user.id,
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
