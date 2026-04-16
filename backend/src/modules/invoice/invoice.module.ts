import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { InvoiceCron } from './invoice.cron';
import { PdfService } from './pdf.service';
import { Invoice } from './entities/invoice.entity';
import { SessionGuard } from '@/common/guards/auth.guard';
import { UserModule } from '../user/user.module';
import { ClientModule } from '../clients/client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice]),
    ScheduleModule.forRoot(),
    UserModule,
    ClientModule,
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService, PdfService, InvoiceCron, SessionGuard],
})
export class InvoiceModule {}
