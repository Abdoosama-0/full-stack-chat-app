import express, { Request, Response } from 'express';
import { connectDB } from './config/db';
//s
const app = express();
const PORT = 5000;
import cookieParser from 'cookie-parser';
connectDB(); // Connect to the database
import redis  from "./config/redis"  // Connect to Redis
import authRoutes from './routes/auth-routes';
import userRoutes from './routes/user-routes';
import chatRoutes from './routes/chat-routes';
app.use(cookieParser());
redis.set("key", "value")
  
// Middleware to parse JSON
app.use(express.json());

import cors from "cors";

app.use(cors({
  origin: "http://localhost:3001",
  credentials: true
}));


// Route example
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Node + TypeScript + Express!');
});

app.use('/api/auth', authRoutes);

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);

//===============================io
import http from 'http';
import { initSocket } from './socket';


const server = http.createServer(app);

initSocket(server);



// Start server
server.listen(PORT, () => {
  console.log(`
    Server running at http://localhost:${PORT}
    `);
});
