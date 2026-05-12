const express = require('express');
const router = express.Router();
const { userAuth } = require('../utils/middleware');

router.post('/sendConnectionRequest', userAuth, async (req, res, next) => {
  try {
    const user = req.user;
    res
      .status(200)
      .json({ message: 'Connection request sent from ' + user.name });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
