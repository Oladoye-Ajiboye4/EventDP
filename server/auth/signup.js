const jwt = require('jsonwebtoken');

const handleSignup = (req, res) => {
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

  res.status(201).json({
    message: "Success",
    user: {
      ...userData,
      token: token  // Your JWT token
    }
  });
};

module.exports = handleSignup;