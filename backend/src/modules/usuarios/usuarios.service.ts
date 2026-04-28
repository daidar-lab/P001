import prisma from "../../config/database";
import bcrypt from "bcryptjs";

export async function listarTodos() {
  return prisma.usuario.findMany({
    select: {
      id: true,
      username: true,
      nome: true,
      cargo: true,
      criadoEm: true,
    },
    orderBy: { criadoEm: "desc" },
  });
}

export async function criarUsuario(data: { username: string; passwordHash: string; nome: string; cargo: "ADMIN" | "USER" }) {
  const passwordHash = await bcrypt.hash(data.passwordHash, 10);
  
  return prisma.usuario.create({
    data: {
      ...data,
      passwordHash,
    },
    select: {
      id: true,
      username: true,
      nome: true,
      cargo: true,
    }
  });
}

export async function deletarUsuario(id: string) {
  return prisma.usuario.delete({
    where: { id },
  });
}
