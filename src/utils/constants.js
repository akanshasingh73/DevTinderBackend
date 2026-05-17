const CONNECTION_STATUSES = {
  SEND: ['interested', 'ignored'],
  REVIEW: ['accepted', 'rejected'],
  ALL: ['interested', 'ignored', 'accepted', 'rejected'],
};

const USER_PUBLIC_FIELDS = 'name email photo skills about';

module.exports = { CONNECTION_STATUSES, USER_PUBLIC_FIELDS };
