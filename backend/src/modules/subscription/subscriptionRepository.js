const Subscription = require("./subscriptionModel");
const Payment = require("./paymentModel");
const User = require("../auth/authModel");

const createSubscription = async (subscriptionData) => {
    return await Subscription.create(subscriptionData);
};

const findSubscriptionById = async (id) => {
    return await Subscription.findById(id).populate('userId', 'name email');
};

const findSubscriptionByUserId = async (userId) => {
    return await Subscription.findOne({ userId, status: 'active' })
        .sort({ createdAt: -1 })
        .populate('userId', 'name email');
};

const findAllSubscriptionsByUserId = async (userId) => {
    return await Subscription.find({ userId })
        .sort({ createdAt: -1 })
        .populate('userId', 'name email');
};

const updateSubscription = async (id, updateData) => {
    return await Subscription.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
};

const findSubscriptionByRazorpayOrderId = async (razorpayOrderId) => {
    return await Subscription.findOne({ razorpayOrderId });
};

const createPayment = async (paymentData) => {
    return await Payment.create(paymentData);
};

const findPaymentByOrderId = async (razorpayOrderId) => {
    return await Payment.findOne({ razorpayOrderId });
};

const updatePayment = async (id, updateData) => {
    return await Payment.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
};

const updatePaymentByOrderId = async (razorpayOrderId, updateData) => {
    return await Payment.findOneAndUpdate({ razorpayOrderId }, updateData, { returnDocument: 'after' });
};

const findPaymentsByUserId = async (userId) => {
    return await Payment.find({ userId, status: 'success' })
        .sort({ createdAt: -1 })
        .populate('subscriptionId');
};

const updateUserSubscription = async (userId, subscriptionId, planId) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            currentSubscription: subscriptionId,
            subscriptionPlan: planId
        },
        { returnDocument: 'after' }
    );
};

module.exports = {
    createSubscription,
    findSubscriptionById,
    findSubscriptionByUserId,
    findAllSubscriptionsByUserId,
    updateSubscription,
    findSubscriptionByRazorpayOrderId,
    createPayment,
    findPaymentByOrderId,
    updatePayment,
    updatePaymentByOrderId,
    findPaymentsByUserId,
    updateUserSubscription,
};
