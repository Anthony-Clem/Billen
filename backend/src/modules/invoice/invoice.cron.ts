import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InvoiceService } from './invoice.service';
import { EmailService } from '@/common/email/email.service';
import { ClientService } from '../clients/client.service';

@Injectable()
export class InvoiceCron {
  private readonly logger = new Logger(InvoiceCron.name);

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly emailService: EmailService,
    private readonly clientService: ClientService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyInvoiceCheck(): Promise<void> {
    this.logger.log('Running daily invoice status check');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    const sentInvoices = await this.invoiceService.findSentInvoices();

    for (const invoice of sentInvoices) {
      const due = new Date(invoice.dueDate);
      due.setHours(0, 0, 0, 0);

      const dueDateStr = due.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      try {
        const client = await this.clientService.findOne(
          invoice.clientId,
          invoice.userId,
        );

        if (due < today) {
          // Past due — mark overdue and send notice
          await this.invoiceService.markOverdue(invoice);
          await this.emailService.sendOverdueNotice(
            client.email,
            invoice.invoiceNumber,
            dueDateStr,
          );
        } else if (due.getTime() === today.getTime()) {
          // Due today — final reminder
          await this.emailService.sendInvoiceReminder(
            client.email,
            invoice.invoiceNumber,
            dueDateStr,
            true,
          );
        } else if (due.getTime() === threeDaysFromNow.getTime()) {
          // 3 days out — early reminder
          await this.emailService.sendInvoiceReminder(
            client.email,
            invoice.invoiceNumber,
            dueDateStr,
            false,
          );
        }
      } catch (err) {
        this.logger.error(
          `Failed to process invoice ${invoice.id}: ${String(err)}`,
        );
      }
    }
  }
}
