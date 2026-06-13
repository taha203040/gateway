import { Router } from 'express';
import { login } from '../controllers/login.controller';
import { signup } from '../controllers/signup.controller';

const router = Router();

router.post('/login', login);
router.post('/signup', signup);

export default router;