const prisma = require("../config/prisma");

// GET /api/public/forms
// tampilkan hanya form yang PUBLISHED dan non-private
async function listPublicForms(req, res, next) {
  try {
    const data = await prisma.form.findMany({
      where: { status: "PUBLISHED", isPrivate: false },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        pin: true,
        updatedAt: true,
      },
    });

    res.json({ data });
  } catch (e) {
    next(e);
  }
}

// GET /api/public/pin/:pin
// bisa private ataupun non-private, asal PUBLISHED
async function getFormByPin(req, res, next) {
  try {
    const pin = String(req.params.pin);

    const form = await prisma.form.findUnique({
      where: { pin },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        pin: true,
        isPrivate: true,
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

    if (!form) return res.status(404).json({ message: "PIN not found" });
    if (form.status !== "PUBLISHED") return res.status(403).json({ message: "Form is not published" });

    res.json({ data: form });
  } catch (e) {
    next(e);
  }
}

module.exports = { listPublicForms, getFormByPin };