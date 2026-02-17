import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
interface JwtPayload {
  userId: number;
  email: string;
}
export interface AuthRequest extends Request {
  user?: JwtPayload;
}
export const getChatHistory = async (  req: AuthRequest,res: Response,) => {
  try {
    if (!req.user) {
  return res.status(401).json({ message: 'Unauthorized' });
}
    const userId = req.user.userId; // من auth middleware
    const chatId = Number(req.params.chatId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    if (!chatId) {
      return res.status(400).json({ message: 'chatId is required' });
    }

    // 1️⃣ تأكد إن المستخدم عضو في الشات
    console.log("Fetching chat:", chatId, "for user:", userId);
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        members: true, // عشان نتاكد من العضو
      },
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const isMember = chat.members.some((m) => m.userId === userId);
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this chat' });
    }

    // 2️⃣ جلب الرسائل
const messages = await prisma.message.findMany({
  where: { chatId },
  orderBy: { createdAt: 'asc' },
  skip: (page - 1) * limit,
  take: limit,
  include: { sender: { select: { username: true } } },
});

// حل المشكلة: تحويل الـ BigInt لـ string
const safeMessages = messages.map((m) => ({
  ...m,
  id: m.id.toString(),
  chatId: m.chatId.toString(),
  senderId: m.senderId.toString(),
}));

res.json({ chatId, messages: safeMessages, page, limit });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getUserChats = async (req: AuthRequest,res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // جلب كل الشاتات اللي المستخدم عضو فيها
    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: { user: { select: { username: true, email: true } } },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // آخر رسالة فقط
          include: { sender: { select: { username: true } } },
        },
      },
      orderBy: {
        messages: {
          _count: 'desc', // ترتيب حسب آخر رسالة
        },
      },
    });

    // تحويل BigInt لـ string
    const safeChats = chats.map((chat) => ({
      ...chat,
      id: chat.id.toString(),
      members: chat.members.map((m) => ({
        userId: m.userId.toString(),
        username: m.user.username,
        email: m.user.email,
      })),
      messages: chat.messages.map((msg) => ({
        id: msg.id.toString(),
        chatId: msg.chatId.toString(),
        senderId: msg.senderId.toString(),
        content: msg.content,
        type: msg.type,
        createdAt: msg.createdAt,
        sender: { username: msg.sender.username },
      })),
    }));

    res.json({ chats: safeChats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getChatId = async (req: AuthRequest,res: Response) =>{
try {  
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

 
const receiverId = Number(req.params.receiverId);

const chat = await prisma.chat.findFirst({
  where: {
    AND: [
      { members: { some: { userId: userId } } },
      { members: { some: { userId: receiverId } } },
    ],
  },
  include: {
    members: true,
  },
});

if (chat && chat.members.length === 2) {
  console.log("Private chat ID:", chat.id);
}


    if (!chat) {
      return res.status(404).json({ message: 'there is no chat' });
    }
    res.status(200).json({ chatId: chat.id});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }


}