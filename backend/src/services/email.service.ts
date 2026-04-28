import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendReportEmailOptions {
  to: string;
  clienteNome: string;
  periodoReferencia: string;
  pdfPath: string;
}

export async function enviarRelatorioPorEmail(options: SendReportEmailOptions) {
  const { to, clienteNome, periodoReferencia, pdfPath } = options;

  console.log(`[EMAIL] Preparando envio para ${to}...`);

  try {
    const filename = path.basename(pdfPath);
    const attachmentBuffer = fs.readFileSync(pdfPath);

    const { data, error } = await resend.emails.send({
      from: 'Audit Energy <relatorios@auditenergy.com.br>', // Certifique-se de validar seu domínio no Resend
      to: [to],
      subject: `Relatório de Auditoria Energética — ${clienteNome} — ${periodoReferencia}`,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h1 style="color: #10b981;">Olá, ${clienteNome}!</h1>
          <p>Seu relatório de auditoria energética referente a <strong>${periodoReferencia}</strong> acaba de ser gerado e analisado por nossa inteligência artificial.</p>
          <p>O documento detalhado com a análise de consumo, inventário de equipamentos e conclusões técnicas está em anexo.</p>
          <br>
          <p>Atenciosamente,</p>
          <p><strong>Equipe Audit Energy</strong></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">Este é um e-mail automático, por favor não responda.</p>
        </div>
      `,
      attachments: [
        {
          filename: filename,
          content: attachmentBuffer,
        },
      ],
    });

    if (error) {
      console.error('[EMAIL] Erro ao enviar via Resend:', error);
      return { success: false, error };
    }

    console.log('[EMAIL] E-mail enviado com sucesso!', data);
    return { success: true, data };
  } catch (err) {
    console.error('[EMAIL] Erro inesperado no serviço de e-mail:', err);
    return { success: false, error: err };
  }
}
