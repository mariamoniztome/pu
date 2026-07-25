import nodemailer from 'nodemailer';

// Sends mail through SMTP when configured (SMTP_HOST & co. in the
// environment). Without configuration nothing is sent — the caller gets
// { sent: false } and can fall back to logging/exposing the link, which
// keeps invite and password-reset flows testable in development.

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export function isMailerConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST);
}

function buildTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

export async function sendMail(options: MailOptions): Promise<{ sent: boolean }> {
  if (!isMailerConfigured()) {
    console.log(`[mailer] SMTP not configured — would send to ${options.to}: ${options.subject}`);
    return { sent: false };
  }

  const transport = buildTransport();
  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
  return { sent: true };
}
