const prisma = require("../config/prisma");
const service = require("../services/responses.service");

// lama (masih bisa dipakai kalau route by formId tetap ada)
async function submit(req, res, next) {
  try {
    const { formId } = req.params;
    const submission = await service.submitResponse({ formId, payload: req.body });
    res.status(201).json({ data: { submissionId: submission.id } });
  } catch (e) {
    next(e);
  }
}

// BARU: submit via PIN
async function submitByPin(req, res, next) {
  try {
    const pin = String(req.params.pin);

    const form = await prisma.form.findUnique({
      where: { pin },
      select: { id: true, status: true },
    });

    if (!form) return res.status(404).json({ message: "PIN not found" });
    if (form.status !== "PUBLISHED") {
      return res.status(403).json({ message: "Form is not published" });
    }

    const submission = await service.submitResponse({
      formId: form.id,
      payload: req.body,
    });

    res.status(201).json({ data: { submissionId: submission.id } });
  } catch (e) {
    next(e);
  }
}

module.exports = { submit, submitByPin };