"use strict";
// Utilitários de Data para processamento de faturas
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDate = parseDate;
exports.parseNumber = parseNumber;
exports.formatarPeriodoMedicao = formatarPeriodoMedicao;
exports.formatarMesReferencia = formatarMesReferencia;
/**
 * Converte string de data em diversos formatos para Date
 * Suporta: DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY, MM/YYYY
 */
function parseDate(dateStr) {
    if (!dateStr || dateStr.trim() === '')
        return null;
    const cleaned = dateStr.trim();
    // Formato ISO: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
        const date = new Date(cleaned + 'T00:00:00');
        return isNaN(date.getTime()) ? null : date;
    }
    // Formato BR: DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(cleaned)) {
        const [day, month, year] = cleaned.split('/');
        const date = new Date(`${year}-${month}-${day}T00:00:00`);
        return isNaN(date.getTime()) ? null : date;
    }
    // Formato DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(cleaned)) {
        const [day, month, year] = cleaned.split('-');
        const date = new Date(`${year}-${month}-${day}T00:00:00`);
        return isNaN(date.getTime()) ? null : date;
    }
    // Formato MM/YYYY (período de referência)
    if (/^\d{2}\/\d{4}$/.test(cleaned)) {
        const [month, year] = cleaned.split('/');
        const date = new Date(`${year}-${month}-01T00:00:00`);
        return isNaN(date.getTime()) ? null : date;
    }
    return null;
}
/**
 * Converte string numérica para number, tratando formato BR (1.234,56 → 1234.56)
 */
function parseNumber(numStr) {
    if (!numStr || numStr.trim() === '')
        return null;
    let cleaned = numStr.trim();
    // Formato BR: 1.234,56 → 1234.56
    if (cleaned.includes(',') && cleaned.includes('.')) {
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    }
    else if (cleaned.includes(',')) {
        cleaned = cleaned.replace(',', '.');
    }
    const num = Number(cleaned);
    return isNaN(num) ? null : num;
}
/**
 * Formata período de medição como string legível
 */
function formatarPeriodoMedicao(inicio, fim) {
    if (!inicio || !fim)
        return '';
    const fmtDate = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    return `${fmtDate(inicio)} a ${fmtDate(fim)}`;
}
/**
 * Formata mês de referência (ex: "Janeiro/2026")
 */
function formatarMesReferencia(date) {
    if (!date)
        return '';
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];
    return `${meses[date.getMonth()]}/${date.getFullYear()}`;
}
//# sourceMappingURL=date-utils.js.map