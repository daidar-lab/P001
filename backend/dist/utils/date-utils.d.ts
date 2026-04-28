/**
 * Converte string de data em diversos formatos para Date
 * Suporta: DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY, MM/YYYY
 */
export declare function parseDate(dateStr: string | null | undefined): Date | null;
/**
 * Converte string numérica para number, tratando formato BR (1.234,56 → 1234.56)
 */
export declare function parseNumber(numStr: string | null | undefined): number | null;
/**
 * Formata período de medição como string legível
 */
export declare function formatarPeriodoMedicao(inicio: Date | null, fim: Date | null): string;
/**
 * Formata mês de referência (ex: "Janeiro/2026")
 */
export declare function formatarMesReferencia(date: Date | null): string;
//# sourceMappingURL=date-utils.d.ts.map