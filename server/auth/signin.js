const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model')

const handleSignin = async (req, res) => {
  try {
    const userData = req.body;
    const existingUser = await userModel.findOne({ email: userData.email });

    const token = jwt.sign(
      {
        email: userData.email,
        username: userData.username || (existingUser ? existingUser.username : ''), 
        provider: userData.provider
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    if (existingUser) {
      return res.status(200).json({
        message: 'Login successful',
        user: {
          ...existingUser.toObject(), 
          token: token
        }
      });
    }

    userData.token = token;
    userData.password = "N/A";

    const newUser = new userModel(userData);
    await newUser.save();

    return res.status(201).json({
      message: 'Account created successfully',
      user: {
        ...userData,
        token: token
      }
    });

  } catch (error) {
    console.error("Signin Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = handleSignin;