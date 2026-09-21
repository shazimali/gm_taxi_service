import nodemailer from 'nodemailer';

// ── Contact-us mailbox (SMTP_*) — used for inbound "Contact Us" inquiries ──
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpSecure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : smtpPort === 465;
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASSWORD || '';

export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
});

const fromAddress = process.env.SMTP_FROM || 'info@gmlimoservices.com';

export const EMAIL_FROM_CONTACT = `"GM Limo Services" <${fromAddress}>`;
export const EMAIL_FROM_WELCOME = `"GM Limo Services" <${fromAddress}>`;
export const EMAIL_FROM_SECURITY = `"GM Limo Services" <${fromAddress}>`;

// ── No-reply mailbox (NO_REPLY_SMTP_*) — used for ride booking, completion
// and cancellation notifications and other automated/transactional emails ──
const noReplyHost = process.env.NO_REPLY_SMTP_HOST || smtpHost;
const noReplyPort = Number(process.env.NO_REPLY_SMTP_PORT) || smtpPort;
const noReplySecure = process.env.NO_REPLY_SMTP_SECURE ? process.env.NO_REPLY_SMTP_SECURE === 'true' : noReplyPort === 465;
const noReplyUser = process.env.NO_REPLY_SMTP_USER || '';
const noReplyPass = process.env.NO_REPLY_SMTP_PASSWORD || '';

export const noReplyTransporter = nodemailer.createTransport({
  host: noReplyHost,
  port: noReplyPort,
  secure: noReplySecure,
  auth: noReplyUser && noReplyPass ? { user: noReplyUser, pass: noReplyPass } : undefined,
});

const noReplyFromAddress = process.env.NO_REPLY_SMTP_FROM || fromAddress;

export const EMAIL_FROM_DISPATCH = `"GM Limo Services Dispatch" <${noReplyFromAddress}>`;
export const EMAIL_FROM_BOT = `"GM Limo Reservation Bot" <${noReplyFromAddress}>`;
