const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

// Send OTP email
const sendOTPEmail = async (email, otp, purpose) => {
    const transporter = createTransporter();

    const purposeTexts = {
        'email_update': {
            subject: 'Verify Your Email Update',
            heading: 'Email Update Verification',
            message: 'You requested to update your email address. Use the code below to verify:',
        },
        'password_change': {
            subject: 'Verify Password Change',
            heading: 'Password Change Verification',
            message: 'You requested to change your password. Use the code below to verify:',
        },
        'account_delete': {
            subject: 'Verify Account Deletion',
            heading: 'Account Deletion Verification',
            message: 'You requested to delete your account. Use the code below to verify:',
        },
        'profile_update': {
            subject: 'Verify Profile Update',
            heading: 'Profile Update Verification',
            message: 'You requested to update your profile. Use the code below to verify:',
        },
    };

    const text = purposeTexts[purpose] || purposeTexts['profile_update'];

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Mobiyantra AI'}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: text.subject,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .container {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 10px;
                        padding: 40px;
                        text-align: center;
                    }
                    .content {
                        background: white;
                        border-radius: 8px;
                        padding: 30px;
                        margin-top: 20px;
                    }
                    h1 {
                        color: white;
                        margin: 0;
                        font-size: 24px;
                    }
                    .otp-code {
                        background: #f7f7f7;
                        border: 2px dashed #667eea;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 30px 0;
                        font-size: 36px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        color: #667eea;
                    }
                    .warning {
                        background: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                        text-align: left;
                    }
                    .footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #eee;
                        font-size: 12px;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>${text.heading}</h1>
                    <div class="content">
                        <p style="font-size: 16px; color: #666;">${text.message}</p>
                        <div class="otp-code">${otp}</div>
                        <p style="color: #999; font-size: 14px;">This code will expire in 10 minutes</p>
                        <div class="warning">
                            <strong>Security Notice:</strong> Never share this code with anyone. Our team will never ask for your verification code.
                        </div>
                        <div class="footer">
                            <p>If you didn't request this, please ignore this email or contact support.</p>
                            <p>&copy; ${new Date().getFullYear()} Mobiyantra AI. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `${text.heading}\n\n${text.message}\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
    };

    return transporter.sendMail(mailOptions);
};

module.exports = {
    sendOTPEmail,
};
