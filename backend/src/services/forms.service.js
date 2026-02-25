const prisma = require("../config/prisma");
const { assertFormOwner } = require("./guards");

// 6 digit pin generator
function genPin6() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function listForms({ userId, q, status, sort, order }) {
  const where = {
    createdById: userId,
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(status ? { status } : {}),
  };

  const orderByKey = sort === "createdAt" ? "createdAt" : "updatedAt";

  return prisma.form.findMany({
    where,
    orderBy: { [orderByKey]: order },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      pin: true,
      isPrivate: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { questions: true, submissions: true } },
    },
  });
}

async function createForm({ userId, title, description }) {
  // retry if pin collision (unique)
  for (let i = 0; i < 10; i++) {
    const pin = genPin6();
    try {
      return await prisma.form.create({
        data: {
          title,
          description,
          createdById: userId,
          pin,
          isPrivate: false,
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          pin: true,
          isPrivate: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (e) {
      // Prisma unique constraint violation
      if (e?.code === "P2002") continue;
      throw e;
    }
  }

  const err = new Error("Failed to generate unique PIN");
  err.status = 500;
  throw err;
}

async function getFormDetailOwner({ userId, formId }) {
  await assertFormOwner(formId, userId);

  return prisma.form.findUnique({
    where: { id: formId },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      pin: true,
      isPrivate: true,
      createdAt: true,
      updatedAt: true,
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
}

async function updateForm({ userId, formId, data }) {
  await assertFormOwner(formId, userId);
  return prisma.form.update({
    where: { id: formId },
    data,
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      pin: true,
      isPrivate: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function deleteForm({ userId, formId }) {
  await assertFormOwner(formId, userId);
  await prisma.form.delete({ where: { id: formId } });
}

module.exports = { listForms, createForm, getFormDetailOwner, updateForm, deleteForm };