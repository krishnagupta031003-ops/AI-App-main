const crypto = require("crypto");
const razorpay = require("../../config/razorpay");
const subscriptionRepository = require("./subscriptionRepository");

// Subscription plans
const PLANS = {
    free: {
        id: "free",
        name: "Free Plan",
        description: "Perfect for trying out our AI assistant",
        price: 0,
        billingPeriod: "month",
        currency: "INR",
        popular: false,
        features: [
            "50 messages per day",
            "GPT-3.5 equivalent model",
            "7 days chat history",
            "Basic features"
        ],
        limits: {
            messagesPerDay: 50,
            model: "GPT-3.5 equivalent",
            chatHistory: "7 days"
        }
    },
    pro: {
        id: "pro",
        name: "Pro Plan",
        description: "For power users who need unlimited access",
        price: 20, // INR (₹20)
        billingPeriod: "month",
        currency: "INR",
        popular: true,
        features: [
            "Unlimited messages",
            "GPT-4 equivalent model",
            "Unlimited chat history",
            "Priority speed",
            "Export chats",
            "API access"
        ],
        limits: {
            messagesPerDay: -1, // Unlimited
            model: "GPT-4 equivalent",
            chatHistory: "Unlimited"
        }
    },
    enterprise: {
        id: "enterprise",
        name: "Enterprise Plan",
        description: "Custom solutions for your team",
        price: null, // Custom pricing
        billingPeriod: "month",
        currency: "INR",
        popular: false,
        features: [
            "Everything in Pro",
            "Team collaboration",
            "SSO integration",
            "Dedicated support",
            "SLA guarantee",
            "Custom integrations"
        ],
        limits: {
            messagesPerDay: -1,
            model: "GPT-4 equivalent",
            chatHistory: "Unlimited"
        }
    }
};

const getPlans = () => {
    return Object.values(PLANS);
};

const createOrder = async (userId, planId) => {
    if (!PLANS[planId]) {
        throw new Error("Invalid plan ID");
    }

    const plan = PLANS[planId];

    if (planId === "free") {
        throw new Error("Free plan does not require payment");
    }

    if (planId === "enterprise") {
        throw new Error("Please contact sales for enterprise plan");
    }

    // Check if user already has an active subscription
    const existingSubscription = await subscriptionRepository.findSubscriptionByUserId(userId);
    if (existingSubscription && existingSubscription.status === "active") {
        throw new Error("You already have an active subscription");
    }

    // Amount in paise (Razorpay requires smallest currency unit)
    const amount = plan.price * 100;
    const currency = plan.currency;
    // Receipt must be ≤40 chars - using short timestamp + userId suffix
    const receipt = `rcpt_${Date.now().toString().slice(-10)}_${userId.toString().slice(-6)}`;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
        amount,
        currency,
        receipt,
        notes: {
            userId: userId.toString(),
            planId
        }
    });

    // Create payment record in database
    const payment = await subscriptionRepository.createPayment({
        userId,
        razorpayOrderId: razorpayOrder.id,
        amount,
        currency,
        status: "pending"
    });

    return {
        id: razorpayOrder.id,
        amount,
        currency,
        planId,
        planName: plan.name
    };
};

