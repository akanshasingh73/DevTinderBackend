const express = require('express');
const router = express.Router();
const User = require('../model/user');
const {
  userAuth,
  validateObjectId,
  validateStatus,
} = require('../utils/middleware');
const ConnectionRequest = require('../model/connectionRequest');
const { CONNECTION_STATUSES } = require('../utils/constants');

router.post(
  '/request/send/:status/:receiverId',
  userAuth,
  validateObjectId('receiverId'),
  validateStatus(CONNECTION_STATUSES.SEND),
  async (req, res, next) => {
    try {
      const loggedInUser = req.user;
      const { status, receiverId } = req.params;

      if (loggedInUser._id.equals(receiverId)) {
        return res
          .status(400)
          .json({ message: 'You cannot send a request to yourself' });
      }

      const receiver = await User.findById(receiverId);
      if (!receiver) {
        return res.status(404).json({ message: 'User not found' });
      }

      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          { senderId: loggedInUser._id, receiverId },
          { senderId: receiverId, receiverId: loggedInUser._id },
        ],
      });
      if (existingRequest) {
        return res.status(400).json({
          message: 'A request already exists between you and this user',
        });
      }

      const newRequest = new ConnectionRequest({
        senderId: loggedInUser._id,
        receiverId,
        status,
      });
      await newRequest.save();

      res
        .status(201)
        .json({ message: `Connection request sent to ${receiver.name}` });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/request/review/:status/:requestId',
  userAuth,
  validateObjectId('requestId'),
  validateStatus(CONNECTION_STATUSES.REVIEW),
  async (req, res, next) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const request = await ConnectionRequest.findOne({
        _id: requestId,
        receiverId: loggedInUser._id,
        status: 'interested',
      });
      if (!request) {
        return res
          .status(404)
          .json({ message: 'Request not found or not reviewable' });
      }

      request.status = status;
      await request.save();

      res.status(200).json({ message: `Request ${status} successfully` });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
