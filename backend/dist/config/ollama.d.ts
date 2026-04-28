export declare const ollamaConfig: {
    baseUrl: string;
    model: string;
    timeout: number;
};
export interface OllamaRequest {
    model: string;
    prompt: string;
    stream?: boolean;
    options?: {
        temperature?: number;
        top_p?: number;
        num_predict?: number;
    };
}
export interface OllamaResponse {
    model: string;
    response: string;
    done: boolean;
    total_duration?: number;
}
//# sourceMappingURL=ollama.d.ts.map