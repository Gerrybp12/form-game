const authService = require("../services/auth.service");

async function register(req, res, next) {
  try {
    const { name, email, password } = req.validated.body;
    const result = await authService.register({ name, email, password });
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.validated.body;
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (e) {
    next(e);
  }
}

async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, me };