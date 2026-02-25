const router = require("express").Router();
const pub = require("../controllers/public.controller");
const responses = require("../controllers/responses.controller");

// list public forms (PUBLISHED & non-private)
router.get("/forms", pub.listPublicForms);

// get form detail by PIN (private or not, as long as PUBLISHED)
router.get("/pin/:pin", pub.getFormByPin);

// submit response by PIN
router.post("/pin/:pin/responses", responses.submitByPin);

module.exports = router;