const verifyPayment = async (userId, paymentData) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

    // Find payment record
    const payment = await subscriptionRepository.findPaymentByOrderId(razorpay_order_id);
    if (!payment) {
        throw new Error("Payment not found");
    }

    if (payment.userId.toString() !== userId.toString()) {
        throw new Error("Unauthorized payment verification");
    }

    // Verify signature
    const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

    if (generatedSignature !== razorpay_signature) {
        // Update payment status to failed
        await subscriptionRepository.updatePayment(payment._id, {
            status: "failed",
            razorpayPaymentId: razorpay_payment_id
        });
        throw new Error("Invalid payment signature");
    }

    // Payment verified successfully
    await subscriptionRepository.updatePayment(payment._id, {
        status: "success",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAt: new Date()
    });

    // Extract planId from payment/order notes
    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
    const planId = razorpayOrder.notes?.planId || "pro";

    // Calculate subscription dates (30 days for Pro)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Create subscription
    const subscription = await subscriptionRepository.createSubscription({
        userId,
        planId,
        status: "active",
        amount: payment.amount,
        currency: payment.currency,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        startDate,
        endDate,
        autoRenew: false
    });

    // Update payment with subscription reference
    await subscriptionRepository.updatePayment(payment._id, {
        subscriptionId: subscription._id
    });

    // Update user subscription
    await subscriptionRepository.updateUserSubscription(userId, subscription._id, planId);

    return {
        success: true,
        subscription: {
            id: subscription._id,
            planId: subscription.planId,
            status: subscription.status,
            startDate: subscription.startDate,
            endDate: subscription.endDate
        }
    };
};

const getUserSubscription = async (userId) => {
    const subscription = await subscriptionRepository.findSubscriptionByUserId(userId);

    // Get user to fetch message count for usage data
    const User = require("../auth/authModel");
    const user = await User.findById(userId);

    const plan = PLANS[subscription?.planId || "free"];

    // Calculate usage for free tier
    const usage = {
        messagesUsedToday: user?.messageCount?.daily || 0,
        messagesLimit: plan.limits.messagesPerDay === -1 ? -1 : plan.limits.messagesPerDay,
        lastResetDate: user?.messageCount?.lastResetDate
    };

    if (!subscription || subscription.status !== "active") {
        // Return free plan details with usage
        return {
            plan: PLANS.free,
            planId: "free",
            status: "active",
            usage
        };
    }

    return {
        id: subscription._id,
        plan: plan,
        planId: subscription.planId,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        autoRenew: subscription.autoRenew,
        usage
    };
};

const getPaymentHistory = async (userId) => {
    const payments = await subscriptionRepository.findPaymentsByUserId(userId);

    return payments.map(payment => ({
        id: payment._id,
        amount: payment.amount / 100, // Convert from paise to rupees
        currency: payment.currency,
        status: payment.status,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
        subscriptionId: payment.subscriptionId
    }));
};

const cancelSubscription = async (userId) => {
    const subscription = await subscriptionRepository.findSubscriptionByUserId(userId);

    if (!subscription) {
        throw new Error("No active subscription found");
    }

    if (subscription.status !== "active") {
        throw new Error("Subscription is not active");
    }

    // Update subscription status
    await subscriptionRepository.updateSubscription(subscription._id, {
        status: "cancelled",
        cancelledAt: new Date()
    });

    // Update user to free plan
    await subscriptionRepository.updateUserSubscription(userId, null, "free");

    return {
        success: true,
        message: "Subscription cancelled successfully"
    };
};

const reactivateSubscription = async (userId, planId) => {
    // Find cancelled subscription that's still valid
    const Subscription = require("./subscriptionModel");
    const cancelledSub = await Subscription.findOne({
        userId,
        planId,
        status: "cancelled",
        endDate: { $gt: new Date() } // Not expired yet
    }).sort({ cancelledAt: -1 }); // Most recently cancelled

    if (!cancelledSub) {
        return null; // No valid cancelled subscription found
    }

    // Reactivate the subscription
    await subscriptionRepository.updateSubscription(cancelledSub._id, {
        status: "active",
        cancelledAt: null
    });

    // Update user subscription
    await subscriptionRepository.updateUserSubscription(userId, cancelledSub._id, planId);

    return {
        success: true,
        subscription: {
            id: cancelledSub._id,
            planId: cancelledSub.planId,
            status: "active",
            startDate: cancelledSub.startDate,
            endDate: cancelledSub.endDate
        }
    };
};

module.exports = {
    getPlans,
    createOrder,
    verifyPayment,
    getUserSubscription,
    getPaymentHistory,
    cancelSubscription,
    reactivateSubscription,
};
