import { Response } from "express";
import { Request } from "express";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { uploadToCloudinary } from "../utils/uploadPhoto";
import { transporter } from "../config/nodemailer";
import redis from "../config/redis";

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
        avatar:true,
      },
    });
    console.log("Search results for query:", search, "=>", users);

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User data fetched successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

//upload avatar to cloudinary
export const updateAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 1️⃣ upload to cloudinary
    const result: any = await uploadToCloudinary(req.file);

    // 2️⃣ update user in DB
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatar: result.secure_url,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
      },
    });

    return res.status(200).json({
      message: "Avatar uploaded successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Upload failed",
      error,
    });
  }
};

//edit username, email controller
export const editUserName = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { username },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
      },
    });

    return res.status(200).json({
      message: "Username updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    return res.status(500).json({ message: "Server error" });
  }
};


export const updateEmail = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({ message: "New email is required" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    await redis.set(
      `EMAIL_CHANGE:${userId}`,
      JSON.stringify({
        otp,
        newEmail,
      }),
      { EX: 300 } // 5 minutes
    );

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: newEmail,
      subject: "Email Change Verification",
      text: `Your OTP is: ${otp}`,
    });

    return res.status(200).json({
      message: "OTP sent to new email",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

export const verifyEmailChange = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const data = await redis.get(`EMAIL_CHANGE:${userId}`);

    if (!data) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const parsed = JSON.parse(data);

    if (parsed.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email: parsed.newEmail,
      },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
      },
    });

    await redis.del(`EMAIL_CHANGE:${userId}`);

    return res.status(200).json({
      message: "Email updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 🔥 optional: delete related data first (safe cleanup)

    // delete messages
    await prisma.message.deleteMany({
      where: {
        senderId: userId,
      },
    });

    // remove from chat members
    await prisma.chatMember.deleteMany({
      where: {
        userId,
      },
    });

    // delete chats where no members left (optional safety)
    await prisma.chat.deleteMany({
      where: {
        members: {
          none: {},
        },
      },
    });

    // 🧨 delete user
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Server error",
      error,
    });
  }
};