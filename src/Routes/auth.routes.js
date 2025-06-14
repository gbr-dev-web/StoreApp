import express from 'express';
import { signUp, login, logout } from '../Controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.get('/logout', logout);

export default router;
