const formsService = require("../services/forms.service");

async function list(req, res, next) {
  try {
    const q = (req.validated.query.q || "").trim();
    const status = req.validated.query.status || null;
    const sort = req.validated.query.sort || "updatedAt";
    const order = req.validated.query.order || "desc";

    const data = await formsService.listForms({
      userId: req.user.id,
      q,
      status,
      sort,
      order,
    });

    res.json({ data });
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const { title, description } = req.validated.body;
    const data = await formsService.createForm({ userId: req.user.id, title, description });
    res.status(201).json({ data });
  } catch (e) {
    next(e);
  }
}

async function detail(req, res, next) {
  try {
    const { formId } = req.validated.params;
    const data = await formsService.getFormDetailOwner({ userId: req.user.id, formId });
    res.json({ data });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const { formId } = req.validated.params;
    const data = await formsService.updateForm({ userId: req.user.id, formId, data: req.validated.body });
    res.json({ data });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const { formId } = req.validated.params;
    await formsService.deleteForm({ userId: req.user.id, formId });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = { list, create, detail, update, remove };