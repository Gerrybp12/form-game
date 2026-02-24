const prisma = require("../config/prisma");
const { verifyToken } = require("../utils/jwt");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [, token] = header.split(" ");
    if (!token) return res.status(401).json({ message: "Missing token" });

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.user = { id: user.id, email: user.email, name: user.name };
    next();
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = { requireAuth };