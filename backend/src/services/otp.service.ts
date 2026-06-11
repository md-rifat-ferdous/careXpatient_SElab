const DEMO_OTP = '1234';
const OTP_EXPIRY_MS = 5 * 60 * 1000;

const store = new Map<string, { otp: string; expiresAt: number }>();

const DEMO_PHONE_PREFIXES = ['+8801700000000', '01700000001', '01711111111'];

function isDemoPhone(phone: string): boolean {
  return DEMO_PHONE_PREFIXES.some(p => phone.startsWith(p));
}

export class OtpService {
  static generateOtp(phone: string): string {
    if (isDemoPhone(phone)) {
      const entry = { otp: DEMO_OTP, expiresAt: Date.now() + OTP_EXPIRY_MS };
      store.set(phone, entry);
      return DEMO_OTP;
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    store.set(phone, { otp, expiresAt: Date.now() + OTP_EXPIRY_MS });
    return otp;
  }

  static verifyOtp(phone: string, otp: string): { valid: boolean; reason?: string } {
    const entry = store.get(phone);
    if (!entry) {
      return { valid: false, reason: 'No OTP requested for this phone number. Please request a new OTP.' };
    }
    if (Date.now() > entry.expiresAt) {
      store.delete(phone);
      return { valid: false, reason: 'OTP has expired. Please request a new one.' };
    }
    if (entry.otp !== otp) {
      return { valid: false, reason: 'Invalid OTP. Please try again.' };
    }
    store.delete(phone);
    return { valid: true };
  }
}
