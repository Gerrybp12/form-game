const prisma = require("../config/prisma");

async function assertFormOwner(formId, userId) {
  const form = await prisma.form.findUnique({ where: { id: formId } });
  if (!form) {
    const err = new Error("Form not found");
    err.status = 404;
    throw err;
  }
  if (form.createdById !== userId) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }
  return form;
}

async function hasSubmissions(formId) {
  const count = await prisma.submission.count({ where: { formId } });
  return count > 0;
}

module.exports = { assertFormOwner, hasSubmissions };