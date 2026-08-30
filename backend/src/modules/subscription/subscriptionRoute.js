const express = require("express");
const subscriptionController = require("./subscriptionController");
const authMiddleware = require("../auth/authMiddleware");
const subscriptionValidator = require("./subscriptionValidator");

const router = express.Router();

router.get("/plans", subscriptionController.getPlans);

router.post(
    "/razorpay/order",
    authMiddleware,
    subscriptionValidator.validateCreateOrder,
    subscriptionController.createOrder
);

router.post(
    "/razorpay/verify",
    authMiddleware,
    subscriptionValidator.validateVerifyPayment,
    subscriptionController.verifyPayment
);

router.get(
    "/me",
    authMiddleware,
    subscriptionController.getUserSubscription
);

router.get(
    "/history",
    authMiddleware,
    subscriptionController.getPaymentHistory
);

router.post(
    "/cancel",
    authMiddleware,
    subscriptionController.cancelSubscription
);

router.post(
    "/reactivate",
    authMiddleware,
    subscriptionController.reactivateSubscription
);

router.post(
    "/webhook",
    subscriptionController.handleWebhook
);

module.exports = router;
