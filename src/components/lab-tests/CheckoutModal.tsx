"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore, CartItem } from '@/store/cartStore';

type PaymentMethod = 'cash' | 'bkash' | 'card';
type BkashStep = 'input' | 'otp' | 'verified';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Success Screen ────────────────────────────────────────────────────────────
function SuccessScreen({ orderId, name, total, onDone }: {
  orderId: string; name: string; total: number; onDone: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center shadow-inner">
          <span className="material-symbols-outlined text-5xl text-green-500"
            style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-green-300 animate-ping opacity-20" />
      </div>

      <h2 className="text-3xl font-black text-on-surface mb-2 tracking-tight">Booking Confirmed!</h2>
      <p className="text-subtle-gray mb-8 max-w-sm font-medium">
        Thank you, <span className="font-bold text-on-surface">{name}</span>! Your booking has been successfully placed. 
        Expect a confirmation call shortly.
      </p>

      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 mb-8 w-full max-w-xs shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-subtle-gray">Order ID</p>
            <p className="font-mono text-sm text-on-surface font-black">#{orderId.split('-')[0].toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-subtle-gray">Total Paid</p>
            <p className="text-xl font-black text-primary">৳{total.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-green-600 font-bold bg-green-50 py-2 px-3 rounded-xl justify-center">
          <span className="material-symbols-outlined text-[14px]">verified</span>
          Payment Verified
        </div>
      </div>

      <button
        onClick={onDone}
        className="px-10 py-4.5 bg-primary text-white rounded-2xl font-black text-lg hover:bg-teal-700 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 active:scale-95"
      >
        <span className="material-symbols-outlined">dashboard</span>
        Go to Dashboard
      </button>
    </div>
  );
}

// ─── Payment Accordion Item ────────────────────────────────────────────────────
function PaymentMethodItem({
  id, label, icon, selected, onSelect, children, helperText
}: { 
  id: PaymentMethod; label: string; icon: string; selected: boolean; 
  onSelect: () => void; children?: React.ReactNode; helperText?: string;
}) {
  return (
    <div className={`rounded-3xl border-2 transition-all duration-300 ${
      selected ? 'border-primary bg-primary/[0.02]' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
    }`}>
      <button
        type="button"
        onClick={onSelect}
        className="w-full flex items-center gap-4 p-5 text-left outline-none"
      >
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
          selected ? 'border-primary bg-primary' : 'border-slate-300'
        }`}>
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <span className={`font-black text-sm tracking-tight ${selected ? 'text-primary' : 'text-on-surface'}`}>{label}</span>
          </div>
          {helperText && <p className="text-[10px] font-bold text-subtle-gray mt-0.5 ml-9">{helperText}</p>}
        </div>
      </button>

      {/* Expandable Content */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        selected ? 'max-h-[400px] opacity-100 pb-6 px-6' : 'max-h-0 opacity-0'
      }`}>
        <div className="pt-2 pl-9">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Main CheckoutModal ────────────────────────────────────────────────────────
export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { 
    items, homeCollection, couponCode, discount,
    getSubtotal, getHomeCollectionFee, getVat, getTotal, 
    clearCart, applyCoupon, removeCoupon 
  } = useCartStore();
  
  const router = useRouter();

  // Form Basic State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('cash');
  
  // bKash State
  const [bkashStep, setBkashStep] = useState<BkashStep>('input');
  const [bkashNumber, setBkashNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [bkashLoading, setBkashLoading] = useState(false);

  // Card State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ orderId: string; name: string; total: number } | null>(null);

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Group items by lab
  const groupedItems = useMemo(() => {
    return items.reduce((acc, item) => {
      if (!acc[item.labName]) acc[item.labName] = [];
      acc[item.labName].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);
  }, [items]);

  // Sync bKash step with payment method
  useEffect(() => {
    if (payment !== 'bkash') {
      setBkashStep('input');
      setBkashNumber('');
      setOtp('');
    }
  }, [payment]);

  // Validation Handlers
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 11));
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 16));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
    setExpiry(val);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value.replace(/[^0-9]/g, '').slice(0, 3));
  };

  // bKash Actions
  const handleRequestOtp = () => {
    if (!/^01[0-9]{9}$/.test(bkashNumber)) return;
    setBkashLoading(true);
    setTimeout(() => {
      setBkashLoading(false);
      setBkashStep('otp');
    }, 1500);
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) return;
    setBkashLoading(true);
    setTimeout(() => {
      setBkashLoading(false);
      setBkashStep('verified');
    }, 1200);
  };

  // Overall Form Validation
  const isBkashValid = payment === 'bkash' && bkashStep === 'verified';
  const isCardValid = payment === 'card' && cardNumber.length === 16 && expiry.length === 5 && cvv.length === 3;
  const isPaymentValid = payment === 'cash' || isBkashValid || isCardValid;

  const isFormValid =
    name.trim().length > 0 &&
    /^01[0-9]{9}$/.test(phone) &&
    isPaymentValid &&
    (!homeCollection || address.trim().length > 0);

  const handleApplyCoupon = () => {
    if (!couponInput) return;
    const result = applyCoupon(couponInput);
    setCouponMsg({ text: result.message, isError: !result.success });
    if (result.success) setCouponInput('');
  };

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const totalFee = getHomeCollectionFee();
  const vat = getVat();
  const total = getTotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          address: address.trim() || undefined,
          items: items.map(i => ({ testId: i.testId, price: i.price, name: i.name, labName: i.labName })),
          subtotal,
          vat,
          discount,
          homeCollectionFee: totalFee,
          totalAmount: total,
          homeCollection,
          paymentMethod: payment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      clearCart();
      setSuccess({ orderId: data.orderId, name: name.trim(), total });

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    setSuccess(null);
    setName(''); setPhone(''); setEmail(''); setAddress('');
    setCardNumber(''); setExpiry(''); setCvv('');
    setPayment('cash'); setError('');
    onClose();
    router.push('/dashboard/reports');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={!loading ? onClose : undefined} />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-300">

        {/* ── Header ── */}
        {!success && (
          <div className="flex items-center justify-between px-10 py-7 border-b border-slate-100 shrink-0">
            <div>
              <h2 className="text-2xl font-black text-on-surface tracking-tight">Checkout</h2>
              <p className="text-xs text-subtle-gray font-black uppercase tracking-widest mt-1">Medical Lab Services</p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-all active:scale-90"
            >
              <span className="material-symbols-outlined text-2xl text-slate-400">close</span>
            </button>
          </div>
        )}

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">
          {success ? (
            <SuccessScreen {...success} onDone={handleDone} />
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row">

              {/* LEFT — Form */}
              <div className="flex-1 p-10 space-y-12">
                {/* Section: Patient Info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-2xl">account_circle</span>
                    </div>
                    <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.2em]">Patient Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-black text-subtle-gray uppercase tracking-widest mb-2.5 ml-1">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Abdullah Al Mamun"
                        className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.25rem] text-sm font-bold focus:border-primary/20 focus:bg-white transition-all outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-subtle-gray uppercase tracking-widest mb-2.5 ml-1">Phone (Primary)</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="01XXXXXXXXX"
                        className={`w-full px-6 py-4.5 border-2 rounded-[1.25rem] text-sm font-bold transition-all outline-none ${
                          phone.length > 0 && !/^01[0-9]{9}$/.test(phone) ? 'border-red-100 bg-red-50' : 'bg-slate-50 border-transparent'
                        }`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-subtle-gray uppercase tracking-widest mb-2.5 ml-1">Collection Address</label>
                      <input
                        type="text"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder={homeCollection ? "Full Pickup Address" : "Current Area"}
                        className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.25rem] text-sm font-bold outline-none"
                        required={homeCollection}
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Payment (ACCORDION) */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                      <span className="material-symbols-outlined text-2xl">shield_with_heart</span>
                    </div>
                    <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.2em]">Secure Payment</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* CASH */}
                    <PaymentMethodItem 
                      id="cash" label="Cash on Delivery" icon="💵" 
                      selected={payment === 'cash'} onSelect={() => setPayment('cash')}
                      helperText="Pay after your sample collection"
                    />

                    {/* BKASH */}
                    <PaymentMethodItem 
                      id="bkash" label="bKash Wallet" icon="💜" 
                      selected={payment === 'bkash'} onSelect={() => setPayment('bkash')}
                      helperText="Secure payment via bKash Gateway"
                    >
                      <div className="space-y-4 max-w-sm">
                        {bkashStep === 'input' && (
                          <div className="space-y-3">
                            <label className="text-[11px] font-black text-purple-600/70 uppercase">Enter bKash Number</label>
                            <div className="flex gap-2">
                              <input
                                type="tel"
                                value={bkashNumber}
                                onChange={(e) => setBkashNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
                                placeholder="01XXXXXXXXX"
                                className="flex-1 px-5 py-3.5 bg-white border-2 border-purple-100 rounded-2xl text-sm font-bold outline-none"
                              />
                              <button
                                type="button"
                                onClick={handleRequestOtp}
                                disabled={bkashLoading || !/^01[0-9]{9}$/.test(bkashNumber)}
                                className="px-6 bg-purple-600 text-white rounded-2xl text-xs font-black hover:bg-purple-700 transition-colors disabled:opacity-40"
                              >
                                {bkashLoading ? '...' : 'Request OTP'}
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {bkashStep === 'otp' && (
                          <div className="space-y-3 animate-in slide-in-from-right-2 duration-300">
                            <label className="text-[11px] font-black text-purple-600/70 uppercase">Verify 6-Digit OTP</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                placeholder="XXXXXX"
                                className="flex-1 px-5 py-3.5 bg-white border-2 border-purple-100 rounded-2xl text-sm font-bold outline-none tracking-[0.5em] text-center"
                              />
                              <button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={bkashLoading || otp.length !== 6}
                                className="px-6 bg-purple-600 text-white rounded-2xl text-xs font-black hover:bg-purple-700 transition-colors disabled:opacity-40"
                              >
                                {bkashLoading ? '...' : 'Verify'}
                              </button>
                            </div>
                          </div>
                        )}

                        {bkashStep === 'verified' && (
                          <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-100 rounded-2xl animate-in zoom-in-95 duration-300">
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                            <span className="text-sm font-black text-green-700">bKash Number Verified</span>
                          </div>
                        )}
                      </div>
                    </PaymentMethodItem>

                    {/* CARD */}
                    <PaymentMethodItem 
                      id="card" label="Card Payment" icon="💳" 
                      selected={payment === 'card'} onSelect={() => setPayment('card')}
                      helperText="Your payment is सुरक्षित and encrypted"
                    >
                      <div className="space-y-4 max-w-sm">
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-blue-600/70 uppercase">Card Information</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="Card Number (16 Digits)"
                            className="w-full px-5 py-3.5 bg-white border-2 border-blue-50 rounded-2xl text-sm font-bold outline-none"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={expiry}
                              onChange={handleExpiryChange}
                              placeholder="MM/YY"
                              className="w-full px-5 py-3.5 bg-white border-2 border-blue-50 rounded-2xl text-sm font-bold outline-none"
                            />
                            <input
                              type="text"
                              value={cvv}
                              onChange={handleCvvChange}
                              placeholder="CVV"
                              className="w-full px-5 py-3.5 bg-white border-2 border-blue-50 rounded-2xl text-sm font-bold outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </PaymentMethodItem>
                  </div>
                </div>
              </div>

              {/* RIGHT — Order Summary */}
              <div className="lg:w-[400px] shrink-0 bg-slate-50/70 p-10 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col">
                <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.2em] mb-10">Order Summary</h3>

                {/* Grouped Tests */}
                <div className="space-y-8 flex-1">
                  {Object.entries(groupedItems).map(([lab, tests]) => (
                    <div key={lab} className="space-y-3">
                      <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.15em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" /> {lab}
                      </h4>
                      <div className="space-y-3 pl-4">
                        {tests.map(test => (
                          <div key={test.id} className="flex justify-between items-start gap-4">
                            <p className="text-sm font-bold text-on-surface/70 leading-tight flex-1">{test.name}</p>
                            <p className="text-sm font-black text-on-surface">৳{test.price.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code FIX */}
                <div className="mt-12 mb-8 space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-subtle-gray uppercase tracking-widest mb-2.5 ml-1">Coupon Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black outline-none uppercase shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-6 bg-on-surface text-white rounded-2xl text-[10px] font-black hover:bg-black transition-all active:scale-95"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                  {couponMsg && (
                    <p className={`text-[10px] font-bold ml-1 animate-in fade-in slide-in-from-top-1 ${couponMsg.isError ? 'text-red-500' : 'text-green-600'}`}>
                      {couponMsg.text}
                    </p>
                  )}
                  {couponCode && (
                    <button onClick={removeCoupon} className="text-[10px] font-bold text-red-400 hover:underline flex items-center gap-1 ml-1">
                      <span className="material-symbols-outlined text-[14px]">close</span> Remove
                    </button>
                  )}
                </div>

                {/* Pricing */}
                <div className="space-y-3.5 pt-8 border-t-2 border-slate-200">
                  <div className="flex justify-between text-sm font-bold text-slate-500">
                    <span>Subtotal</span>
                    <span className="text-on-surface">৳{subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm font-black text-green-600">
                      <span>Discount</span>
                      <span>-৳{discount.toLocaleString()}</span>
                    </div>
                  )}
                  {homeCollection && (
                    <div className="flex justify-between text-sm font-bold text-slate-500">
                      <span>Collection Fee</span>
                      <span className="text-on-surface">৳{totalFee.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-slate-500">
                    <span>VAT (5%)</span>
                    <span className="text-on-surface">৳{vat.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-6 mt-2 border-t-2 border-slate-200 border-dashed">
                    <span className="text-xl font-black text-on-surface">Total</span>
                    <span className="text-3xl font-black text-primary">৳{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* ── Footer ── */}
        {!success && (
          <div className="shrink-0 px-10 py-6 border-t border-slate-100 bg-white flex items-center justify-between gap-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 text-slate-400 font-bold hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || loading}
              className="flex-1 max-w-sm py-5 bg-primary text-white rounded-[1.5rem] font-black text-lg hover:bg-teal-700 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none active:scale-95"
            >
              {loading ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : 'Confirm Booking'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
