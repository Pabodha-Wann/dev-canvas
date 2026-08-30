// Verifies JWT from Authorization header
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token format' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const decoded = jwt.verify(token, secret);
        
        // Populate server-side user data to prevent client identity spoofing
        req.user = decoded;
        
        // Verify user account status if ID is present
        if (decoded.id) {
            const dbUser = await User.findById(decoded.id).select('role isDisabled');
            if (dbUser) {
                if (dbUser.isDisabled) {
                    return res.status(403).json({ success: false, message: 'Account is suspended' });
                }
                // Server-derived role overrides token claim to prevent stale role privileges
                req.user.role = dbUser.role;
            }
        }

        next()
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' })
    }
}

export default authMiddleware