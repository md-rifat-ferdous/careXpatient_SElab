export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
}

export interface IPaymentProvider {
  createPayment(amount: number, currency: string, orderId: string): Promise<PaymentResponse>;
  verifyPayment(transactionId: string): Promise<boolean>;
  refundPayment(transactionId: string, amount: number): Promise<PaymentResponse>;
}

export class BkashProvider implements IPaymentProvider {
  async createPayment(amount: number, currency: string, orderId: string): Promise<PaymentResponse> {
    console.log(`[bKash] Creating payment for ${amount} ${currency} (Order: ${orderId})`);
    // Real implementation would call bKash API
    return { success: true, paymentUrl: 'https://bkash.example.com/pay/123', transactionId: 'BK-TRX-998' };
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    return true;
  }

  async refundPayment(transactionId: string, amount: number): Promise<PaymentResponse> {
    return { success: true };
  }
}

export class SSLCommerzProvider implements IPaymentProvider {
  async createPayment(amount: number, currency: string, orderId: string): Promise<PaymentResponse> {
    console.log(`[SSLCommerz] Creating payment for ${amount} ${currency} (Order: ${orderId})`);
    return { success: true, paymentUrl: 'https://ssl.example.com/pay/456', transactionId: 'SSL-TRX-112' };
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    return true;
  }

  async refundPayment(transactionId: string, amount: number): Promise<PaymentResponse> {
    return { success: true };
  }
}

export class PaymentFactory {
  static getProvider(provider: 'bkash' | 'sslcommerz'): IPaymentProvider {
    switch (provider) {
      case 'bkash': return new BkashProvider();
      case 'sslcommerz': return new SSLCommerzProvider();
      default: throw new Error('Unsupported payment provider');
    }
  }
}
