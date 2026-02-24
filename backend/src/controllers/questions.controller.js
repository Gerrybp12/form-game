const service = require("../services/questions.service");

async function list(req, res, next) {
  try {
    const data = await service.listQuestions({
      userId: req.user.id,
      formId: req.params.formId,
    });
    res.json({ data });
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const data = await service.createQuestion({
      userId: req.user.id,
      formId: req.params.formId,
      data: req.body,
    });
    res.status(201).json({ data });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const data = await service.updateQuestion({
      userId: req.user.id,
      formId: req.params.formId,
      questionId: req.params.questionId,
      data: req.body,
    });
    res.json({ data });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    await service.deleteQuestion({
      userId: req.user.id,
      formId: req.params.formId,
      questionId: req.params.questionId,
    });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = { list, create, update, remove };