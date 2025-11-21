export class BillingDto {
  lodge_id: number;
  user_id: string;
  booking_id: number;
  reason: any;
  total: number;
  balancePayment: number; // Ex: 100 or -50 or 0
}
