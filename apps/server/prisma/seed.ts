import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { travelGuideSeeds } from '../src/notes/guides.seed-data';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@tuhui.com';
const DEMO_PASSWORD = '123456';

/** 仅初始化：演示账号 + 攻略库。不写入、不删除任何行程。 */
async function seedTravelGuides() {
  console.log('写入旅行攻略库...');
  for (const guide of travelGuideSeeds) {
    await prisma.travelGuide.upsert({
      where: { id: guide.id },
      update: {
        title: guide.title,
        author: guide.author,
        cover: guide.cover,
        destination: guide.destination,
        days: guide.days,
        category: guide.category,
        likes: guide.likes,
        snippet: guide.snippet,
        content: guide.content,
        keywords: guide.keywords,
      },
      create: {
        id: guide.id,
        title: guide.title,
        author: guide.author,
        cover: guide.cover,
        destination: guide.destination,
        days: guide.days,
        category: guide.category,
        likes: guide.likes,
        snippet: guide.snippet,
        content: guide.content,
        keywords: guide.keywords,
      },
    });
  }
  console.log(`攻略库完成，共 ${travelGuideSeeds.length} 篇。`);
}

async function main() {
  await seedTravelGuides();

  console.log('创建演示用户...');
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { nickname: '演示用户', password },
    create: {
      email: DEMO_EMAIL,
      password,
      nickname: '演示用户',
    },
  });

  console.log(`演示账号：${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log('seed 不会写入或删除行程，请在 App 内自行创建/删除。');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
