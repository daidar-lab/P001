// Cálculos de campos derivados para faturas de energia
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Calcula a tarifa unitária (R$/kWh)
 * Fórmula: valor_total / consumo_kwh
 */
export function calcularTarifaUnitaria(valorTotal: number, consumoKwh: number): number | null {
  if (!consumoKwh || consumoKwh === 0) return null;
  return Number((valorTotal / consumoKwh).toFixed(4));
}

/**
 * Calcula a média de consumo entre o mês atual e o anterior
 * Fórmula: (consumo_atual + consumo_anterior) / 2
 */
export function calcularMediaConsumo(consumoAtual: number, consumoAnterior: number): number | null {
  if (consumoAtual == null || consumoAnterior == null) return null;
  return Number(((consumoAtual + consumoAnterior) / 2).toFixed(2));
}

/**
 * Calcula a diferença percentual de consumo entre meses
 * Fórmula: ((consumo_atual - consumo_anterior) / consumo_anterior) * 100
 */
export function calcularDiferencaPercentual(
  consumoAtual: number,
  consumoAnterior: number
): number | null {
  if (!consumoAnterior || consumoAnterior === 0) return null;
  return Number((((consumoAtual - consumoAnterior) / consumoAnterior) * 100).toFixed(2));
}

/**
 * Calcula o percentual de tributos sobre o valor total
 * Fórmula: ((valor_total - valor_base) / valor_total) * 100
 * onde valor_base = consumo_kwh * tarifa_unitaria + valor_cip
 */
export function calcularTributosPercentual(
  valorTotal: number,
  consumoKwh: number,
  tarifaUnitaria: number,
  valorCip: number
): number | null {
  if (!valorTotal || valorTotal === 0) return null;
  const valorBase = consumoKwh * tarifaUnitaria + (valorCip || 0);
  const tributos = valorTotal - valorBase;
  return Number(((tributos / valorTotal) * 100).toFixed(2));
}

/**
 * Converte Decimal do Prisma para number
 */
export function decimalToNumber(value: Decimal | null | undefined): number | null {
  if (value == null) return null;
  return Number(value);
}

/**
 * Gera código de relatório único
 * Formato: AE-YYYYMM-XXXX (ex: AE-202601-0001)
 */
export function gerarCodigoRelatorio(periodoReferencia?: Date, sequencial?: number): string {
  const now = periodoReferencia || new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const seq = String(sequencial || Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
  return `AE-${year}${month}-${seq}`;
}
