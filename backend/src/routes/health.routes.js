const router = require("express").Router();

router.get("/env", (req, res) => {
  res.json({
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasJwtSecret: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV,
  });
});

module.exports = router;