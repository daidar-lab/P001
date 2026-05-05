import prisma from "../../config/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "audit-energy-secret-key-2026";

export async function login(username: string, pass: string) {
  const user = await prisma.usuario.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error("Usuário ou senha inválidos");
  }

  const isValid = await bcrypt.compare(pass, user.passwordHash);
  if (!isValid) {
    throw new Error("Usuário ou senha inválidos");
  }

  const token = jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      cargo: user.cargo,
      nome: user.nome 
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user: {
      id: user.id,
      username: user.username,
      cargo: user.cargo,
      nome: user.nome,
    },
    token,
  };
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
