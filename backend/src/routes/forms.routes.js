const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const forms = require("../controllers/forms.controller");
const { z } = require("zod");

router.use(requireAuth);

const listSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
    sort: z.enum(["createdAt", "updatedAt"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});

const createSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
  }),
});

const updateSchema = z.object({
  params: z.object({ formId: z.string().min(1) }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  }),
});

const idSchema = z.object({
  params: z.object({ formId: z.string().min(1) }),
});

router.get("/", validate(listSchema), forms.list);
router.post("/", validate(createSchema), forms.create);
router.get("/:formId", validate(idSchema), forms.detail);
router.patch("/:formId", validate(updateSchema), forms.update);
router.delete("/:formId", validate(idSchema), forms.remove);

module.exports = router;