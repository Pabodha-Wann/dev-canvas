// Google OAuth routes
import express from 'express'
import passport from 'passport'
import authMiddleware from '../middleware/auth.middleware.js'
import { handleGoogleCallback, selectRole, getMe, updateProfile } from '../controllers/auth.controller.js'


const router = express.Router()

//redirect user to Google
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
)

//Google redirects back here
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    handleGoogleCallback
)

router.patch('/select-role', authMiddleware, selectRole)

router.get('/me', authMiddleware, getMe)

router.put('/update-profile', authMiddleware, updateProfile)

export default router