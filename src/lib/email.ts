import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY!);

// Sem domínio verificado no Resend, use "onboarding@resend.dev" (domínio de teste deles).
// Com domínio próprio verificado, defina RESEND_FROM_EMAIL=Nome <voce@seudominio.com>
const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

export async function sendInviteEmail({
  to,
  workspaceName,
  inviterName,
  inviteUrl,
}: {
  to: string;
  workspaceName: string;
  inviterName: string;
  inviteUrl: string;
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `${inviterName} convidou você para o workspace "${workspaceName}"`,
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Convite PipeFlow</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:28px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#facc15;border-radius:10px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                <span style="font-size:18px;line-height:36px;">⚡</span>
              </td>
              <td style="padding-left:10px;font-size:20px;font-weight:700;color:#09090b;letter-spacing:-0.5px;">
                PipeFlow
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#ffffff;border-radius:16px;border:1px solid #e4e4e7;overflow:hidden;">

          <!-- Yellow top bar -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:#facc15;height:4px;"></td></tr>
          </table>

          <!-- Body -->
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 40px 32px;">
            <tr><td>
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:1px;">Convite para workspace</p>
              <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#09090b;line-height:1.2;">${workspaceName}</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#3f3f46;line-height:1.6;">
                <strong style="color:#09090b;">${inviterName}</strong> convidou você para colaborar no workspace
                <strong style="color:#09090b;">${workspaceName}</strong> no PipeFlow CRM.
              </p>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#facc15;border-radius:10px;">
                    <a href="${inviteUrl}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#09090b;text-decoration:none;letter-spacing:-0.2px;">
                      Aceitar convite →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- URL fallback -->
              <p style="margin:0 0 4px;font-size:12px;color:#71717a;">Ou copie e cole este link no navegador:</p>
              <p style="margin:0;font-size:12px;color:#3b82f6;word-break:break-all;">${inviteUrl}</p>
            </td></tr>
          </table>

          <!-- Footer inside card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f4f4f5;padding:20px 40px;">
            <tr><td>
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.5;">
                Este convite expira em <strong style="color:#71717a;">7 dias</strong>.
                Se você não esperava este convite, pode ignorar este e-mail com segurança.
              </p>
            </td></tr>
          </table>

        </td></tr>

        <!-- Bottom footer -->
        <tr><td align="center" style="padding-top:24px;">
          <p style="margin:0;font-size:12px;color:#a1a1aa;">
            © ${new Date().getFullYear()} PipeFlow CRM · Gestão de leads e pipeline de vendas
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
