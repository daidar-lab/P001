"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCsvBuffer = parseCsvBuffer;
exports.parseCsvFile = parseCsvFile;
// Parser CSV — Converte linhas CSV em objetos tipados
const csv_parse_1 = require("csv-parse");
const stream_1 = require("stream");
/**
 * Faz o parse de um buffer CSV e retorna headers + linhas tipadas
 * Suporta delimitadores ; e , (auto-detecta)
 */
async function parseCsvBuffer(buffer) {
    const content = buffer.toString('utf-8');
    // Auto-detecta delimitador (;  ou ,)
    const firstLine = content.split('\n')[0] || '';
    const delimiter = firstLine.includes(';') ? ';' : ',';
    return new Promise((resolve, reject) => {
        const rows = [];
        let headers = [];
        const stream = stream_1.Readable.from(content);
        stream
            .pipe((0, csv_parse_1.parse)({
            delimiter,
            columns: (rawHeaders) => {
                headers = rawHeaders.map((h) => h.trim().toLowerCase());
                return headers;
            },
            skip_empty_lines: true,
            trim: true,
            relax_column_count: true,
            bom: true, // Handle BOM (UTF-8 with BOM from Excel)
        }))
            .on('data', (row) => {
            rows.push(row);
        })
            .on('end', () => {
            resolve({
                headers,
                rows,
                rawRowCount: rows.length,
            });
        })
            .on('error', (error) => {
            reject(new Error(`Erro ao processar CSV: ${error.message}`));
        });
    });
}
/**
 * Faz o parse de um arquivo CSV a partir do caminho
 */
async function parseCsvFile(filePath) {
    const fs = await Promise.resolve().then(() => __importStar(require('fs')));
    const buffer = fs.readFileSync(filePath);
    return parseCsvBuffer(buffer);
}
//# sourceMappingURL=csv-parser.js.map