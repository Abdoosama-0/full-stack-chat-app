import { Router } from 'express';
import { getChatHistory,getUserChats ,getChatData, deleteChat} from '../controllers/chat-controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// GET chat history
//'/api/chat'
router.get('/:chatId/messages', authMiddleware, getChatHistory);
router.get('/getUserChats', authMiddleware, getUserChats);
router.get('/getChatData/:receiverId', authMiddleware, getChatData);
router.delete("/:chatId", authMiddleware, deleteChat);



export default router;
