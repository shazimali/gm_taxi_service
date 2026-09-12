import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';

export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
});

const fromAddress = process.env.SMTP_FROM || 'info@bostonluxurychauffeur.com';

export const EMAIL_FROM_WELCOME = `"GM Limo Services" <${fromAddress}>`;
export const EMAIL_FROM_DISPATCH = `"GM Limo Services Dispatch" <${fromAddress}>`;
export const EMAIL_FROM_BOT = `"GM Limo Reservation Bot" <${fromAddress}>`;
