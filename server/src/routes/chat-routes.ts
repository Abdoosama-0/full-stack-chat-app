import { Router } from 'express';
import { getChatHistory,getUserChats ,getChatData, deleteChat, createGroupChat,getGroupMembers, getChat, updateGroupPhoto, deleteMessage, editMessage, updateGroupName} from '../controllers/chat-controller';
import { authMiddleware } from '../middleware/auth';
import upload from '../config/multer';

const router = Router();

// GET chat history
//'/api/chat'
router.get('/:chatId/messages', authMiddleware, getChatHistory);
router.get('/getUserChats', authMiddleware, getUserChats);
router.get('/getChatData/:receiverId', authMiddleware, getChatData);
router.delete("/:chatId", authMiddleware, deleteChat);
router.get("/:id", authMiddleware, getChat);
router.post(
  "/createGroup",authMiddleware,
  upload.single("chatPhoto"),
  createGroupChat
);
router.get("/group/:chatId/members", authMiddleware, getGroupMembers);

router.put(
  "/:chatId/photo",
  authMiddleware,
  upload.single("image"), // ⚠️ نفس الاسم في الفرونت
  updateGroupPhoto
);
router.delete("/message/:messageId", authMiddleware, deleteMessage);
router.put("/message/:messageId", authMiddleware, editMessage);
router.put("/:chatId/name", authMiddleware, updateGroupName);
export default router;
