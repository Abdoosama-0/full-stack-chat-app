import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

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
      async (data: { toUsername: string; content: string }) => {
        try {
          const { toUsername, content } = data;

          if (!content || !toUsername) return;

          const receiver = await prisma.user.findUnique({
            where: { username: toUsername },
          });

          if (!receiver) {
            return socket.emit("error", { message: "User not found" });
          }

          // find or create chat
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

          await prisma.chatMember.updateMany({
            where: {
              chatId: chat.id,
              hidden: true,
            },
            data: {
              hidden: false,
            },
          });

          const messagePayload = {
            chatId: chat.id,
            from: username,
            content,
            createdAt: message.createdAt,
          };

          io.to(`user:${toUsername}`).emit("new-message", messagePayload);
          io.to(`user:${username}`).emit("new-message", messagePayload);

          // إعادة جلب الشات بشكل كامل
          const chatData = await prisma.chat.findUnique({
            where: { id: chat.id },
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      username: true,
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

          if (!chatData) return;

          // تحديد الطرف الآخر
          const otherMember = chatData.members.find(
            (m) => m.userId !== fromUser.userId
          );

          const otherUser = otherMember
            ? {
                id: otherMember.user.id.toString(),
                username: otherMember.user.username,
                avatar: otherMember.user.avatar,
              }
            : null;

          const payloadChatData = {
            id: chatData.id.toString(),
            otherUser,
            members: chatData.members.map((m) => ({
              userId: m.userId.toString(),
              username: m.user.username,
              avatar: m.user.avatar,
            })),
            messages: chatData.messages.map((msg) => ({
              id: msg.id.toString(),
              chatId: msg.chatId.toString(),
              senderId: msg.senderId.toString(),
              content: msg.content,
              createdAt: msg.createdAt,
              sender: {
                username: msg.sender.username,
              },
            })),
          };

          if (isNewChat) {
            io.to(`user:${toUsername}`).emit(
              "new-chat",
              serialize(payloadChatData)
            );
            io.to(`user:${username}`).emit(
              "new-chat",
              serialize(payloadChatData)
            );
          } else {
            io.to(`user:${toUsername}`).emit(
              "chat-updated",
              serialize(payloadChatData)
            );
            io.to(`user:${username}`).emit(
              "chat-updated",
              serialize(payloadChatData)
            );
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