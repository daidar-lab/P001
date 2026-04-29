import prisma from '../src/config/database';

async function checkDates() {
  const now = new Date();
  console.log(`Server Current Time: ${now.toISOString()}`);
  console.log(`Server Date String: ${now.toDateString()}`);

  const relatorios = await prisma.relatorio.findMany({
    take: 5,
    orderBy: { criadoEm: 'desc' },
    select: { id: true, criadoEm: true, status: true }
  });

  relatorios.forEach(r => {
    console.log(`Relatorio ID: ${r.id}`);
    console.log(`Status: ${r.status}`);
    console.log(`CriadoEm (ISO): ${r.criadoEm.toISOString()}`);
    console.log(`CriadoEm (String): ${r.criadoEm.toDateString()}`);
    console.log(`Match with Now? ${r.criadoEm.toDateString() === now.toDateString()}`);
  });

  await prisma.$disconnect();
}

checkDates();
