import { Response } from "express";
import { Request } from "express";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface JwtPayload {
  userId: number;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const searchUsers = async (req: AuthRequest, res: Response) => {
  const { q } = req.query;

  // ✅ تأكد إن المستخدم موجود (يعني التوكن صحيح)
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!q || typeof q !== "string") {
    return res.status(400).json({ message: "Search query is required" });
  }

  const search = q.trim();

  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            username: {
              contains: search,
             
            },
          },
          {
            id: {
              not: req.user.userId, // ✅ استبعاد نفسك
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
