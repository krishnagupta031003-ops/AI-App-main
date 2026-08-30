const User = require("../auth/authModel");

const checkMessageLimit = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.subscriptionPlan === "pro" || user.subscriptionPlan === "enterprise") {
            return next();
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastResetDate = new Date(user.messageCount.lastResetDate);
        lastResetDate.setHours(0, 0, 0, 0);

        if (today.getTime() > lastResetDate.getTime()) {
            user.messageCount.daily = 0;
            user.messageCount.lastResetDate = new Date();
            await user.save();
        }

        const FREE_TIER_LIMIT = 50;

        if (user.messageCount.daily >= FREE_TIER_LIMIT) {
            return res.status(429).json({
                success: false,
                message: "Daily message limit exceeded. Please upgrade to Pro plan for unlimited messages.",
                limit: FREE_TIER_LIMIT,
                used: user.messageCount.daily,
            });
        }

        user.messageCount.daily += 1;
        await user.save();

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    checkMessageLimit,
};
