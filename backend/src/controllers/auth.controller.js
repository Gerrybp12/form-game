const authService = require("../services/auth.service");
const prisma = require("../config/prisma");

async function register(req, res, next) {
  try {
    const { name, email, password, avatarPath } = req.validated.body;
    const result = await authService.register({ name, email, password, avatarPath });
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

async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, avatarPath: true },
    });

    res.json({ user });
  } catch (e) {
    next(e);
  }
}

module.exports = { register, login, me };