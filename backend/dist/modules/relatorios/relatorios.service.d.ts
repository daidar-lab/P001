export declare function listarRelatorios(page?: number, limit?: number, status?: string, clienteId?: string): Promise<{
    data: ({
        cliente: {
            id: string;
            nome: string;
            cnpj: string;
        } | null;
        _count: {
            faturas: number;
        };
        arquivoCsv: {
            id: string;
            nomeArquivo: string;
            quantidadeLinhas: number | null;
        } | null;
    } & {
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        codigoRelatorio: string;
        titulo: string;
        descricao: string | null;
        clienteId: string | null;
        templateId: string | null;
        arquivoCsvId: string | null;
        chavePdfArmazenamento: string | null;
        status: import("@prisma/client").$Enums.StatusRelatorio;
        etapaFluxoAtual: import("@prisma/client").$Enums.EtapaFluxo | null;
        estadoFluxoAtual: import("@prisma/client").$Enums.EstadoFluxo;
        periodoReferencia: Date | null;
        criadoPor: string | null;
        atualizadoPor: string | null;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function buscarRelatorio(id: string): Promise<({
    cliente: {
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
    } | null;
    _count: {
        faturas: number;
        rastreabilidadeCampos: number;
    };
    arquivoCsv: {
        id: string;
        nomeArquivo: string;
        chaveArmazenamento: string;
        plataformaOrigemId: string | null;
        checksum: string | null;
        tipoConteudo: string;
        quantidadeLinhas: number | null;
        carregadoPor: string | null;
        carregadoEm: Date;
        idExternoPlataforma: string | null;
        metadados: import("@prisma/client/runtime/client").JsonValue | null;
    } | null;
    template: {
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        descricao: string | null;
        nomeTemplate: string;
        caminhoArquivo: string;
        versao: string;
        mapeamentoCampos: import("@prisma/client/runtime/client").JsonValue;
        camposCalculados: import("@prisma/client/runtime/client").JsonValue | null;
        camposTabelasDinamicas: import("@prisma/client/runtime/client").JsonValue | null;
        ativo: boolean;
    } | null;
    faturas: {
        id: string;
        periodoReferencia: Date | null;
        numeroLinha: number;
        relatorioId: string;
        concessionaria: string | null;
        clienteNome: string | null;
        numeroUnidade: string | null;
        periodoMedicaoInicio: Date | null;
        periodoMedicaoFim: Date | null;
        classeTarifaria: string | null;
        dataEmissao: Date | null;
        valorTotal: import("@prisma/client-runtime-utils").Decimal | null;
        consumoKwh: import("@prisma/client-runtime-utils").Decimal | null;
        tarifaUnitaria: import("@prisma/client-runtime-utils").Decimal | null;
        tributosPercentual: import("@prisma/client-runtime-utils").Decimal | null;
        valorCip: import("@prisma/client-runtime-utils").Decimal | null;
        bandeiraTarifaria: string | null;
        consumoKwhMesAnterior: import("@prisma/client-runtime-utils").Decimal | null;
        consumoKwhMedia: import("@prisma/client-runtime-utils").Decimal | null;
        diferencaPercentual: import("@prisma/client-runtime-utils").Decimal | null;
        processadoEm: Date;
        metadadosOrigem: import("@prisma/client/runtime/client").JsonValue | null;
    }[];
    analisesIa: {
        id: string;
        metadados: import("@prisma/client/runtime/client").JsonValue | null;
        relatorioId: string;
        processadoEm: Date;
        faturaId: string | null;
        tipoAnalise: string;
        anomaliasDetectadas: import("@prisma/client/runtime/client").JsonValue | null;
        tendencias: string | null;
        recomendacoes: import("@prisma/client/runtime/client").JsonValue | null;
        scoreConfianca: import("@prisma/client-runtime-utils").Decimal | null;
        processadoPor: string | null;
    }[];
    historicoProcessamento: {
        id: string;
        criadoEm: Date;
        etapa: import("@prisma/client").$Enums.EtapaProcessamento;
        relatorioId: string;
        estado: import("@prisma/client").$Enums.EstadoProcessamento;
        iniciadoEm: Date | null;
        finalizadoEm: Date | null;
        duracaoMs: number | null;
        detalhes: import("@prisma/client/runtime/client").JsonValue | null;
        tentadoPor: string | null;
    }[];
    statusFluxoTrabalho: {
        id: string;
        atualizadoEm: Date;
        atualizadoPor: string | null;
        metadados: import("@prisma/client/runtime/client").JsonValue | null;
        etapa: import("@prisma/client").$Enums.EtapaFluxo;
        relatorioId: string;
        estado: import("@prisma/client").$Enums.EstadoFluxo;
        atribuidoPara: string | null;
        ultimoComentario: string | null;
        venceEm: Date | null;
    }[];
} & {
    id: string;
    criadoEm: Date;
    atualizadoEm: Date;
    codigoRelatorio: string;
    titulo: string;
    descricao: string | null;
    clienteId: string | null;
    templateId: string | null;
    arquivoCsvId: string | null;
    chavePdfArmazenamento: string | null;
    status: import("@prisma/client").$Enums.StatusRelatorio;
    etapaFluxoAtual: import("@prisma/client").$Enums.EtapaFluxo | null;
    estadoFluxoAtual: import("@prisma/client").$Enums.EstadoFluxo;
    periodoReferencia: Date | null;
    criadoPor: string | null;
    atualizadoPor: string | null;
}) | null>;
export declare function buscarRastreabilidade(relatorioId: string): Promise<{
    id: string;
    criadoEm: Date;
    validado: boolean;
    relatorioId: string;
    nomeCampo: string;
    valorPreenchido: string | null;
    tipoOrigem: import("@prisma/client").$Enums.TipoOrigem;
    origemEspecifica: string | null;
    observacoes: string | null;
}[]>;
export declare function obterEstatisticas(): Promise<{
    totalRelatorios: number;
    porStatus: Record<string, number>;
    ultimosRelatorios: {
        cliente: {
            nome: string;
        } | null;
        id: string;
        criadoEm: Date;
        codigoRelatorio: string;
        titulo: string;
        status: import("@prisma/client").$Enums.StatusRelatorio;
    }[];
}>;
//# sourceMappingURL=relatorios.service.d.ts.map