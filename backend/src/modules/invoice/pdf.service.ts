import { Injectable } from '@nestjs/common';
import { jsPDF } from 'jspdf';
import { Invoice } from './entities/invoice.entity';

@Injectable()
export class PdfService {
  generate(invoice: Invoice, clientName: string): string {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', margin, y);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`#${invoice.invoiceNumber}`, 210 - margin, y, { align: 'right' });

    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, 210 - margin, y);
    y += 10;

    // Dates
    const issueDate = new Date(invoice.issueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Issue Date:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(issueDate, margin + 28, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Due Date:', 210 - margin - 40, y);
    doc.setFont('helvetica', 'normal');
    doc.text(dueDate, 210 - margin, y, { align: 'right' });

    y += 10;

    // Bill to
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(clientName, margin + 20, y);

    y += 14;
    doc.line(margin, y, 210 - margin, y);
    y += 8;

    // Line items header
    doc.setFont('helvetica', 'bold');
    doc.text('Description', margin, y);
    doc.text('Qty', 120, y);
    doc.text('Unit Price', 145, y);
    doc.text('Total', 210 - margin, y, { align: 'right' });

    y += 6;
    doc.line(margin, y, 210 - margin, y);
    y += 8;

    // Line items
    doc.setFont('helvetica', 'normal');
    for (const item of invoice.lineItems) {
      doc.text(item.description, margin, y);
      doc.text(String(item.quantity), 120, y);
      doc.text(
        `${invoice.currency} ${Number(item.unitPrice).toFixed(2)}`,
        145,
        y,
      );
      doc.text(
        `${invoice.currency} ${Number(item.total).toFixed(2)}`,
        210 - margin,
        y,
        { align: 'right' },
      );
      y += 8;
    }

    y += 4;
    doc.line(margin, y, 210 - margin, y);
    y += 8;

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Total Due:', 145, y);
    doc.text(
      `${invoice.currency} ${Number(invoice.amount).toFixed(2)}`,
      210 - margin,
      y,
      { align: 'right' },
    );

    // Notes
    if (invoice.notes) {
      y += 16;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', margin, y);
      doc.setFont('helvetica', 'normal');
      y += 6;
      const lines = doc.splitTextToSize(invoice.notes, 170) as string[];
      doc.text(lines, margin, y);
    }

    return doc.output('datauristring').split(',')[1];
  }
}
