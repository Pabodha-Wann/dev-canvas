// Role-based access guard (STUDENT, RECRUITER, ADMIN)
const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges' })
        }
        next()
    }
}

export const requireRole = roleMiddleware;
export default roleMiddleware;