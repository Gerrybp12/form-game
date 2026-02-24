const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const q = require("../controllers/questions.controller");

router.use(requireAuth);

router.get("/:formId/questions", q.list);
router.post("/:formId/questions", q.create);
router.patch("/:formId/questions/:questionId", q.update);
router.delete("/:formId/questions/:questionId", q.remove);

module.exports = router;