import { Router } from 'express';
import { searchUsers } from '../controllers/user-controller';
import { authMiddleware } from '../middleware/auth';
const router = Router();
router.use(authMiddleware);
router.get('/search', searchUsers);

export default router;
