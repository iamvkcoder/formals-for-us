import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Lock, CreditCard, Banknote, MapPin, Plus } from 'lucide-react';
import { useAuth } from '../app/AuthContext.js';
import { useCart } from '../app/CartContext.js';
import { useToast } from '../app/ToastContext.js';
import { api, formatINR } from '../services/api.js';
import { Address } from '../types/index.js';

export const CheckoutPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { cart, refreshCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState<boolean>(false);

  // New address form state
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: true,
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online_simulated'>('online_simulated');
  const [processing, setProcessing] = useState<boolean>(false);

  // Protect checkout route
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/checkout');
    }
  }, [user, authLoading, navigate]);

  // Load saved user addresses
  useEffect(() => {
    if (user) {
      api.get('/addresses').then((res) => {
        if (res.data.success) {
          setAddresses(res.data.data);
          const defaultAddr = res.data.data.find((a: Address) => a.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr._id);
          } else if (res.data.data.length > 0) {
            setSelectedAddressId(res.data.data[0]._id);
          } else {
            setShowNewAddressForm(true);
          }
        }
      });
    }
  }, [user]);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', newAddress);
      if (res.data.success) {
        showToast('Address saved', 'success');
        setAddresses((prev) => [res.data.data, ...prev]);
        setSelectedAddressId(res.data.data._id);
        setShowNewAddressForm(false);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Could not save address', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId && !showNewAddressForm) {
      showToast('Please select or provide a delivery address', 'error');
      return;
    }

    setProcessing(true);
    try {
      let orderPayload: any = {
        paymentMethod,
        couponCode: cart?.pricing?.couponCode,
      };

      if (selectedAddressId) {
        orderPayload.addressId = selectedAddressId;
      } else {
        orderPayload.shippingAddress = newAddress;
      }

      // Step 1: Create Order in database (atomically reserves inventory)
      const orderRes = await api.post('/orders', orderPayload);
      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Failed to initialize order');
      }

      const createdOrder = orderRes.data.data;

      // Step 2: Handle Payment
      if (paymentMethod === 'online_simulated') {
        // Complete payment via the development simulated gateway
        const payRes = await api.post('/payments/simulated-pay', {
          orderId: createdOrder._id,
        });

        if (payRes.data.success) {
          showToast('Payment verified successfully via Simulated Gateway', 'success');
          await refreshCart();
          navigate(`/order-success/${createdOrder.orderNumber}`);
          return;
        }
      } else {
        // Cash on Delivery
        showToast('Order confirmed via Cash on Delivery', 'success');
        await refreshCart();
        navigate(`/order-success/${createdOrder.orderNumber}`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Checkout failed';
      showToast(msg, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const pricing = cart?.pricing || { subtotal: 0, discount: 0, shippingFee: 0, tax: 0, total: 0 };
  const items = cart?.items || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-borderGrey pb-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-navy">Secure Checkout</h1>
          <p className="text-xs text-mutedGrey mt-1">
            Authoritative inventory allocation & encrypted transaction
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-champagne-dark font-medium">
          <Lock className="w-4 h-4 text-champagne" />
          <span>SSL 256-bit Encrypted</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Address & Payment Selection */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Delivery Address */}
          <section className="bg-white border border-borderGrey p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-borderGrey">
              <h2 className="font-serif text-lg font-semibold text-navy flex items-center gap-2">
                <MapPin className="w-5 h-5 text-champagne" /> Delivery Address
              </h2>
              {addresses.length > 0 && !showNewAddressForm && (
                <button
                  onClick={() => setShowNewAddressForm(true)}
                  className="text-xs font-semibold uppercase tracking-wider text-champagne-dark hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Address
                </button>
              )}
            </div>

            {/* Saved Address Cards */}
            {!showNewAddressForm && addresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`p-4 border cursor-pointer transition-all flex flex-col justify-between ${
                      selectedAddressId === addr._id
                        ? 'border-navy bg-ivory ring-1 ring-navy'
                        : 'border-borderGrey bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="addressSelection"
                        checked={selectedAddressId === addr._id}
                        onChange={() => setSelectedAddressId(addr._id!)}
                        className="mt-1 text-navy focus:ring-champagne"
                      />
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-navy">{addr.fullName}</span>
                          {addr.isDefault && (
                            <span className="text-[10px] bg-champagne/30 text-navy px-1.5 py-0.2 rounded font-semibold">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600">{addr.addressLine1}</p>
                        {addr.addressLine2 && <p className="text-gray-600">{addr.addressLine2}</p>}
                        <p className="text-gray-600">
                          {addr.city}, {addr.state} — {addr.postalCode}
                        </p>
                        <p className="text-gray-600">Phone: {addr.phone}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* New Address Form */}
            {showNewAddressForm && (
              <form onSubmit={handleCreateAddress} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-navy font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-navy font-semibold mb-1">Mobile (10 digits)</label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value.replace(/\D/g, '') })}
                      className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-navy font-semibold mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={newAddress.addressLine1}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                      className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
                      placeholder="House / Flat No., Building, Street Area"
                    />
                  </div>
                  <div>
                    <label className="block text-navy font-semibold mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-navy font-semibold mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      required
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-navy font-semibold mb-1">PIN Code (6 digits)</label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      maxLength={6}
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value.replace(/\D/g, '') })}
                      className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
                      placeholder="6-digit PIN code"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-navy text-white text-xs font-semibold uppercase tracking-wider hover:bg-navy-deep"
                  >
                    Save & Use This Address
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="px-6 py-2.5 border border-borderGrey text-navy text-xs font-semibold uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </section>

          {/* 2. Payment Method Selection */}
          <section className="bg-white border border-borderGrey p-6 space-y-4">
            <h2 className="font-serif text-lg font-semibold text-navy pb-3 border-b border-borderGrey flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-champagne" /> Payment Method
            </h2>

            <div className="space-y-3">
              {/* Online Payment Option */}
              <label
                className={`p-4 border cursor-pointer block transition-colors ${
                  paymentMethod === 'online_simulated'
                    ? 'border-navy bg-ivory ring-1 ring-navy'
                    : 'border-borderGrey bg-white hover:border-gray-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online_simulated"
                    checked={paymentMethod === 'online_simulated'}
                    onChange={() => setPaymentMethod('online_simulated')}
                    className="mt-1 text-navy focus:ring-champagne"
                  />
                  <div>
                    <span className="text-xs font-bold text-navy uppercase tracking-wider block">
                      Online Payment (UPI, Cards, NetBanking · Test Sandbox)
                    </span>
                    <p className="text-xs text-mutedGrey mt-1">
                      Includes simulated developer verification with HMAC signatures, instantaneous confirmation, and zero transaction fee.
                    </p>
                  </div>
                </div>
              </label>

              {/* Cash on Delivery Option */}
              <label
                className={`p-4 border cursor-pointer block transition-colors ${
                  paymentMethod === 'cod'
                    ? 'border-navy bg-ivory ring-1 ring-navy'
                    : 'border-borderGrey bg-white hover:border-gray-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 text-navy focus:ring-champagne"
                  />
                  <div>
                    <span className="text-xs font-bold text-navy uppercase tracking-wider block">
                      Cash on Delivery (Pay upon Doorstep Inspection)
                    </span>
                    <p className="text-xs text-mutedGrey mt-1">
                      Pay cash or UPI upon package handover by our verified delivery executive.
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Right Column: Order Review Snapshot & Final Confirmation */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-borderGrey p-6 space-y-6">
            <h3 className="font-serif text-lg font-semibold text-navy pb-3 border-b border-borderGrey">
              Order Summary ({items.length} Items)
            </h3>

            {/* Thumbnail items list */}
            <div className="divide-y divide-borderGrey max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item._id} className="py-2.5 flex items-center gap-3 text-xs">
                  <img
                    src={item.product?.images?.[0]}
                    alt={item.product?.name}
                    className="w-10 h-12 object-cover object-top border border-borderGrey shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy truncate">{item.product?.name}</p>
                    <p className="text-mutedGrey text-[11px]">
                      {item.size} · {item.color} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-navy">
                    {formatINR((item.product?.salePrice || item.product?.basePrice) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs pt-4 border-t border-borderGrey">
              <div className="flex justify-between text-mutedGrey">
                <span>Subtotal</span>
                <span className="text-navy font-medium">{formatINR(pricing.subtotal)}</span>
              </div>
              {pricing.discount > 0 && (
                <div className="flex justify-between text-successGreen font-medium">
                  <span>Privilege Discount</span>
                  <span>-{formatINR(pricing.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-mutedGrey">
                <span>Shipping</span>
                <span className="text-navy font-medium">
                  {pricing.shippingFee === 0 ? 'Complimentary' : formatINR(pricing.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-mutedGrey">
                <span>Estimated Apparel GST (12%)</span>
                <span className="text-navy font-medium">{formatINR(pricing.tax)}</span>
              </div>
              <div className="pt-3 border-t border-borderGrey flex justify-between items-baseline font-serif">
                <span className="text-base font-semibold text-navy">Total Amount</span>
                <span className="text-2xl font-bold text-navy">{formatINR(pricing.total)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={processing || items.length === 0}
              className="w-full py-4 bg-navy text-white text-xs font-semibold uppercase tracking-widest hover:bg-navy-deep transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Reserving Stock & Processing...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confirm Order · {formatINR(pricing.total)}</span>
                </>
              )}
            </button>

            <div className="text-[11px] text-mutedGrey text-center leading-relaxed">
              By placing your order, you agree to the FORMALS FOR US{' '}
              <Link to="/terms-conditions" className="underline hover:text-navy">Terms of Sale</Link>{' '}
              and{' '}
              <Link to="/returns-policy" className="underline hover:text-navy">Return Guarantee</Link>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
