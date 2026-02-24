const service = require("../services/responses.service");

async function submit(req, res, next) {
  try {
    const { formId } = req.params;
    const submission = await service.submitResponse({ formId, payload: req.body });
    res.status(201).json({ data: { submissionId: submission.id } });
  } catch (e) {
    next(e);
  }
}

module.exports = { submit };