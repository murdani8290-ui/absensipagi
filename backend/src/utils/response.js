export const success = (data, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const error = (message, statusCode = 500, details = null) => {
  return {
    success: false,
    statusCode,
    message,
    ...(details && { details }),
    timestamp: new Date().toISOString(),
  };
};

export const paginated = (data, total, page, limit) => {
  return {
    success: true,
    message: 'Success',
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    timestamp: new Date().toISOString(),
  };
};
