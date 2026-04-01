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
