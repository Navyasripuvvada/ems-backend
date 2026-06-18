import {Injectable} from '@nestjs/common';
import { info } from 'console';
import * as nodemailer from 'nodemailer';
@Injectable()
export class MailService{
    private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  async sendPasswordSetupEmail(
    email: string,
    fullName: string,
    token: string,
  ) {
    try {
    const setupLink = `http://localhost:3000/set-password?token=${token}`;

    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Set Your Password',
      html: `
        <h2>Welcome ${fullName}</h2>
        <p>Your employee account has been created.</p>
        <p>Click the link below to set your password:</p>
        <a href="${setupLink}">Set Password</a>
      `,
    });
    console.log('Mail sent:', info);
     } catch (error) {
    console.error('Mail Error:', error);
  }
  }
  async sendResetPasswordEmail(
  email: string,
  fullName: string,
  token: string,
) {
  try {
    const resetLink =
      `http://localhost:3000/reset-password?token=${token}`;

    const info = await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h2>Hello ${fullName}</h2>
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>

        <a href="${resetLink}">
          Reset Password
        </a>

        <p>This link expires in 1 hour.</p>
      `,
    });

    console.log('Mail sent:', info.messageId);
  } catch (error) {
    console.error('Mail Error:', error);
  }
}
}