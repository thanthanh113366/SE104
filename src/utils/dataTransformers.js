/**
 * Chuyển đổi dữ liệu sân bóng
 */
export const transformCourtData = (court) => {
  return {
    id: court._id,
    name: court.name,
    address: court.address,
    price: formatPrice(court.price),
    description: court.description,
    images: court.images || [],
    owner: {
      id: court.ownerId?._id,
      name: court.ownerId?.displayName,
      email: court.ownerId?.email
    },
    rating: calculateAverageRating(court.reviews),
    totalReviews: court.reviews?.length || 0,
    status: court.status,
    createdAt: formatDate(court.createdAt),
    updatedAt: formatDate(court.updatedAt)
  };
};

/**
 * Chuyển đổi dữ liệu booking
 */
export const transformBookingData = (booking) => {
  return {
    id: booking._id,
    court: {
      id: booking.courtId?._id,
      name: booking.courtId?.name,
      address: booking.courtId?.address
    },
    user: {
      id: booking.userId?._id,
      name: booking.userId?.displayName,
      email: booking.userId?.email
    },
    date: formatDate(booking.date),
    timeSlot: booking.timeSlot,
    status: booking.status,
    totalPrice: formatPrice(booking.totalPrice),
    createdAt: formatDate(booking.createdAt),
    updatedAt: formatDate(booking.updatedAt)
  };
};

/**
 * Chuyển đổi dữ liệu review
 */
export const transformReviewData = (review) => {
  return {
    id: review._id,
    court: {
      id: review.courtId?._id,
      name: review.courtId?.name
    },
    user: {
      id: review.userId?._id,
      name: review.userId?.displayName,
      avatar: review.userId?.avatar
    },
    rating: review.rating,
    comment: review.comment,
    createdAt: formatDate(review.createdAt),
    updatedAt: formatDate(review.updatedAt)
  };
};

/**
 * Chuyển đổi dữ liệu support ticket
 */
export const transformSupportData = (support) => {
  return {
    id: support._id,
    title: support.title,
    description: support.description,
    category: support.category,
    priority: support.priority,
    status: support.status,
    user: {
      id: support.userId?._id,
      name: support.userId?.displayName,
      email: support.userId?.email
    },
    replies: support.replies?.map(reply => ({
      id: reply._id,
      message: reply.message,
      user: {
        id: reply.userId?._id,
        name: reply.userId?.displayName,
        role: reply.userId?.role
      },
      createdAt: formatDate(reply.createdAt)
    })) || [],
    rating: support.rating,
    feedback: support.feedback,
    createdAt: formatDate(support.createdAt),
    updatedAt: formatDate(support.updatedAt)
  };
};

/**
 * Chuyển đổi dữ liệu user
 */
export const transformUserData = (user) => {
  return {
    id: user._id,
    email: user.email,
    displayName: user.displayName,
    phone: user.phone,
    role: user.role,
    status: user.status,
    avatar: user.avatar,
    createdAt: formatDate(user.createdAt),
    updatedAt: formatDate(user.updatedAt)
  };
};

// Utility functions
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / reviews.length).toFixed(1);
}; 