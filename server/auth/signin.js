const jwt = require('jsonwebtoken');

const handleSignin = (req, res) => {
  const userData = req.body;

  const token = jwt.sign(
    {
      email: userData.email,
      username: userData.username,
      provider: userData.provider
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Returns JWT token, not the provider's token
  res.status(201).json({
    message: 'Success',
    user: {
      ...userData,
      token: token 
    }
  });
};

module.exports = handleSignin;