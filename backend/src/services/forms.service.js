const prisma = require("../config/prisma");
const { assertFormOwner } = require("./guards");

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
      createdAt: true,
      updatedAt: true,
      _count: { select: { questions: true, submissions: true } },
    },
  });
}

async function createForm({ userId, title, description }) {
  return prisma.form.create({
    data: { title, description, createdById: userId },
    select: { id: true, title: true, description: true, status: true, createdAt: true, updatedAt: true },
  });
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
    select: { id: true, title: true, description: true, status: true, createdAt: true, updatedAt: true },
  });
}

async function deleteForm({ userId, formId }) {
  await assertFormOwner(formId, userId);
  await prisma.form.delete({ where: { id: formId } });
}

module.exports = { listForms, createForm, getFormDetailOwner, updateForm, deleteForm };