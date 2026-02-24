function notFoundHandler(req, res, next) {
  res.status(404).json({ message: "Route not found" });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal Server Error",
    details: err.details || undefined,
  });
}

module.exports = { notFoundHandler, errorHandler };