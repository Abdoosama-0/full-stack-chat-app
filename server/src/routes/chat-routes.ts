import { Router } from 'express';
import { getChatHistory,getUserChats ,getChatId} from '../controllers/chat-controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// GET chat history
router.get('/:chatId/messages', authMiddleware, getChatHistory);
router.get('/getUserChats', authMiddleware, getUserChats);
router.get('/getChatId/:receiverId', authMiddleware, getChatId);



export default router;
