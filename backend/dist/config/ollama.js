"use strict";
// Ollama Configuration (IA Local)
Object.defineProperty(exports, "__esModule", { value: true });
exports.ollamaConfig = void 0;
exports.ollamaConfig = {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama3',
    timeout: 60000, // 60s timeout for LLM responses
};
//# sourceMappingURL=ollama.js.map