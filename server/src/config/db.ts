import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    console.log(process.env.DATABASE_URL, "\n");
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error(error)
    console.error('❌ Database connection failed');
    process.exit(1); 
  }
};

export { prisma, connectDB };
