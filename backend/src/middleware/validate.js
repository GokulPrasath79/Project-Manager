// Validates body/query/params with Zod. Parsed values land in req.valid.
module.exports = (schemas) => (req, res, next) => {
  req.valid = {};
  for (const part of ['params', 'query', 'body']) {
    if (schemas[part]) {
      const result = schemas[part].safeParse(req[part]);
      if (!result.success) return next(result.error);
      req.valid[part] = result.data;
    }
  }
  next();
};
