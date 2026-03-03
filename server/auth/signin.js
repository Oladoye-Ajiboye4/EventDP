
const handleSignin = (req, res) => {
  // const userData = req.body.user 
  console.log(req.body)
  res.status(201).json({message: 'Sucess'})
  
}

module.exports = handleSignin