import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Configuração do Transportador SMTP (Outlook/Office 365)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true para 465, false para outras portas (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false // Útil para ambientes corporativos com firewalls
  }
});

interface SendReportEmailOptions {
  to: string;
  clienteNome: string;
  periodoReferencia: string;
  pdfPath: string;
}

export async function enviarRelatorioPorEmail(options: SendReportEmailOptions) {
  const { to, clienteNome, periodoReferencia, pdfPath } = options;

  console.log(`[SMTP] Preparando envio via Outlook para ${to}...`);

  try {
    const filename = path.basename(pdfPath);
    
    // Verificando se o arquivo existe antes de tentar enviar
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`Arquivo não encontrado: ${pdfPath}`);
    }

    const mailOptions = {
      from: `"Audit Energy" <${process.env.SMTP_USER}>`,
      to: to,
      subject: `Relatório de Auditoria Energética — ${clienteNome} — ${periodoReferencia}`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #10b981;">Relatório Disponível!</h2>
          <p>Olá, <strong>${clienteNome}</strong>,</p>
          <p>Seu relatório de auditoria energética referente a <strong>${periodoReferencia}</strong> já foi processado e está pronto para análise.</p>
          <p>O documento anexo contém o levantamento detalhado do seu inventário e a comparação com o consumo real da fatura.</p>
          <br>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; font-size: 14px;">
            <strong>Resumo do Processamento:</strong>
            <ul style="margin-top: 10px;">
              <li>Cliente: ${clienteNome}</li>
              <li>Período: ${periodoReferencia}</li>
              <li>Status: Auditado</li>
            </ul>
          </div>
          <br>
          <p>Atenciosamente,</p>
          <p><strong>Engenharia — Audit Energy</strong></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 11px; color: #999; text-align: center;">Este e-mail foi enviado automaticamente pelo sistema Audit Energy.</p>
        </div>
      `,
      attachments: [
        {
          filename: filename,
          path: pdfPath, // Nodemailer aceita o path direto e faz a leitura
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('[SMTP] E-mail enviado com sucesso! MessageId:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[SMTP] Erro ao enviar e-mail:', err);
    return { success: false, error: err };
  }
}
