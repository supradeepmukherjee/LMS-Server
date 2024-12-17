import { Router } from "express";
import { authenticateUser, createUserAccount, getUserProfile, logout, updateUserProfile } from "../controllers/user.js"
import isAuthenticated from '../middleware/auth.js'
import upload from "../utils/multer.js";
import { validateSignUp } from "../middleware/validation.js";

const router = Router()

router.post('/sign-up', validateSignUp, createUserAccount)
router.post('/authenticate', authenticateUser)
router.get('/profile', isAuthenticated, getUserProfile)
router.post('/sign-out', logout)
router.put('/profile', isAuthenticated, upload.single('chavi'), updateUserProfile)

export default router