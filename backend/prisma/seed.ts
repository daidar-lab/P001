import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de usuários...");

  const passwordHash = await bcrypt.hash("admin", 10);

  const admin = await prisma.usuario.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: passwordHash,
      cargo: "ADMIN",
      nome: "Administrador Global",
    },
  });

  console.log(`✅ Usuário admin criado: ${admin.username}`);

  // Usuário de teste
  const userPass = await bcrypt.hash("user", 10);
  const user = await prisma.usuario.upsert({
    where: { username: "user" },
    update: {},
    create: {
      username: "user",
      passwordHash: userPass,
      cargo: "USER",
      nome: "Usuário Padrão",
    },
  });

  console.log(`✅ Usuário padrão criado: ${user.username}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
