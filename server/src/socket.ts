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

        let isNewChat = false;

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

          isNewChat = true;
        }

        const message = await prisma.message.create({
          data: {
            chatId: chat.id,
            senderId: fromUser.userId,
            content,
          },
        });

        const payload = {
          chatId: chat.id,
          from: fromUser.username,
          content,
          createdAt: message.createdAt,
        };

        io.to(`user:${receiver.username}`).emit("new-message", payload);
        io.to(`user:${fromUser.username}`).emit("new-message", payload);

        return;
      }

      // =========================
      // 2️⃣ GROUP CHAT
      // =========================
      if (type === "group") {
console.log("GROUP MESSAGE RECEIVED", { chatId, content });

        if (!chatId) return;
console.log("GROUP MESSAGE RECEIVED", { chatId, content });
        const chat = await prisma.chat.findUnique({
          where: { id: chatId },
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        });

        if (!chat) return;

        // save message
        const message = await prisma.message.create({
          data: {
            chatId,
            senderId: fromUser.userId,
            content,
          },
        });

        const payload = {
          chatId,
          from: fromUser.username,
          content,
          createdAt: message.createdAt,
          isGroup: true,
        };

        // 🔥 ابعت لكل أعضاء الجروب
        for (const member of chat.members) {
          io.to(`user:${member.user.username}`).emit(
            "new-message",
            payload
          );
        }

        return;
      }
    } catch (error) {
      console.error("Socket error:", error);
    }
  }
);

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