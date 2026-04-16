import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
<<<<<<< HEAD
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
=======
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { Invoice } from './entities/invoice.entity';
import { SessionGuard } from '@/common/guards/auth.guard';
import { ClientModule } from '../clients/client.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice]), ClientModule, UserModule],
  controllers: [InvoiceController],
  providers: [InvoiceService, SessionGuard],
>>>>>>> 0731a02 (fix(invoices): resolve module wiring and SQLite column type errors)
})
export class InvoiceModule {}
