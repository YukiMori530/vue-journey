"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
const guides_seed_data_1 = require("../src/notes/guides.seed-data");
const prisma = new client_1.PrismaClient();
const DEMO_EMAIL = 'demo@tuhui.com';
const DEMO_PASSWORD = '123456';
async function seedTravelGuides() {
    console.log('写入旅行攻略库...');
    for (const guide of guides_seed_data_1.travelGuideSeeds) {
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
    console.log(`攻略库完成，共 ${guides_seed_data_1.travelGuideSeeds.length} 篇。`);
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
//# sourceMappingURL=seed.js.map