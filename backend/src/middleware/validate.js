function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input",
        details: result.error.errors,
      });
    }

    // simpan data tervalidasi biar controller enak
    req.validated = result.data;
    next();
  };
}

module.exports = { validate };