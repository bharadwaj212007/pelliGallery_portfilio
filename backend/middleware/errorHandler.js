export const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err.stack || err.message || err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

export default errorHandler;
