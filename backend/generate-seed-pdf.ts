import { gerarRelatorioPdf } from "./src/modules/relatorios/relatorio-pdf.service";

async function run() {
  console.log("🚀 Gerando PDF para o seed...");
  try {
    const path = await gerarRelatorioPdf({ relatorioId: "7d981d3f-bfd9-49b7-9f10-6e25d5a6cd88" });
    console.log("✅ PDF gerado com sucesso em:", path);
  } catch (err) {
    console.error("❌ Erro ao gerar PDF:", err);
  }
}

run();
