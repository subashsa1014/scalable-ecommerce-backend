const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

module.exports = {
  USER_ROLES,
  ORDER_STATUS,
  PAYMENT_STATUS
};
