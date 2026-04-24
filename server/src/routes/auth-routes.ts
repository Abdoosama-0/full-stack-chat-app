import { Router } from 'express';
import { register, login,verifyOtp ,deleteUserdatabyEmail } from '../controllers/auth-controller';
import upload from '../config/multer';

const router = Router();

router.post(
  "/register",
  upload.single("avatar"), // 👈 optional file
  register
);router.post('/verifyOtp', verifyOtp);
router.post('/login', login);
router.delete('/deleteUserdatabyEmail', deleteUserdatabyEmail);

export default router;
