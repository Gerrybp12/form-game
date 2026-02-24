const prisma = require("../config/prisma");
const { assertFormOwner } = require("./guards");

async function listSubmissions({ userId, formId }) {
  await assertFormOwner(formId, userId);

  return prisma.submission.findMany({
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
}

async function getSubmissionDetail({ userId, formId, submissionId }) {
  await assertFormOwner(formId, userId);

  const sub = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      answers: {
        include: {
          question: true,
        },
      },
    },
  });

  if (!sub || sub.formId !== formId) {
    const err = new Error("Submission not found");
    err.status = 404;
    throw err;
  }

  return sub;
}

module.exports = { listSubmissions, getSubmissionDetail };