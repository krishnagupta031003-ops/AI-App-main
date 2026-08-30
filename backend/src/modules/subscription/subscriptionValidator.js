const validator = require("validator");

const validateCreateOrder = (req, res, next) => {
    try {
        const { planId } = req.body;

        if (!planId) {
            return res.status(400).json({
                success: false,
                message: "Plan ID is required",
            });
        }

        if (!validator.isIn(planId, ["free", "pro", "enterprise"])) {
            return res.status(400).json({
                success: false,
                message: "Invalid plan ID. Must be one of: free, pro, enterprise",
            });
        }

        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.message,
        });
    }
};

const validateVerifyPayment = (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing required payment verification fields",
            });
        }

        if (typeof razorpay_order_id !== "string" || razorpay_order_id.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        if (typeof razorpay_payment_id !== "string" || razorpay_payment_id.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Invalid payment ID",
            });
        }

        if (typeof razorpay_signature !== "string" || razorpay_signature.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Invalid signature",
            });
        }

        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.message,
        });
    }
};

module.exports = {
    validateCreateOrder,
    validateVerifyPayment,
};
