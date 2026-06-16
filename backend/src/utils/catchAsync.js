/**
 * Catch Async Wrapper
 * Wraps async route handlers to catch errors and pass them to the error handler
 *
 * Usage:
 * router.get('/path', catchAsync(async (req, res) => {
 *   // async code here
 *   res.json(data);
 * }));
 *
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default catchAsync;
