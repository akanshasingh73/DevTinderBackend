const express = require('express');
const router = express.Router();
const { userAuth } = require('../utils/middleware');
const { validateProfileUpdate } = require('../utils/validation');
const { validatePassword } = require('../utils/validation');
const { hashPassword } = require('../utils/fieldValidators');

router.get('/profile/view', userAuth, async (req, res, next) => {
  try {
    res.status(200).json(req.user.toJSON());
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/profile/update',
  userAuth,
  validateProfileUpdate,
  async (req, res, next) => {
    try {
      const loggedInUser = req.user;
      const updates = req.body;
      Object.keys(updates).forEach((key) => {
        loggedInUser[key] = updates[key];
      });
      await loggedInUser.save();
      res.status(200).json({
        message: 'Profile updated successfully',
        user: loggedInUser.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  },
);

router.patch('/profile/changePassword', userAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const loggedInUser = req.user;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: 'Current and new passwords are required' });
    }

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.error });
    }

    // Prevent same password reuse
    if (currentPassword === newPassword) {
      return res.status(400).json({
        error: 'New password must be different from current password',
      });
    }

    if (!(await loggedInUser.matchesPassword(currentPassword))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Encrypt new password to hash and saving
    loggedInUser.password = await hashPassword(newPassword);
    await loggedInUser.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
