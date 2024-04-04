const jwt = require('jsonwebtoken');

module.exports = (req, _res, next) => {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    const error = new Error('Not autheticated.');
    error.statusCode = 301;
    throw error;
  }

  const token = authHeader.split(' ')[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, 'secret');
  } catch (error) {
    error.statusCode = 500;
    throw error;
  }

  if (!decodedToken) {
    const error = new Error('Not autheticated.');
    error.statusCode = 301;
    throw error;
  }

  req.userId = decodedToken.userId;
  next();
};
