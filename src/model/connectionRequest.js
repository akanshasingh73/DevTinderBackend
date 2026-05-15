const mongoose = require('mongoose');
const { CONNECTION_STATUSES } = require('../utils/constants');

const connectionRequestSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: CONNECTION_STATUSES.ALL,
    },
  },
  { timestamps: true },
);

// Compound index — makes duplicate lookups fast (O(log n) not O(n))
// and enforces at DB level that the same pair can't have two requests
connectionRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

const ConnectionRequest = mongoose.model(
  'ConnectionRequest',
  connectionRequestSchema,
);
module.exports = ConnectionRequest;
