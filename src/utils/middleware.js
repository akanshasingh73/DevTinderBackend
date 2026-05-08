const adminMiddleware = (req, res, next) => {
  const token = 'xyaaz';
  const isAuth = token === 'xyz';
  console.log(isAuth);
  if (isAuth) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
};

module.exports = {
  adminMiddleware,
};
