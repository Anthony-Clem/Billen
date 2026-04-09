import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend | null;
  private readonly from =
    process.env.RESEND_FROM ?? 'Billen <onboarding@billen.app>';

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  async sendInvoice(
    to: string,
    invoiceNumber: string,
    pdfBase64: string,
  ): Promise<void> {
    if (!this.resend) {
      Logger.warn(`RESEND_API_KEY not set. Invoice email not sent to ${to}.`);
      return;
    }

    await this.resend.emails.send({
      from: this.from,
      to,
      subject: `Invoice ${invoiceNumber}`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
          <h2 style="font-size: 22px; font-weight: 600; margin-bottom: 12px;">Invoice ${invoiceNumber}</h2>
          <p style="color: #555; line-height: 1.6;">
            Please find your invoice attached to this email.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `${invoiceNumber}.pdf`,
          content: pdfBase64,
        },
      ],
    });
  }

  async sendInvoiceReminder(
    to: string,
    invoiceNumber: string,
    dueDate: string,
    isFinal: boolean,
  ): Promise<void> {
    if (!this.resend) {
      Logger.warn(`RESEND_API_KEY not set. Reminder email not sent to ${to}.`);
      return;
    }

    const subject = isFinal
      ? `Final reminder: Invoice ${invoiceNumber} due today`
      : `Reminder: Invoice ${invoiceNumber} due on ${dueDate}`;

    await this.resend.emails.send({
      from: this.from,
      to,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
          <h2 style="font-size: 22px; font-weight: 600; margin-bottom: 12px;">${subject}</h2>
          <p style="color: #555; line-height: 1.6;">
            This is a ${isFinal ? 'final ' : ''}reminder that invoice <strong>${invoiceNumber}</strong> is due on <strong>${dueDate}</strong>.
            Please arrange payment at your earliest convenience.
          </p>
        </div>
      `,
    });
  }

  async sendOverdueNotice(
    to: string,
    invoiceNumber: string,
    dueDate: string,
  ): Promise<void> {
    if (!this.resend) {
      Logger.warn(
        `RESEND_API_KEY not set. Overdue notice not sent to ${to}.`,
      );
      return;
    }

    await this.resend.emails.send({
      from: this.from,
      to,
      subject: `Overdue: Invoice ${invoiceNumber}`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
          <h2 style="font-size: 22px; font-weight: 600; margin-bottom: 12px;">Invoice ${invoiceNumber} is overdue</h2>
          <p style="color: #555; line-height: 1.6;">
            Invoice <strong>${invoiceNumber}</strong> was due on <strong>${dueDate}</strong> and has not been paid.
            Please contact us to resolve this as soon as possible.
          </p>
        </div>
      `,
    });
  }

  async sendOnboardingInvite(to: string, onboardingUrl: string): Promise<void> {
    if (!this.resend) {
      Logger.warn(
        `RESEND_API_KEY not set. Onboarding email not sent to ${to}.`,
      );
      Logger.log(`Onboarding URL (dev): ${onboardingUrl}`);
      return;
    }

    await this.resend.emails.send({
      from: this.from,
      to,
      subject: "You've been invited to Billen",
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
          <h2 style="font-size: 22px; font-weight: 600; margin-bottom: 12px;">You've been invited</h2>
          <p style="color: #555; line-height: 1.6; margin-bottom: 24px;">
            You've been invited to complete your client profile on Billen. Click the button below to get started.
          </p>
          <a href="${onboardingUrl}"
             style="display: inline-block; background: #3b5bdb; color: #fff; padding: 12px 24px;
                    border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 15px;">
            Complete your profile
          </a>
          <p style="margin-top: 24px; font-size: 13px; color: #999;">
            This link expires in 48 hours. If you didn't expect this, you can ignore this email.
          </p>
        </div>
      `,
    });
  }
}
