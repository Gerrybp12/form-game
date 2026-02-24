const router = require("express").Router();
const pub = require("../controllers/public.controller");
const responses = require("../controllers/responses.controller");

router.get("/forms/:formId", pub.formDetail);
router.post("/forms/:formId/responses", responses.submit);

module.exports = router;