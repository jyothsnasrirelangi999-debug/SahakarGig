import { PaymentCalculation } from '../types';

/**
 * Dynamically calculates the payment breakdown.
 * Separated for clean testing and future backend synchronization.
 */
export function calculatePaymentBreakdown(
  serviceAmount: number,
  gstRate: number = 0.18,
  adminFee: number = 50
): PaymentCalculation {
  const safeServiceAmount = Math.max(0, Number(serviceAmount) || 0);
  const gstRatePercent = Math.round(gstRate * 100);
  const gstAmount = Math.round(safeServiceAmount * gstRate);
  const adminCharge = Math.max(0, Number(adminFee) || 0);
  const grandTotal = safeServiceAmount + gstAmount + adminCharge;
  const amountPayableToWorker = safeServiceAmount + gstAmount;

  return {
    serviceAmount: safeServiceAmount,
    gstRatePercent,
    gstAmount,
    adminCharge,
    grandTotal,
    amountPayableToWorker,
  };
}

export function formatInr(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export interface UpiIntentParams {
  pa: string; // Payee Address (UPI ID)
  pn: string; // Payee Name
  am: number; // Amount
  cu?: string; // Currency
  tn: string; // Transaction note
  tr?: string; // Transaction reference ID
}

/**
 * Builds standard UPI URL compatible with NPCI specifications.
 */
export function buildStandardUpiUrl(params: UpiIntentParams): string {
  const query = new URLSearchParams({
    pa: params.pa,
    pn: params.pn,
    am: params.am.toFixed(2),
    cu: params.cu || 'INR',
    tn: params.tn,
    tr: params.tr || `SG_${Date.now()}`,
  });
  return `upi://pay?${query.toString()}`;
}

/**
 * App-specific deep link URL schemas.
 */
export function buildAppSpecificUpiUrl(
  app: 'phonepe' | 'gpay' | 'paytm' | 'bhim',
  params: UpiIntentParams
): { primaryUrl: string; fallbackUrl: string } {
  const standardUrl = buildStandardUpiUrl(params);
  const rawQuery = standardUrl.replace('upi://pay?', '');

  switch (app) {
    case 'phonepe':
      return {
        primaryUrl: `phonepe://pay?${rawQuery}`,
        fallbackUrl: standardUrl,
      };
    case 'gpay':
      return {
        primaryUrl: `tez://upi/pay?${rawQuery}`,
        fallbackUrl: standardUrl,
      };
    case 'paytm':
      return {
        primaryUrl: `paytmmp://pay?${rawQuery}`,
        fallbackUrl: standardUrl,
      };
    case 'bhim':
      return {
        primaryUrl: `bhim://pay?${rawQuery}`,
        fallbackUrl: standardUrl,
      };
    default:
      return {
        primaryUrl: standardUrl,
        fallbackUrl: standardUrl,
      };
  }
}
