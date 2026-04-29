import { parseAnyFile } from '../src/modules/faturas/csv-parser';
import { validateCsvStructure } from '../src/modules/faturas/csv-validator';
import path from 'path';

async function verify() {
  const csvFile = path.resolve(__dirname, '../uploads/1777468842125-101895596-Bills.csv');
  console.log(`Testando arquivo: ${csvFile}`);

  try {
    const { headers, rows, rawRowCount } = await parseAnyFile(csvFile);
    console.log(`Headers encontrados (${headers.length}):`, headers.join(', '));
    console.log(`Linhas encontradas: ${rawRowCount}`);

    const validation = validateCsvStructure(headers, rows);
    
    console.log('\n--- Resultado da Validação ---');
    console.log(`Válido: ${validation.valid}`);
    
    if (validation.errors.length > 0) {
      console.log('\nErros:');
      validation.errors.forEach(e => console.log(`- [${e.type}] ${e.column || ''}: ${e.message}`));
    }

    if (validation.warnings.length > 0) {
      console.log('\nAvisos (Warnings):');
      validation.warnings.slice(0, 10).forEach(w => console.log(`- [${w.type}] ${w.column || ''}: ${w.message}`));
      if (validation.warnings.length > 10) console.log(`... e mais ${validation.warnings.length - 10} avisos.`);
    }

    if (validation.valid) {
      console.log('\n✅ Sucesso! O CSV agora é compatível.');
    } else {
      console.log('\n❌ Falha! Ainda existem erros de validação.');
    }

  } catch (error) {
    console.error('Erro durante o teste:', error);
  }
}

verify();
