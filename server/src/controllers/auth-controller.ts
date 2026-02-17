import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import crypto from 'crypto';
import { transporter } from '../config/nodemailer';

import jwt from 'jsonwebtoken';
import { hashPassword, comparePassword } from '../utils/hash';
import redis from '../config/redis';


export const deleteUserdatabyEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body; // أو req.params.email لو عايز تجيبها من URL

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // الأول نشوف لو المستخدم موجود
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // لو موجود، نحذفه
    await prisma.user.delete({
      where: { email },
    });

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const register = async (req: Request, res: Response) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        return res.status(400).json({ message: 'Missing fields' });
    }
    const existingUser = await prisma.user.findFirst({
  where: {
    OR: [
      { email },
      { username },
    ],
  },
});

// if (existingUser) {
//   return res.status(409).json({
//     message: "Email or username already exists",
//   });
// }


    try {
        const passwordHash = await hashPassword(password);

        const otp = crypto.randomInt(100000, 999999).toString();
        // لو تستخدم redis@4
        await redis.set(`OTP:${email}`, JSON.stringify({
            otp,
            username,
            email,
            password: passwordHash
        }), {
            EX: 300   // expiration بالثواني
        });

        const sendVerificationEmail = async (email: string, otp: string) => {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Verify your email",
                text: `Your verification code is: ${otp}`
            });
        };
        try {
            await sendVerificationEmail(email, otp);
            res.status(200).json({ message: "OTP sent to your email. Please verify to complete registration." });
        } catch (err) {
            res.status(500).json({ message: "Failed to send email", error: err });
        }




    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'Email or username already exists' });
        }

        return res.status(500).json({ message: 'Server error' });
    }
};

interface OtpUserData {
  otp: string;
  email: string;
  username: string;
  password: string;
}
export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body as { email?: string; otp?: string };

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  // 1️⃣ Get data from Redis
  const userDataB = await redis.get(`OTP:${email}`);

  if (!userDataB) {
    return res.status(400).json({ message: 'OTP expired or not found' });
  }

  const userData: OtpUserData = JSON.parse(userDataB);

  // 2️⃣ Validate OTP
  if (userData.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  // 3️⃣ Create user in DB
  const newUser = await prisma.user.create({
    data: {
      email: userData.email,
      username: userData.username,
      passwordHash: userData.password,
    },
    select: {
      id: true,
      email: true,
      username: true,
      createdAt: true,
    },
  });

  // 4️⃣ Delete OTP from Redis
  await redis.del(`OTP:${email}`);

  return res.json({
    message: 'Email verified and registration completed successfully. Please login.',
    user: newUser,
  });
};
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await comparePassword(password, user.passwordHash);

    if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const payload = { userId: user.id, email: user.email, username: user.username };
    const secret = process.env.JWT_SECRET as string;
  

      const token = jwt.sign(payload, secret);


    return res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        token
    });
};
