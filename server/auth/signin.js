const jwt = require('jsonwebtoken');

const handleSignin = (req, res) => {
  const userData = req.body;
  console.log(req.body);

  // Generate your own JWT token
  const token = jwt.sign(
    {
      email: userData.email,
      username: userData.username,
      provider: userData.provider
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Return your JWT token, not the provider's token
  res.status(201).json({
    message: 'Success',
    user: {
      ...userData,
      token: token  // Your JWT token
    }
  });
};

module.exports = handleSignin;