import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    code?: string;
    details?: unknown;
}
export declare function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction): void;
export declare function createError(message: string, statusCode?: number, code?: string, details?: unknown): AppError;
export declare function notFoundHandler(_req: Request, res: Response): void;
//# sourceMappingURL=error-handler.d.ts.map