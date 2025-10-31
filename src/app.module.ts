import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LodgeModule } from './lodge/lodge.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { AdministratorModule } from './administrator/administrator.module';
import { AppPaymentModule } from './app-payment/app-payment.module';
import { FacilitatorModule } from './facilitator/facilitator.module';
import { ExpenseModule } from './expense/expense.module';
import { LodgeBlockModule } from './lodge-block/lodge-block.module';
import { IncomeModule } from './income/income.module';
import { PeakHoursModule } from './peak-hour/peak-hour.module';
import { DefaultValueModule } from './default-value/default-value.module';
import { RoomsModule } from './room/room.module';
import { BookingModule } from './booking/booking.module';
import { CancelModule } from './cancel/cancel.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    LodgeModule,
    UserModule,
    AdminModule,
    AdministratorModule,
    AppPaymentModule,
    FacilitatorModule,
    ExpenseModule,
    LodgeBlockModule,
    IncomeModule,
    PeakHoursModule,
    DefaultValueModule,
    RoomsModule,
    BookingModule,
    CancelModule,
    BillingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
