const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const s = require("../controllers/submissions.controller");

router.use(requireAuth);

router.get("/:formId/submissions", s.list);
router.get("/:formId/submissions/:submissionId", s.detail);

module.exports = router;