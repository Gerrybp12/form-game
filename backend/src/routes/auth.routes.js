const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const auth = require("../controllers/auth.controller");
const { z } = require("zod");

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    avatarPath: z.string().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

router.post("/register", validate(registerSchema), auth.register);
router.post("/login", validate(loginSchema), auth.login);
router.get("/me", requireAuth, auth.me);

module.exports = router;