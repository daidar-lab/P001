// Utilitários de String para tratamento de dados brutos do CSV

/**
 * Detecta e converte notação científica (ex: 1.23E+11) para string numérica normal.
 * Útil para campos como CNPJ, IDs de Unidade ou Códigos de Medidor que o Excel/PowerHub
 * podem exportar em formato científico.
 */
export function sanitizeScientificNotation(str: string | null | undefined): string | null {
  if (!str) return null;
  
  const trimmed = str.trim();
  
  // Regex para detectar notação científica: número + E ou e + sinal opcional + expoente
  // Ex: 1.23E+10, 4.5e-2, -1.2E+5
  const scientificRegex = /^[+-]?\d+(\.\d+)?[eE][+-]?\d+$/;
  
  if (scientificRegex.test(trimmed)) {
    const num = Number(trimmed);
    
    if (!isNaN(num)) {
      // Converte para string sem notação científica
      // useGrouping: false evita separadores de milhar (ex: 1234567890 em vez de 1.234.567.890)
      // maximumFractionDigits: 20 garante que não percamos decimais se houver
      return num.toLocaleString('en-US', { 
        useGrouping: false, 
        maximumFractionDigits: 20 
      }).replace(/\.0+$/, ''); // Remove .000 inúteis no final
    }
  }
  
  return trimmed;
}
