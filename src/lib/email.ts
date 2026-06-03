import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY!);

const FROM = process.env.RESEND_FROM_EMAIL ?? "PipeFlow CRM <no-reply@pipeflow.app>";

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
    subject: `Você foi convidado para o workspace "${workspaceName}" no PipeFlow CRM`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Convite para o PipeFlow CRM</h2>
        <p><strong>${inviterName}</strong> convidou você para fazer parte do workspace <strong>${workspaceName}</strong>.</p>
        <p>Clique no botão abaixo para aceitar o convite:</p>
        <a href="${inviteUrl}" style="
          display: inline-block;
          background: #0f172a;
          color: #fff;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          margin: 16px 0;
        ">Aceitar convite</a>
        <p style="color: #64748b; font-size: 14px;">
          O link expira em 7 dias. Se você não esperava este convite, pode ignorar este e-mail.
        </p>
      </div>
    `,
  });
}
