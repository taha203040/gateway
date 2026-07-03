import { Router } from 'express';
import { login } from '../controllers/login.controller';
import { signup } from '../controllers/signup.controller';
import { logout } from '../controllers/logout.controller';
import { verify } from '../controllers/verify.controller';
const router = Router();
router.get("/verify", verify); 
router.post('/login', login);
router.post('/signup', signup);
router.post('/logout',logout)
export default router;
