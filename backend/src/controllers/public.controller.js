const prisma = require("../config/prisma");

async function formDetail(req, res, next) {
  try {
    const { formId } = req.params;

    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        questions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            type: true,
            isRequired: true,
            order: true,
            options: { orderBy: { order: "asc" }, select: { id: true, text: true, order: true } },
          },
        },
      },
    });

    if (!form) return res.status(404).json({ message: "Form not found" });
    if (form.status !== "PUBLISHED") return res.status(403).json({ message: "Form is not published" });

    res.json({ data: form });
  } catch (e) {
    next(e);
  }
}

module.exports = { formDetail };