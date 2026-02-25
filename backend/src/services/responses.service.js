const prisma = require("../config/prisma");

async function submitResponse({ formId, payload }) {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: { questions: { include: { options: true } } },
  });

  if (!form) {
    const err = new Error("Form not found");
    err.status = 404;
    throw err;
  }

  if (form.status !== "PUBLISHED") {
    const err = new Error("Form is not published");
    err.status = 403;
    throw err;
  }

  const answerMap = new Map(payload.answers.map((a) => [a.questionId, a]));

  return prisma.$transaction(async (tx) => {
    const submission = await tx.submission.create({
      data: {
        formId,
        respondentName: payload.respondentName,
        respondentEmail: payload.respondentEmail,
      },
    });

    const answerCreates = [];

    for (const q of form.questions) {
      const a = answerMap.get(q.id);
      if (!a) continue;

      // normalize fields based on question type
      let valueText = null;
      let valueOption = null;
      let valueOptions = [];

      if (q.type === "SHORT_ANSWER") {
        valueText = a.valueText ?? null;
      } else if (q.type === "MULTIPLE_CHOICE" || q.type === "DROPDOWN") {
        // accept either valueOption or (fallback) valueText
        valueOption = a.valueOption ?? a.valueText ?? null;
      } else if (q.type === "CHECKBOX") {
        valueOptions = Array.isArray(a.valueOptions) ? a.valueOptions : [];
      }

      answerCreates.push({
        submissionId: submission.id,
        questionId: q.id,
        valueText,
        valueOption,
        valueOptions,
      });
    }

    if (answerCreates.length > 0) {
      await tx.answer.createMany({ data: answerCreates });
    }

    return submission;
  });
}

module.exports = { submitResponse };
