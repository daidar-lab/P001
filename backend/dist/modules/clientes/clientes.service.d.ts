export interface CreateClienteDto {
    nome: string;
    cnpj: string;
    endereco?: string;
    cidade?: string;
    responsavel?: string;
    emailFinanceiro?: string;
    metadataCrm?: Record<string, unknown>;
}
export interface UpdateClienteDto {
    nome?: string;
    endereco?: string;
    cidade?: string;
    responsavel?: string;
    emailFinanceiro?: string;
    metadataCrm?: Record<string, unknown>;
}
export declare function listarClientes(page?: number, limit?: number): Promise<{
    data: ({
        _count: {
            relatorios: number;
        };
    } & {
        id: string;
        nome: string;
        cnpj: string;
        endereco: string | null;
        cidade: string | null;
        responsavel: string | null;
        emailFinanceiro: string | null;
        metadataCrm: import("@prisma/client/runtime/client").JsonValue | null;
        criadoEm: Date;
        atualizadoEm: Date;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function buscarCliente(id: string): Promise<({
    relatorios: {
        id: string;
        criadoEm: Date;
        codigoRelatorio: string;
        titulo: string;
        status: import("@prisma/client").$Enums.StatusRelatorio;
        periodoReferencia: Date | null;
    }[];
    _count: {
        relatorios: number;
    };
} & {
    id: string;
    nome: string;
    cnpj: string;
    endereco: string | null;
    cidade: string | null;
    responsavel: string | null;
    emailFinanceiro: string | null;
    metadataCrm: import("@prisma/client/runtime/client").JsonValue | null;
    criadoEm: Date;
    atualizadoEm: Date;
}) | null>;
export declare function criarCliente(data: CreateClienteDto): Promise<{
    id: string;
    nome: string;
    cnpj: string;
    endereco: string | null;
    cidade: string | null;
    responsavel: string | null;
    emailFinanceiro: string | null;
    metadataCrm: import("@prisma/client/runtime/client").JsonValue | null;
    criadoEm: Date;
    atualizadoEm: Date;
}>;
export declare function atualizarCliente(id: string, data: UpdateClienteDto): Promise<{
    id: string;
    nome: string;
    cnpj: string;
    endereco: string | null;
    cidade: string | null;
    responsavel: string | null;
    emailFinanceiro: string | null;
    metadataCrm: import("@prisma/client/runtime/client").JsonValue | null;
    criadoEm: Date;
    atualizadoEm: Date;
}>;
export declare function deletarCliente(id: string): Promise<{
    id: string;
    nome: string;
    cnpj: string;
    endereco: string | null;
    cidade: string | null;
    responsavel: string | null;
    emailFinanceiro: string | null;
    metadataCrm: import("@prisma/client/runtime/client").JsonValue | null;
    criadoEm: Date;
    atualizadoEm: Date;
}>;
//# sourceMappingURL=clientes.service.d.ts.map