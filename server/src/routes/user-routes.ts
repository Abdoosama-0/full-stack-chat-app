import { Router } from 'express';
import { editUserName, getUserData, searchUsers, updateEmail, updateAvatar, verifyEmailChange, deleteAccount } from '../controllers/user-controller';
import { authMiddleware } from '../middleware/auth';
import upload from '../config/multer';
const router = Router();
router.use(authMiddleware);
router.get('/search', searchUsers);
router.get('/userData', getUserData);
router.post(
  "/update-avatar",
  upload.single("avatar"),
  updateAvatar
);
router.put("/editUserName",  editUserName);
router.post("/email/updateEmail", authMiddleware, updateEmail);
router.post("/email/verify-change", authMiddleware, verifyEmailChange);
router.delete("/delete-account", authMiddleware, deleteAccount);
export default router;
