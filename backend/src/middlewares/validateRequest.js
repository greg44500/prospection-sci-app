import { ApiError } from '../utils/ApiError.js';

/**
 * validateRequest(schemaMap, options)
 * schemaMap: { body?: z.Schema, params?: z.Schema, query?: z.Schema }
 * returns express middleware that parses and attaches `req.validated` object
 */
export const validateRequest = (schemaMap = {}) => {
  return (req, res, next) => {
    try {
      const validated = {};

      if (schemaMap.params) {
        validated.params = schemaMap.params.parse(req.params || {});
      }

      if (schemaMap.query) {
        validated.query = schemaMap.query.parse(req.query || {});
      }

      if (schemaMap.body) {
        validated.body = schemaMap.body.parse(req.body || {});
      }

      // Attach validated data for controllers to use
      req.validated = validated;
      return next();
    } catch (err) {
      // Zod error -> respond 400 directly to simplify error flow
      if (err && err.errors) {
        const errors = err.errors.map((e) => ({ path: e.path.join('.'), message: e.message }));
        return res.status(400).json({ success: false, message: 'Validation failed', errors });
      }
      return next(err);
    }
  };
};

export default validateRequest;
