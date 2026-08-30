// OAuth callback and JWT issue logic
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const handleGoogleCallback = (req, res) => {

    const user = req.user

    if (user.isDisabled) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=Account suspended. Please contact support.`)
    }

    const token = jwt.sign(
        {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            isNewUser: user.isNewUser,
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }

    )

    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`)
}

export const selectRole = async (req, res, next) => {
    try {
        const { role } = req.body

        if (!['STUDENT', 'RECRUITER'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' })
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { role, isNewUser: false },
            { new: true }
        )

        // issue a fresh token with updated role
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isNewUser: false,
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.json({ success: true, token, user })
    } catch (err) {
        next(err)
    }
}


export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (err) {
        next(err);
    }
}

export const updateProfile = async (req, res, next) => {
    try {
        const { name, profilePic } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, profilePic },
            { new: true }
        );

        if (!user) {
            return res.status(44.404).json({ success: false, message: 'User not found' });
        }

        // issue a fresh token with updated profile info
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isNewUser: user.isNewUser,
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ success: true, token, user });
    } catch (err) {
        next(err);
    }
}



