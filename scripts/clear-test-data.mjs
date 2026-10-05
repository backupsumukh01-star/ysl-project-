import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const testUsers = await prisma.user.findMany({ where: { email: { contains: "@example.com" } }, select: { id: true } });
const ids = testUsers.map((user) => user.id);
await prisma.review.deleteMany({ where: { userId: { in: ids } } });
await prisma.supportTicket.deleteMany({ where: { OR: [{ userId: { in: ids } }, { email: { contains: "@example.com" } }] } });
await prisma.session.deleteMany({ where: { userId: { in: ids } } });
await prisma.address.deleteMany({ where: { userId: { in: ids } } });
await prisma.cart.deleteMany({ where: { userId: { in: ids } } });
await prisma.order.deleteMany({ where: { email: { contains: "@example.com" } } });
await prisma.emailLog.deleteMany({ where: { recipient: { contains: "@example.com" } } });
await prisma.webhookEvent.deleteMany({});
await prisma.user.deleteMany({ where: { id: { in: ids } } });
const orders = await prisma.order.count();
const users = await prisma.user.count();
console.log(JSON.stringify({ orders, users }));
await prisma.$disconnect();
