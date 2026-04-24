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
export const getChatHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.userId;
    const chatId = Number(req.params.chatId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    if (!chatId) {
      return res.status(400).json({ message: 'chatId is required' });
    }

    // 1️⃣ check membership
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { members: true },
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const isMember = chat.members.some((m) => m.userId === userId);
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this chat' });
    }

    // 2️⃣ get chat member state
    const member = await prisma.chatMember.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    // 3️⃣ get messages (filtered)
    const messages = await prisma.message.findMany({
      where: {
        chatId,
        ...(member?.lastSeenMessageId && {
          id: {
            gt: member.lastSeenMessageId,
          },
        }),
      },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        sender: { select: { username: true } },
      },
    });

    // 4️⃣ safe response
    const safeMessages = messages.map((m) => ({
      ...m,
      id: m.id.toString(),
      chatId: m.chatId.toString(),
      senderId: m.senderId.toString(),
    }));

    return res.json({
      chatId,
      messages: safeMessages,
      page,
      limit,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


export const getUserChats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res.status(401).json({ message: "Unauthorized" });

    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: {
      userId,
      hidden: false,
    },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: { select: { username: true } },
          },
        },
      },
    });

    const safeChats = chats.map((chat) => {
      const isPrivate = chat.members.length === 2;

      let otherUser = null;

      if (isPrivate) {
        const otherMember = chat.members.find(
          (m) => m.userId !== userId
        );

        if (otherMember) {
          otherUser = {
            id: otherMember.user.id.toString(),
            username: otherMember.user.username,
            email: otherMember.user.email,
            avatar: otherMember.user.avatar,
          };
        }
      }

      return {
        id: chat.id.toString(),
        isPrivate,
        ...(isPrivate
          ? { otherUser }
          : {
              members: chat.members.map((m) => ({
                userId: m.userId.toString(),
                username: m.user.username,
                email: m.user.email,
                avatar: m.user.avatar,
              })),
            }),
        messages: chat.messages.map((msg) => ({
          id: msg.id.toString(),
          chatId: msg.chatId.toString(),
          senderId: msg.senderId.toString(),
          content: msg.content,
          type: msg.type,
          createdAt: msg.createdAt,
          sender: { username: msg.sender.username },
        })),
      };
    });

    res.json({ chats: safeChats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getChatData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    console.log("1");

    const receiverId = Number(req.params.receiverId);

    if (!receiverId) {
          console.log("2");

      return res.status(400).json({ message: "Invalid receiver id" });
    }

    const chat = await prisma.chat.findFirst({
      where: {
        AND: [
          { members: { some: { userId: userId } } },
          { members: { some: { userId: receiverId } } },
        ],
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      console.log("3");
      return res.status(404).json({ message: "There is no chat" });
    }

    // نتأكد إنه private chat (عضوين بس)
    if (chat.members.length !== 2) {
      console.log("4");
      return res.status(400).json({ message: "Not a private chat" });
    }

    // نجيب اليوزر التاني بس
    const otherUser = chat.members.find(
      (member) => member.userId !== userId
    )?.user;
console.log("Chat found between user", userId, "and", receiverId, "with chat ID:", chat.id);
console.log("Other user in chat:", otherUser);
console.log("Chat members:", chat.id);
    console.log("5");

    return res.status(200).json({
      chatId: chat.id,
      user: otherUser,
    });

  } catch (error) {
        console.log("6");

    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

//===============delete chat================
export const deleteChat = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const chatId = Number(req.params.chatId);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // 1️⃣ هات آخر رسالة في الشات
  const lastMessage = await prisma.message.findFirst({
    where: { chatId },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  // 2️⃣ اعمل update للـ ChatMember
  await prisma.chatMember.update({
    where: {
      chatId_userId: {
        chatId,
        userId,
      },
    },
    data: {
      hidden: true,
      lastSeenMessageId: lastMessage?.id ?? null, // 👈 الحل هنا
    },
  });

  return res.json({ message: "Chat hidden for you" });
};