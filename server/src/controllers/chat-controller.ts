import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getIO} from "../socket"; // حسب setup عندك
import cloudinary from '../config/cloudinary';
import { uploadToCloudinary } from '../utils/uploadPhoto';

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
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.userId;
    const chatId = Number(req.params.chatId);

    if (!chatId) {
      return res.status(400).json({ message: "chatId is required" });
    }

    // 1️⃣ check chat + membership
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        members: true,
      },
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const isMember = chat.members.some((m) => m.userId === userId);

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this chat",
      });
    }

    // 2️⃣ get lastSeenMessageId
    const member = await prisma.chatMember.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    // 3️⃣ get ALL messages (NO pagination)
    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" }, // ترتيب طبيعي للشات
      include: {
        sender: {
          select: { username: true },
        },
      },
    });

    // 4️⃣ format messages
    const safeMessages = messages.map((m) => ({
      id: m.id.toString(),
      chatId: m.chatId.toString(),
      senderId: m.senderId.toString(),
      content: m.content,
      type: m.type,
      createdAt: m.createdAt,
      sender: {
        username: m.sender.username,
      },
    }));

    // 5️⃣ response
    return res.json({
      chatId,
      messages: safeMessages,
      lastSeenMessageId: member?.lastSeenMessageId
        ? member.lastSeenMessageId.toString()
        : null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
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
          take: 1,
          include: {
            sender: {
              select: { username: true },
            },
          },
        },
      },
    });

    const safeChats = await Promise.all(
      chats.map(async (chat) => {
        const isGroup = chat.isGroup;
        const isPrivate = !chat.isGroup;

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

        // =========================
        // last message
        // =========================
        const lastMessage = chat.messages[0]
          ? {
              id: chat.messages[0].id.toString(),
              content: chat.messages[0].content,
              createdAt: chat.messages[0].createdAt,
              sender: chat.messages[0].sender.username,
              senderId: chat.messages[0].senderId,
            }
          : null;

        // =========================
        // member state
        // =========================
        const member = await prisma.chatMember.findUnique({
          where: {
            chatId_userId: {
              chatId: chat.id,
              userId,
            },
          },
          select: {
            lastSeenMessageId: true,
          },
        });

        let lastSeenMessageId = member?.lastSeenMessageId
          ? member.lastSeenMessageId.toString()
          : null;

        // =========================
        // 🔥 AUTO UPDATE IF I SENT LAST MESSAGE
        // =========================
        if (
          lastMessage &&
          lastMessage.senderId === userId
        ) {
          lastSeenMessageId = lastMessage.id;

          // update DB
          await prisma.chatMember.update({
            where: {
              chatId_userId: {
                chatId: chat.id,
                userId,
              },
            },
            data: {
              lastSeenMessageId: Number(lastMessage.id),
            },
          });
        }

        // =========================
        // isUpToDate
        // =========================
        let isUpToDate = false;

        if (lastMessage && lastSeenMessageId) {
          isUpToDate =
            Number(lastSeenMessageId) >= Number(lastMessage.id);
        }

        return {
          id: chat.id.toString(),

          isPrivate,
          isGroup,

          ...(isGroup
            ? {
                name: chat.name,
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

          lastMessage,
          lastSeenMessageId,
          isUpToDate,
          chatPhoto: chat.chatPhoto,
        };
      })
    );

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
    const isCurrentUserAdmin =
  chat.members?.some(
    (m) => m.userId === userId && m.isAdmin === true
  ) || false;

    const safeJson = (data: any) =>
  JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
return res.status(200).json(safeJson({ ...chat, isCurrentUserAdmin }));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
//===================group
//=======================create chat group
const DEFAULT_GROUP_PHOTO =
  "https://static.vecteezy.com/system/resources/previews/026/019/617/non_2x/group-profile-avatar-icon-default-social-media-forum-profile-photo-vector.jpg";

export const createGroupChat = async (req: AuthRequest, res: Response) => {
  try {
    const creatorId = req.user?.userId;

    if (!creatorId) {
      return res.status(401).json({ message: "Unauthorized1" });
    }

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Group name required" });
    }
let {usernames} = req.body.usernames;

// لو جاية string (JSON)
if (typeof usernames === "string") {
  usernames = JSON.parse(usernames);
}
    // =========================
    // 1. get users
    // =========================
    const users = await prisma.user.findMany({
      where: {
        username: {
          in: usernames,
        },
      },
    });

    // =========================
    // 2. upload image (if exists)
    // =========================
    let chatPhoto = DEFAULT_GROUP_PHOTO;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "group-chats",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        stream.end(req.file?.buffer);
      });

      chatPhoto = (result as any).secure_url;
    }

    // =========================
    // 3. create chat
    // =========================
    const chat = await prisma.chat.create({
      data: {
        name,
        isGroup: true,
        chatPhoto, // 👈 الجديد
      },
    });

    // =========================
    // 4. members
    // =========================
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

    // =========================
    // 5. reload chat
    // =========================
    const fullChat = await prisma.chat.findUnique({
      where: { id: chat.id },
      include: {
        members: { include: { user: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: { select: { username: true } },
          },
        },
      },
    });

    if (!fullChat) {
      return res.status(500).json({ message: "Failed to load chat" });
    }

    // =========================
    // 6. payload
    // =========================
    const payload = {
      id: fullChat.id,
      isGroup: true,
      name: fullChat.name,
      chatPhoto: fullChat.chatPhoto, // 👈 مهم
      members: fullChat.members.map((m) => ({
        userId: m.userId,
        username: m.user.username,
        avatar: m.user.avatar,
      })),
      messages: fullChat.messages.map((msg) => ({
        content: msg.content,
        createdAt: msg.createdAt,
        sender: {
          username: msg.sender.username,
        },
      })),
    };

    const io = getIO();

    const allUsernames = [
      fullChat.members.find((m) => m.userId === creatorId)?.user.username,
      ...users.map((u) => u.username),
    ];

    for (const username of allUsernames) {
      if (!username) continue;
      io.to(`user:${username}`).emit("new-chat", payload);
      console.log("Emitted new-chat to", username, "with payload:", payload);
    }

    return res.status(201).json({
      message: "Group chat created successfully",
      chatId: chat.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
//=====================view group mempers===============
export const getGroupMembers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const chatId = Number(req.params.chatId);
    console.log("Fetching members for chat ID:", chatId, "by user ID:", userId);

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
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    // 2. check if chat is group
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: {
        id: true,
        name: true,
        isGroup: true,
      },
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat.isGroup) {
      return res.status(400).json({
        message: "This chat is not a group",
      });
    }

    // 3. get members
    const members = await prisma.chatMember.findMany({
      where: {
        chatId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
          },
        },
      },
    });

    // 4. format response
    const formattedMembers = members.map((m) => ({
      userId: m.userId,
      username: m.user.username,
      avatar: m.user.avatar,
      email: m.user.email,
      isAdmin: m.isAdmin,
    }));

    return res.status(200).json({
      chatId,
      groupName: chat.name,
      members: formattedMembers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
//==================update group photo======================
export const updateGroupPhoto = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const chatId = Number(req.params.chatId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (isNaN(chatId)) {
      return res.status(400).json({ message: "Invalid chat id" });
    }

    // =========================
    // 1️⃣ check membership
    // =========================
    const membership = await prisma.chatMember.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    // =========================
    // 2️⃣ check admin
    // =========================
    if (!membership.isAdmin) {
      return res.status(403).json({
        message: "Only admin can update group photo",
      });
    }

    // =========================
    // 3️⃣ check chat
    // =========================
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat || !chat.isGroup) {
      return res.status(400).json({
        message: "Invalid group",
      });
    }

    // =========================
    // 4️⃣ check file
    // =========================
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    // =========================
    // 5️⃣ upload to cloudinary
    // =========================
  let chatPhoto = DEFAULT_GROUP_PHOTO; // 👈 حط اللينك الافتراضي هنا

if (req.file) {
  const result = await new Promise<{
    secure_url: string;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "group-chats",
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result as { secure_url: string });
      }
    );

    stream.end(req.file?.buffer); // 👈 صح
  });

  chatPhoto = result.secure_url;
}
    // =========================
    // 6️⃣ update DB
    // =========================
    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: {
        chatPhoto: chatPhoto,
      },
    });

    // =========================
    // 7️⃣ emit socket 🔥
    // =========================
    const io = getIO();

    const members = await prisma.chatMember.findMany({
      where: { chatId },
      include: {
        user: {
          select: { username: true },
        },
      },
    });

    for (const m of members) {
      io.to(`user:${m.user.username}`).emit("group-photo-updated", {
        chatId,
        chatPhoto: chatPhoto,
      });
    }

    return res.status(200).json({
      message: "Group photo updated",
      chatPhoto: updatedChat.chatPhoto,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


