const express = require('express');
const router = express.Router();
const ConnectionRequest = require('../model/connectionRequest');
const { userAuth } = require('../utils/middleware');
const { USER_PUBLIC_FIELDS } = require('../utils/constants');
const User = require('../model/user');

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

router.get('/feed', userAuth, async (req, res, next) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ senderId: loggedInUser._id }, { receiverId: loggedInUser._id }],
    }).select('senderId receiverId');


    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((connection) => {
      hideUsersFromFeed.add(connection.senderId.toString());
      hideUsersFromFeed.add(connection.receiverId.toString());
    });

    const feedUsers = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    }).select(USER_PUBLIC_FIELDS);

    res.status(200).json({ count: feedUsers.length, users: feedUsers });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
