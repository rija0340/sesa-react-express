import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = Router();

// Route publique - création de compte (self-registration)
router.post('/register', authController.createUser);

// Routes protégées
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);

// Routes admin uniquement
router.get('/users', authMiddleware, adminMiddleware, authController.getAllUsers);
router.delete('/users/:id', authMiddleware, adminMiddleware, authController.deleteUser);

export default router;
