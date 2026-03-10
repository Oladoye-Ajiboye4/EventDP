const userModel = require('../models/user.model')
const nodemailer = require('nodemailer')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const manualSignup = (req, res) => {
    let salt = bcrypt.genSaltSync(10);
    let hashedPassword = bcrypt.hashSync(req.body.password, salt);
    req.body.password = hashedPassword;
    const { username, email, password } = req.body
    const user = { username, email, password }

    let newUser = new userModel(user);

    newUser.save()
        .then(() => {


            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER || 'oladoyeajiboye@gmail.com',
                    pass: process.env.GOOGLE_APP_PASSWORD
                }
            });

            let mailOptions = {
                from: `"AuthSys Team" <${process.env.USER}>`,
                to: [user.email],
                subject: `Welcome to AuthSys, ${username}! 🎉`,
                html: `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; }
                            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #fff7ed 0%, #fff 40%, #fef3c7 100%); }
                            .header { background: linear-gradient(-45deg, #f89b29 0%, #ff0f7b 100%); padding: 40px 20px; text-align: center; border-radius: 15px 15px 0 0; }
                            .header h1 { color: white; margin: 0; font-size: 32px; font-weight: 700; }
                            .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px; }
                            .content { padding: 40px 30px; background: white; margin: 0; }
                            .greeting { font-size: 24px; color: #92400e; font-weight: 600; margin: 0 0 15px 0; }
                            .message { color: #78350f; font-size: 16px; line-height: 1.6; margin: 15px 0; }
                            .highlight { color: #f89b29; font-weight: 600; }
                            .features { background: #fef3c7; border-left: 4px solid #f89b29; padding: 20px; border-radius: 8px; margin: 25px 0; }
                            .features h3 { color: #92400e; margin: 0 0 12px 0; font-size: 16px; }
                            .feature-list { list-style: none; padding: 0; margin: 0; }
                            .feature-list li { color: #78350f; padding: 8px 0; font-size: 14px; display: flex; align-items: center; }
                            .feature-list li:before { content: "✓"; color: #f89b29; font-weight: bold; margin-right: 10px; font-size: 16px; }
                            .cta-button { display: inline-block; background: linear-gradient(-45deg, #f89b29 0%, #ff0f7b 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                            .cta-button:hover { opacity: 0.9; }
                            .divider { border: 0; border-top: 2px solid #fef3c7; margin: 25px 0; }
                            .footer { background: #92400e; color: white; padding: 30px; text-align: center; border-radius: 0 0 15px 15px; }
                            .footer p { margin: 8px 0; font-size: 14px; }
                            .social { margin: 15px 0; }
                            .social a { color: #f89b29; text-decoration: none; margin: 0 10px; font-weight: 600; }
                            .username { color: #ff0f7b; font-weight: 700; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>🚀 Welcome to AuthSys</h1>
                                <p>Your account has been successfully created!</p>
                            </div>
                            
                            <div class="content">
                                <p class="greeting">Hi <span class="username">${username}</span>! 👋</p>
                                
                                <p class="message">
                                    Congratulations on joining our community! We're thrilled to have you on board. Your account is now active and ready to use.
                                </p>
                                
                                <p class="message">
                                    You signed up with the email <span class="highlight">${user.email}</span>. If you didn't create this account, please let us know immediately.
                                </p>
                                
                                <div class="features">
                                    <h3>What's Next? Here's what you can do:</h3>
                                    <ul class="feature-list">
                                        <li>Complete your profile for a personalized experience</li>
                                        <li>Explore our features and get started with your first project</li>
                                        <li>Join our community and connect with other users</li>
                                        <li>Check out our documentation and tutorials</li>
                                        <li>Customize your account settings and preferences</li>
                                    </ul>
                                </div>
                                
                                <center>
                                    <a href="${process.env.APP_URL || 'http://localhost:5173'}/dashboard" class="cta-button">Go to Your Dashboard</a>
                                </center>
                                
                                <hr class="divider">
                                
                                <p class="message" style="font-size: 13px; color: #92400e;">
                                    <span class="highlight">Need Help?</span> Our support team is here for you. Visit our 
                                    <a href="${process.env.APP_URL || 'http://localhost:5173'}/help" style="color: #ff0f7b; text-decoration: none; font-weight: 600;">Help Center</a> 
                                    or email us at support@authsys.com
                                </p>
                            </div>
                            
                            <div class="footer">
                                <p style="margin-top: 0;"><strong>Welcome Aboard!</strong></p>
                                <p>We're excited to see what you'll accomplish with AuthSys.</p>
                                
                                <div class="social">
                                    <a href="https://twitter.com/authsys">Twitter</a>
                                    <a href="https://facebook.com/authsys">Facebook</a>
                                    <a href="https://linkedin.com/company/authsys">LinkedIn</a>
                                </div>
                                
                                <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.3); margin: 15px 0;">
                                
                                <p style="margin-bottom: 0; font-size: 12px;">
                                    Best Regards,<br>
                                    <strong style="color: #f89b29;">The AuthSys Team</strong>
                                </p>
                                
                                <p style="font-size: 11px; margin-top: 15px; opacity: 0.8;">
                                    © 2026 AuthSys. All rights reserved.<br>
                                    This is an automated email. Please don't reply directly.
                                </p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        })
        .catch((err) => {
            console.error("Error registering customer:", err);
        });

    console.log('Password signup', user)
    res.status(201).json({ message: 'Success', user })
}

module.exports = manualSignup