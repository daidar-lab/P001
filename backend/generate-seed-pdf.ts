import { gerarRelatorioPdf } from "./src/modules/relatorios/relatorio-pdf.service";

async function run() {
  console.log("🚀 Gerando PDF para o seed...");
  try {
    const path = await gerarRelatorioPdf({ relatorioId: "444b2a4c-74ed-4405-8089-ed0e6e13b458" });
    console.log("✅ PDF gerado com sucesso em:", path);
  } catch (err) {
    console.error("❌ Erro ao gerar PDF:", err);
  }
}

run();
