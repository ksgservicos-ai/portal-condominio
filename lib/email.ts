import { Resend } from 'resend'

// Lazy init — avoids build-time error when RESEND_API_KEY is not set
function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? 'Portal <onboarding@resend.dev>'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

interface NotifyPayload {
  recipients: string[]
  publicationId: string
  title: string
  category: string
  content: string | null
}

export async function sendPublicationNotification({
  recipients,
  publicationId,
  title,
  category,
  content,
}: NotifyPayload): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY não configurado — notificação ignorada')
    return
  }
  if (recipients.length === 0) return

  const link = `${SITE_URL}/publicacoes/${publicationId}`
  const summary = content
    ? content.length > 250
      ? content.slice(0, 250) + '…'
      : content
    : null

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.12)">
    <div style="background:#1e3a8a;padding:32px 40px">
      <p style="margin:0;color:#93c5fd;font-size:13px;font-weight:600;letter-spacing:.05em;text-transform:uppercase">Portal de Transparência</p>
      <p style="margin:4px 0 0;color:#bfdbfe;font-size:12px">Viver Bem JD Independência</p>
    </div>
    <div style="padding:32px 40px">
      <p style="margin:0 0 16px;color:#374151;font-size:15px">Nova publicação disponível no portal:</p>
      <h1 style="margin:0 0 12px;color:#111827;font-size:22px;line-height:1.3;font-weight:700">${title}</h1>
      <span style="display:inline-block;background:#dbeafe;color:#1e40af;border-radius:20px;padding:3px 12px;font-size:13px;font-weight:600">${category}</span>
      ${summary ? `<p style="margin:20px 0 0;color:#4b5563;font-size:15px;line-height:1.7">${summary}</p>` : ''}
      <div style="margin:28px 0 0">
        <a href="${link}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600">Ver publicação →</a>
      </div>
    </div>
    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px">
      <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6">
        Você recebe este e-mail porque é morador cadastrado no Portal de Transparência do Viver Bem JD Independência.<br>
        Para acessar o portal: <a href="${SITE_URL}" style="color:#3b82f6">${SITE_URL}</a>
      </p>
    </div>
  </div>
</body>
</html>`

  // Send in batches of 50 (Resend BCC limit)
  const resend = getResend()
  const BATCH = 50
  for (let i = 0; i < recipients.length; i += BATCH) {
    const bcc = recipients.slice(i, i + BATCH)
    await resend.emails.send({
      from: FROM_EMAIL,
      to: FROM_EMAIL,   // required; actual recipients via bcc
      bcc,
      subject: `Nova publicação: ${title}`,
      html,
    })
  }
}
