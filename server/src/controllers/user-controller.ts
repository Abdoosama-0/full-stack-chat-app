import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();



export const searchUsers = async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ message: 'Search query is required' });
  }
  const search = q.trim().toLowerCase();


  try {
    const users = await prisma.user.findMany({
  where: {
    username: {
      contains: search,
    },
  },
  select: {
    id: true,
    username: true,
  },
});

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


