// Relatórios Controller — Handlers HTTP
import { Request, Response, NextFunction } from 'express';
import * as relatoriosService from './relatorios.service';
import { runPipeline } from '../../pipeline/orchestrator';
import { createError } from '../../middleware/error-handler';

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;
    const clienteId = req.query.clienteId as string | undefined;
    const dataInicio = req.query.dataInicio as string | undefined;
    const dataFim = req.query.dataFim as string | undefined;

    const result = await relatoriosService.listarRelatorios(
      page, 
      limit, 
      status, 
      clienteId,
      dataInicio,
      dataFim
    );
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function buscar(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const relatorio = await relatoriosService.buscarRelatorio(id as string);

    if (!relatorio) {
      throw createError('Relatório não encontrado', 404, 'RELATORIO_NOT_FOUND');
    }

    res.json({ success: true, data: relatorio });
  } catch (error) {
    next(error);
  }
}

export async function upload(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw createError('Arquivo CSV é obrigatório', 400, 'MISSING_FILE');
    }

    const { originalname, path: filePath } = req.file;
    const uploadedBy = (req.body.uploadedBy as string) || 'sistema';

    console.log(`[UPLOAD] Recebido: ${originalname} → Iniciando pipeline...`);

    const result = await runPipeline(filePath, originalname, uploadedBy);

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'CSV processado com sucesso',
        data: {
          codigoRelatorio: result.ingest?.codigoRelatorio,
          relatorioId: result.ingest?.relatorioId,
          faturasProcessadas: result.process?.faturasInseridas,
          camposRastreados: result.process?.camposRastreados,
        },
      });
    } else {
      res.status(422).json({
        success: false,
        message: 'Pipeline parou com erros',
        error: result.error,
        stoppedAtStep: result.stoppedAtStep,
        validation: result.validate?.validation,
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function rastreabilidade(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const campos = await relatoriosService.buscarRastreabilidade(id as string);
    res.json({ success: true, data: campos });
  } catch (error) {
    next(error);
  }
}

export async function estatisticas(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await relatoriosService.obterEstatisticas();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}

export async function downloadPdf(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const relatorio = await relatoriosService.buscarRelatorio(id);

    if (!relatorio) {
      throw createError('Relatório não encontrado', 404, 'RELATORIO_NOT_FOUND');
    }

    const fs = await import('fs');
    const path = await import('path');
    const pdfPath = path.join(__dirname, `../../../uploads/pdfs/relatorio-${relatorio.codigoRelatorio}.pdf`);

    if (!fs.existsSync(pdfPath)) {
      throw createError('Arquivo PDF não encontrado. Tente gerar novamente.', 404, 'PDF_NOT_FOUND');
    }

    res.download(pdfPath, `Relatorio-Audit-${relatorio.codigoRelatorio}.pdf`);
  } catch (error) {
    next(error);
  }
}

export async function gerarManual(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { gerarRelatorioPdf } = await import('./relatorio-pdf.service');
    
    const pdfPath = await gerarRelatorioPdf({ relatorioId: id });
    
    res.json({ 
      success: true, 
      message: 'PDF gerado com sucesso',
      path: pdfPath 
    });
  } catch (error) {
    next(error);
  }
}
