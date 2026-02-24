const prisma = require("../config/prisma");
const { assertFormOwner } = require("../services/guards");

async function list(req, res, next) {
  try {
    const { formId } = req.params;
    await assertFormOwner(formId, req.user.id);

    const subs = await prisma.submission.findMany({
      where: { formId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        respondentName: true,
        respondentEmail: true,
        createdAt: true,
        _count: { select: { answers: true } },
      },
    });

    res.json({ data: subs });
  } catch (e) {
    next(e);
  }
}

async function detail(req, res, next) {
  try {
    const { formId, submissionId } = req.params;
    await assertFormOwner(formId, req.user.id);

    const sub = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        answers: {
          include: {
            question: { include: { options: { orderBy: { order: "asc" } } } },
          },
        },
      },
    });

    if (!sub || sub.formId !== formId) return res.status(404).json({ message: "Submission not found" });

    res.json({ data: sub });
  } catch (e) {
    next(e);
  }
}

module.exports = { list, detail };