const prisma = require("../config/prisma");
const { assertFormOwner, hasSubmissions } = require("./guards");

function isOptionType(type) {
  return ["MULTIPLE_CHOICE", "CHECKBOX", "DROPDOWN"].includes(type);
}

async function listQuestions({ userId, formId }) {
  await assertFormOwner(formId, userId);

  return prisma.question.findMany({
    where: { formId },
    orderBy: { order: "asc" },
    include: { options: { orderBy: { order: "asc" } } },
  });
}

async function createQuestion({ userId, formId, data }) {
  await assertFormOwner(formId, userId);

  if (isOptionType(data.type) && (!data.options || data.options.length === 0)) {
    const err = new Error("Options required for this question type");
    err.status = 400;
    throw err;
  }

  const max = await prisma.question.aggregate({
    where: { formId },
    _max: { order: true },
  });

  const nextOrder = (max._max.order ?? 0) + 1;

  return prisma.question.create({
    data: {
      formId,
      title: data.title,
      type: data.type,
      isRequired: data.isRequired ?? false,
      order: nextOrder,
      options: isOptionType(data.type)
        ? {
            create: data.options.map((o, idx) => ({
              text: o.text,
              order: idx + 1,
            })),
          }
        : undefined,
    },
    include: { options: { orderBy: { order: "asc" } } },
  });
}

async function updateQuestion({ userId, formId, questionId, data }) {
  await assertFormOwner(formId, userId);

  const locked = await hasSubmissions(formId);

  if (locked && data.type !== undefined) {
    const err = new Error("Cannot change question type after submissions exist");
    err.status = 409;
    throw err;
  }

  if (locked && data.options !== undefined) {
    const err = new Error("Cannot edit options after submissions exist");
    err.status = 409;
    throw err;
  }

  const existing = await prisma.question.findUnique({ where: { id: questionId } });
  if (!existing || existing.formId !== formId) {
    const err = new Error("Question not found");
    err.status = 404;
    throw err;
  }

  return prisma.$transaction(async (tx) => {
    await tx.question.update({
      where: { id: questionId },
      data: {
        title: data.title,
        type: data.type,
        isRequired: data.isRequired,
      },
    });

    if (data.options !== undefined) {
      await tx.option.deleteMany({ where: { questionId } });

      if (isOptionType(data.type ?? existing.type)) {
        await tx.option.createMany({
          data: data.options.map((o, idx) => ({
            questionId,
            text: o.text,
            order: idx + 1,
          })),
        });
      }
    }

    return tx.question.findUnique({
      where: { id: questionId },
      include: { options: { orderBy: { order: "asc" } } },
    });
  });
}

async function deleteQuestion({ userId, formId, questionId }) {
  await assertFormOwner(formId, userId);

  const locked = await hasSubmissions(formId);
  if (locked) {
    const err = new Error("Cannot delete questions after submissions exist");
    err.status = 409;
    throw err;
  }

  await prisma.question.delete({ where: { id: questionId } });
}

module.exports = {
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};