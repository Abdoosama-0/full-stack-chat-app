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

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

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
          take: 1, // آخر رسالة فقط
          include: {
            sender: {
              select: { username: true },
            },
          },
        },
      },
    });

    const safeChats = chats.map((chat) => {
      const isGroup = chat.isGroup;
      const isPrivate = !chat.isGroup;

      let otherUser = null;

      // 💬 private chat
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
        isGroup, // 👈 جديد

        ...(isGroup
          ? {
              name: chat.name, // 👈 اسم الجروب
              members: chat.members.map((m) => ({
                userId: m.userId.toString(),
                username: m.user.username,
                email: m.user.email,
                avatar: m.user.avatar,
              })),
            }
          : {
              otherUser,
            }),

        messages: chat.messages.map((msg) => ({
          id: msg.id.toString(),
          chatId: msg.chatId.toString(),
          senderId: msg.senderId.toString(),
          content: msg.content,
          type: msg.type,
          createdAt: msg.createdAt,
          sender: {
            username: msg.sender.username,
          },
        })),
      };
    });

    return res.json({ chats: safeChats });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
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

export const getChat = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const chatId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (isNaN(chatId)) {
      return res.status(400).json({ message: "Invalid chat id" });
    }

    // 1. check if user is member in this chat
    const membership = await prisma.chatMember.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ message: "You are not a member of this chat" });
    }

    // 2. get chat details
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
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
          orderBy: { createdAt: "asc" },
          take: 50, // آخر 50 رسالة
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
            status: true,
          },
        },
      },
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    return res.status(200).json(chat);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
//===================group
//=======================create chat group
export const createGroupChat = async (req: AuthRequest, res: Response) => {
  try {
    const creatorId = req.user?.userId;

    if (!creatorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { usernames, name } = req.body;

    // ✅ validation
    if (!Array.isArray(usernames) || usernames.length === 0) {
      return res.status(400).json({ message: "Usernames required" });
    }

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Group name is required" });
    }

    // 1. get users
    const users = await prisma.user.findMany({
      where: {
        username: {
          in: usernames,
        },
      },
    });

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // ⚠️ optional: تأكد إن كل اليوزرز موجودين
    if (users.length !== usernames.length) {
      return res.status(400).json({
        message: "Some usernames are invalid",
      });
    }

    // 2. create group chat
    const chat = await prisma.chat.create({
      data: {
        name: name.trim(),
        isGroup: true, // 👈 مهم
      },
    });

    // 3. add members (creator = admin)
    const membersData = [
      {
        chatId: chat.id,
        userId: creatorId,
        isAdmin: true,
      },
      ...users.map((u) => ({
        chatId: chat.id,
        userId: u.id,
        isAdmin: false,
      })),
    ];

    await prisma.chatMember.createMany({
      data: membersData,
      skipDuplicates: true,
    });

    return res.status(201).json({
      message: "Group chat created successfully",
      chatId: chat.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
//==================add member to group chat======================
export const addUserToGroup = async (req: Request, res: Response) => {
  try {
    const { chatId, username } = req.body;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.chatMember.create({
      data: {
        chatId,
        userId: user.id,
        isAdmin: false,
      },
    });

    return res.json({ message: "User added successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};