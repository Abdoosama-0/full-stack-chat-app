import { Router } from 'express';
import { register, login,verifyOtp ,deleteUserdatabyEmail } from '../controllers/auth-controller';

const router = Router();

router.post('/register', register);
router.post('/verifyOtp', verifyOtp);
router.post('/login', login);
router.delete('/deleteUserdatabyEmail', deleteUserdatabyEmail);

export default router;
