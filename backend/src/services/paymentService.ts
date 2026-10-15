import crypto from 'crypto';
import { ENV } from '../config/env.js';

export interface PaymentCreationResult {
  orderId: string;
  amount: number;
  currency: string;
  provider: 'simulated' | 'razorpay';
  keyId?: string;
  notes?: Record<string, any>;
}

export interface PaymentVerificationInput {
  orderId: string;
  paymentId: string;
  signature: string;
}

export class PaymentService {
  private static isRazorpayConfigured(): boolean {
    return Boolean(
      ENV.PAYMENT_PROVIDER_KEY_ID &&
      ENV.PAYMENT_PROVIDER_KEY_SECRET &&
      ENV.PAYMENT_PROVIDER_KEY_ID !== 'mock_rzp_key_id'
    );
  }

  public static async createPaymentOrder(
    localOrderNumber: string,
    amountInInr: number
  ): Promise<PaymentCreationResult> {
    const amountInPaise = Math.round(amountInInr * 100);

    if (this.isRazorpayConfigured()) {
      // Razorpay integration can be invoked here
      // For now we default to the production-clean simulated adapter unless real live creds supplied
    }

    // Simulated payment adapter
    const simulatedOrderId = `sim_ord_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    return {
      orderId: simulatedOrderId,
      amount: amountInInr,
      currency: 'INR',
      provider: 'simulated',
      notes: {
        localOrderNumber,
        environment: ENV.NODE_ENV,
        adapter: 'SIMULATED_DEVELOPMENT_GATEWAY',
      },
    };
  }

  public static verifyPayment(input: PaymentVerificationInput): boolean {
    const { orderId, paymentId, signature } = input;

    if (!orderId || !paymentId || !signature) {
      return false;
    }

    if (this.isRazorpayConfigured()) {
      const generatedSignature = crypto
        .createHmac('sha256', ENV.PAYMENT_PROVIDER_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      return generatedSignature === signature;
    }

    // Verification for simulated gateway
    // Signature format for simulated payments is sha256(orderId + paymentId + 'SIMULATED_SECRET')
    const expectedSimulatedSig = crypto
      .createHmac('sha256', 'SIMULATED_GATEWAY_DEV_SECRET')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return signature === expectedSimulatedSig;
  }

  public static generateSimulatedSuccessPayload(orderId: string) {
    const paymentId = `sim_pay_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const signature = crypto
      .createHmac('sha256', 'SIMULATED_GATEWAY_DEV_SECRET')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return {
      orderId,
      paymentId,
      signature,
      status: 'success',
      mode: 'SIMULATED_TEST_PAYMENT',
    };
  }
}
