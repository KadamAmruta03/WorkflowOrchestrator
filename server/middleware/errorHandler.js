// Global error handler
module.exports = function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-unused-vars
  const _next = next;

  const status = Number(err.status || err.statusCode) || 500;
  const message = err.message || 'Server error';

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error('[api:error]', { method: req.method, path: req.originalUrl, message, stack: err.stack });
  }

  return res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'production' ? null : { error: err.stack })
  });
};

