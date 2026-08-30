const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../modules/auth/authModel");

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.OAUTH_CALLBACK_URL}/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

                if (!email) {
                    return done(new Error("No email found in Google profile"), null);
                }

                let user = await User.findOne({ email });

                if (user) {
                    if (user.provider === "local") {
                        user.provider = "google";
                        user.providerId = profile.id;
                        user.providerData = {
                            displayName: profile.displayName,
                            photos: profile.photos,
                        };
                        await user.save();
                    } else if (user.provider === "google" && user.providerId !== profile.id) {
                        user.providerId = profile.id;
                        user.providerData = {
                            displayName: profile.displayName,
                            photos: profile.photos,
                        };
                        await user.save();
                    }

                    return done(null, user);
                }

                user = await User.create({
                    name: profile.displayName || email.split("@")[0],
                    email,
                    provider: "google",
                    providerId: profile.id,
                    providerData: {
                        displayName: profile.displayName,
                        photos: profile.photos,
                    },
                    role: "user",
                });

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: `${process.env.OAUTH_CALLBACK_URL}/github/callback`,
            scope: ["user:email"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

                if (!email) {
                    return done(new Error("No email found in GitHub profile"), null);
                }

                let user = await User.findOne({ email });

                if (user) {
                    if (user.provider === "local") {
                        user.provider = "github";
                        user.providerId = profile.id;
                        user.providerData = {
                            username: profile.username,
                            displayName: profile.displayName,
                            profileUrl: profile.profileUrl,
                            photos: profile.photos,
                        };
                        await user.save();
                    } else if (user.provider === "github" && user.providerId !== profile.id) {
                        user.providerId = profile.id;
                        user.providerData = {
                            username: profile.username,
                            displayName: profile.displayName,
                            profileUrl: profile.profileUrl,
                            photos: profile.photos,
                        };
                        await user.save();
                    }

                    return done(null, user);
                }

                user = await User.create({
                    name: profile.displayName || profile.username || email.split("@")[0],
                    email,
                    provider: "github",
                    providerId: profile.id,
                    providerData: {
                        username: profile.username,
                        displayName: profile.displayName,
                        profileUrl: profile.profileUrl,
                        photos: profile.photos,
                    },
                    role: "user",
                });

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

module.exports = passport;
