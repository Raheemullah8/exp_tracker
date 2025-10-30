import express from 'express';
import { login, logout, register,getUser} from '../controllers/authController.js';

import upload from '../middleware/uploads.js';
import { isAuthenticated } from '../middleware/auth.js';



const router = express.Router();

// Authentication Routes
router.post('/register',upload.single("profileImage"),register );
router.post('/login', login);
router.get('/users',isAuthenticated, getUser);

router.post('/logout', logout);



export default router;