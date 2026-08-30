const subscriptionService = require("./subscriptionService");

const getPlans = async (req, res, next) => {
    try {
        const plans = subscriptionService.getPlans();

        return res.status(200).json({
            success: true,
            data: plans,
        });
    } catch (error) {
        next(error);
    }
};

const createOrder = async (req, res, next) => {
    try {
        const { planId } = req.body;
        const userId = req.user.id;

        const order = await subscriptionService.createOrder(userId, planId);

        return res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

const verifyPayment = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const paymentData = req.body;

        const result = await subscriptionService.verifyPayment(userId, paymentData);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getUserSubscription = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const subscription = await subscriptionService.getUserSubscription(userId);

        return res.status(200).json({
            success: true,
            data: subscription,
        });
    } catch (error) {
        next(error);
    }
};

const getPaymentHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const history = await subscriptionService.getPaymentHistory(userId);

        return res.status(200).json({
            success: true,
            data: history,
        });
    } catch (error) {
        next(error);
    }
};

const cancelSubscription = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const result = await subscriptionService.cancelSubscription(userId);

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
};

const reactivateSubscription = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { planId } = req.body;

        const result = await subscriptionService.reactivateSubscription(userId, planId);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "No valid cancelled subscription found to reactivate",
            });
        }

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const handleWebhook = async (req, res, next) => {
    try {
        const crypto = require("crypto");
        const signature = req.headers["x-razorpay-signature"];
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(JSON.stringify(req.body))
            .digest("hex");

        if (signature !== expectedSignature) {
            return res.status(400).json({
                success: false,
                message: "Invalid webhook signature",
            });
        }

        const event = req.body.event;
        const payload = req.body.payload;

        switch (event) {
            case "payment.captured":
                console.log("Payment captured:", payload.payment.entity.id);
                break;

            case "payment.failed":
                console.log("Payment failed:", payload.payment.entity.id);
                break;

            case "subscription.cancelled":
                console.log("Subscription cancelled:", payload.subscription.entity.id);
                break;

            default:
                console.log("Unhandled webhook event:", event);
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPlans,
    createOrder,
    verifyPayment,
    getUserSubscription,
    getPaymentHistory,
    cancelSubscription,
    reactivateSubscription,
    handleWebhook,
};
