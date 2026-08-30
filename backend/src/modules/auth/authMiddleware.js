const { verifyToken } = require("../../utils/jwt");

const authMiddleware = (req, res, next) => {
    try {

        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token missing.",
            });
        }

        const decoded = verifyToken(token);

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or Expired Token.",
        });
    }
};

module.exports = authMiddleware;
