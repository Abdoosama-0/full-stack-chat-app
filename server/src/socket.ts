import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// 🔥 global io instance
let ioInstance: Server;

const serialize = (obj: any) => {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};

// Extend Socket
declare module "socket.io" {
  interface Socket {
    user?: any;
  }
}

export const initSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  // 👇 حفظ الـ io للاستخدام في controllers
  ioInstance = io;

  // ================= JWT Middleware =================
  io.use((socket, next) => {
    const token = socket.handshake.query.token;

    if (!token) return next(new Error("Unauthorized"));

    try {
      const decoded = jwt.verify(
        token as string,
        process.env.JWT_SECRET as string
      );
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error("Unauthorized"));
    }
  });

  // ================= Connection =================
  io.on("connection", (socket) => {
    const fromUser = socket.user;
    const username = fromUser.username;

    socket.join(`user:${username}`);

    console.log("🟢 Connected:", username);

    // ================= SEND MESSAGE =================
socket.on(
  "send-message",
  async (data: {
    type: "private" | "group";
    chatId?: number;
    toUsername?: string;
    content: string;
  }) => {
    try {
      const { type, chatId, toUsername, content } = data;

      if (!content) return;

      // =========================
      // 1️⃣ PRIVATE CHAT
      // =========================
      if (type === "private") {
        if (!toUsername) return;

        const receiver = await prisma.user.findUnique({
          where: { username: toUsername },
        });

        if (!receiver) {
          return socket.emit("error", { message: "User not found" });
        }

        let chat = await prisma.chat.findFirst({
          where: {
            AND: [
              { members: { some: { userId: fromUser.userId } } },
              { members: { some: { userId: receiver.id } } },
            ],
          },
        });

        if (!chat) {
          chat = await prisma.chat.create({
            data: {
              members: {
                create: [
                  { userId: fromUser.userId },
                  { userId: receiver.id },
                ],
              },
            },
          });
        }

        // =========================
        // CREATE MESSAGE
        // =========================
        const message = await prisma.message.create({
          data: {
            chatId: chat.id,
            senderId: fromUser.userId,
            content,
          },
        });

        console.log("Message created:", message.id);

        // =========================
        // UPDATE LAST MESSAGE
        // =========================
        await prisma.chat.update({
          where: { id: chat.id },
          data: {
            lastMessageId: Number(message.id) ,
          },
        });

        // =========================
        // AUTO MARK AS SEEN (FOR SENDER)
        // =========================
        await prisma.chatMember.update({
          where: {
            chatId_userId: {
              chatId: chat.id,
              userId: fromUser.userId,
            },
          },
          data: {
            lastSeenMessageId: message.id,
          },
        });
         console.log(" lastSeenMessageId:", message.id ,"for user:", fromUser.username);
        console.log("lastMessage:",Number(message.id) ,"for chat:", chat.id);
        // =========================
// 🔥 EMIT SEEN UPDATE
// =========================
io.to(`user:${fromUser.username}`).emit("chat-seen-updated", {
  chatId: Number(chat.id),
  lastSeenMessageId: Number(message.id),
});

        // =========================
        // SOCKET PAYLOAD
        // =========================
        const payload = {
          chatId: chat.id,
          from: fromUser.username,
          content,
          createdAt: message.createdAt,
        };

        io.to(`user:${receiver.username}`).emit("new-message", payload);
        io.to(`user:${fromUser.username}`).emit("new-message", payload);

const chatUpdate = {
  chatId: Number(chat.id),
  lastMessage: {
    id: Number(message.id),
    content: message.content,
    createdAt: message.createdAt,
    sender: fromUser.username,
  },
};

        io.to(`user:${receiver.username}`).emit("chat-updated", chatUpdate);
        io.to(`user:${fromUser.username}`).emit("chat-updated", chatUpdate);

        return;
      }

   // =========================
// 2️⃣ GROUP CHAT
// =========================
if (type === "group") {
  if (!chatId) return;

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      members: {
        include: { user: true },
      },
    },
  });

  if (!chat) return;

  // =========================
  // CREATE MESSAGE
  // =========================
  const message = await prisma.message.create({
    data: {
      chatId,
      senderId: fromUser.userId,
      content,
    },
  });

  console.log("Group message created:", message.id);

  // =========================
  // UPDATE LAST MESSAGE
  // =========================
  await prisma.chat.update({
    where: { id: chatId },
    data: {
      lastMessageId: Number(message.id),
    },
  });

  // =========================
  // AUTO MARK AS SEEN (FOR SENDER ONLY)
  // =========================
  await prisma.chatMember.update({
    where: {
      chatId_userId: {
        chatId,
        userId: fromUser.userId,
      },
    },
    data: {
      lastSeenMessageId: message.id,
    },
  });

  console.log(
    "lastSeenMessageId:",
    message.id,
    "for user:",
    fromUser.username
  );

  // =========================
  // 🔥 EMIT SEEN UPDATE (FOR SENDER ONLY)
  // =========================
  io.to(`user:${fromUser.username}`).emit("chat-seen-updated", {
    chatId: Number(chatId),
    lastSeenMessageId: Number(message.id),
  });

  // =========================
  // SOCKET PAYLOADS
  // =========================
  const chatUpdate = {
    chatId: Number(chatId),
    lastMessage: {
      id: Number(message.id),
      content: message.content,
      createdAt: message.createdAt,
      sender: fromUser.username,
    },
  };

  const messagePayload = {
    chatId: Number(chatId),
    from: fromUser.username,
    content: message.content,
    createdAt: message.createdAt,
    isGroup: true,
  };

  // =========================
  // EMIT TO ALL MEMBERS
  // =========================
  for (const member of chat.members) {
    io.to(`user:${member.user.username}`).emit(
      "new-message",
      messagePayload
    );

    io.to(`user:${member.user.username}`).emit(
      "chat-updated",
      chatUpdate
    );
  }

  return;
}
    } catch (error) {
      console.error("Socket error:", error);
    }
  }
);


//============mark-chat-seen==================
socket.on("mark-chat-seen", async ({ chatId }) => {
  try {
    const userId = fromUser.userId;

    const lastMessage = await prisma.message.findFirst({
      where: { chatId },
      orderBy: { createdAt: "desc" },
    });

    if (!lastMessage) return;

    // 🔥 شيل الشرط ده خالص
    // if (lastMessage.senderId === userId) return;

    // ✅ حدث دايمًا
    await prisma.chatMember.update({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
      data: {
        lastSeenMessageId: lastMessage.id,
      },
    });

    // 🔥 ابعت تحديث للفرونت
    io.to(`user:${fromUser.username}`).emit("chat-seen-updated", {
      chatId: Number(chatId),
      lastSeenMessageId: Number(lastMessage.id),
    });

    console.log("seen updated:", chatId, userId, lastMessage.id);
  } catch (err) {
    console.error(err);
  }
});
    // ================= DISCONNECT =================
    socket.on("disconnect", () => {
      console.log("🔴 Disconnected:", username);
    });
  });

  return io;
};

// 🔥 تستخدمها في controllers
export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket not initialized");
  }
  return ioInstance;
};