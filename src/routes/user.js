const express = require('express');
const router = express.Router();
const ConnectionRequest = require('../model/connectionRequest');
const { userAuth } = require('../utils/middleware');
const { USER_PUBLIC_FIELDS } = require('../utils/constants');

router.get('/user/requests/received', userAuth, async (req, res, next) => {
  try {
    const loggedInUser = req.user;

    const requests = await ConnectionRequest.find({
      receiverId: loggedInUser._id,
      status: 'interested',
    }).populate('senderId', USER_PUBLIC_FIELDS);

    const data = requests.map((request) => ({
      requestId: request._id,
      sender: request.senderId,
      sentAt: request.createdAt,
    }));

    res.status(200).json({ count: data.length, requests: data });
  } catch (error) {
    next(error);
  }
});

router.get('/user/connections', userAuth, async (req, res, next) => {
  try {
    const loggedInUser = req.user;

    const connections = await ConnectionRequest.find({
      $or: [
        { senderId: loggedInUser._id, status: 'accepted' },
        { receiverId: loggedInUser._id, status: 'accepted' },
      ],
    }).populate([
      { path: 'senderId', select: USER_PUBLIC_FIELDS },
      { path: 'receiverId', select: USER_PUBLIC_FIELDS },
    ]);

    const data = connections.map((connection) => {
      const otherUser = connection.senderId?._id?.equals(loggedInUser._id)
        ? connection.receiverId
        : connection.senderId;

      return {
        connectionId: connection._id,
        user: otherUser,
        connectedAt: connection.createdAt,
      };
    });

    res.status(200).json({ count: data.length, connections: data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
