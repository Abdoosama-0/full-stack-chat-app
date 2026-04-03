import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
const token = '123'
const prisma = new PrismaClient();

// Extend Socket type to include 'user'
declare module 'socket.io' {
  interface Socket {
    user?: any;
  }
}

export const initSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });
  //===========================ensure the jwt
  io.use((socket, next) => {
    // Token بيتبعت من العميل في handshake.auth
    //++++++++++++++++++++++++++++++++++++++++++++++++++++
    const token = socket.handshake.query.token;
  // const token = socket.request.headers.cookie;

    //++++++++++++++++++++++++++++++++++++++++++++++++++++

    if (!token) return next(new Error("Unauthorized"));

    try {
      const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);
      socket.user = decoded;
      next();
    } catch (err) {
      console.error("Token verification error:", err);
      next(new Error("Unauthorized: invalid token2"));
    }
  });

  //=====================================
  io.on('connection', (socket) => {
    const username = socket.user.username;

    socket.join(`user:${username}`);

    console.log("\n" ,'=====================',"\n",'🟢 User connected:', socket.id);
    console.log('🟢 username:', username,"\n" ,'=====================');
    //=======================
    socket.on(
      'send-message',
      async (data: { toUsername: string; content: string }) => {

        const fromUser = socket.user;
        const { toUsername, content } = data;

        if (!content || !toUsername) return;
        console.log('Message from', fromUser.username, 'to', toUsername, ':', content);



        const receiver = await prisma.user.findUnique({ where: { username: toUsername } });
        if (!receiver) return socket.emit('error', { message: 'User not found' });

        console.log('Found receiver:', receiver.id);
        console.log('Found receiver:', socket.user.userId);


        let chat = await prisma.chat.findFirst({
          where: {
    AND: [
      { members: { some: { userId: fromUser.userId } } },
      { members: { some: { userId: receiver.id } } },
    ],
  },
        });
        if (chat) {
          console.log('Found existing chat with ID:', chat.id);
        }

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
          console.log('Created new chat with ID:', chat.id);
        }


        const message = await prisma.message.create({
          data: {
            chatId: chat.id,
            senderId: fromUser.userId,
            content,
          },
        });

        io.to(`user:${toUsername}`).emit('new-message', {
          chatId: chat.id,
          from: fromUser.username,
          content,
          createdAt: message.createdAt,
        });

        io.to(`user:${fromUser.username}`).emit('new-message', {
          chatId: chat.id,
          from: fromUser.username,
          content,
          createdAt: message.createdAt,
        });
  



      }


    );



    //=========================


    socket.on('disconnect', () => {
      console.log('🔴 User disconnected:', socket.id);
    });
  });

  return io;
};
