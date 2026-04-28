import { Prisma } from '@prisma/client';
/**
 * Calcula a tarifa unitária (R$/kWh)
 * Fórmula: valor_total / consumo_kwh
 */
export declare function calcularTarifaUnitaria(valorTotal: number, consumoKwh: number): number | null;
/**
 * Calcula a média de consumo entre o mês atual e o anterior
 * Fórmula: (consumo_atual + consumo_anterior) / 2
 */
export declare function calcularMediaConsumo(consumoAtual: number, consumoAnterior: number): number | null;
/**
 * Calcula a diferença percentual de consumo entre meses
 * Fórmula: ((consumo_atual - consumo_anterior) / consumo_anterior) * 100
 */
export declare function calcularDiferencaPercentual(consumoAtual: number, consumoAnterior: number): number | null;
/**
 * Calcula o percentual de tributos sobre o valor total
 * Fórmula: ((valor_total - valor_base) / valor_total) * 100
 * onde valor_base = consumo_kwh * tarifa_unitaria + valor_cip
 */
export declare function calcularTributosPercentual(valorTotal: number, consumoKwh: number, tarifaUnitaria: number, valorCip: number): number | null;
/**
 * Converte Decimal do Prisma para number
 */
export declare function decimalToNumber(value: Prisma.Decimal | null | undefined): number | null;
/**
 * Gera código de relatório único
 * Formato: AE-YYYYMM-XXXX (ex: AE-202601-0001)
 */
export declare function gerarCodigoRelatorio(periodoReferencia?: Date, sequencial?: number): string;
//# sourceMappingURL=calculations.d.ts.map