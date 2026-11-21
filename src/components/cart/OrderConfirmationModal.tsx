import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Order } from '../../types';
import {
  CheckCircle2,
  PhoneCall,
  Truck,
  Printer,
  Copy,
  Check,
  X,
  ShieldCheck,
  ArrowRight,
  Clock
} from 'lucide-react';
import { BkashLogo, NagadLogo, RocketLogo, UpayLogo, CodLogo } from '../common/PaymentLogos';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onTrack: () => void;
  onPrint?: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  order,
  onTrack,
  onPrint,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const orderId = order.id || order.orderId;
  const isMFS = ['bKash', 'Nagad', 'Rocket', 'Upay'].includes(order.paymentMethod || '');

  const handleCopyOrderId = () => {
    if (!orderId) return;
    try {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Top Accent Strip */}
        <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 shrink-0" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm border border-emerald-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  অর্ডার সফলভাবে প্রাপ্ত • যাচাই চলছে
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {order.date || new Date().toISOString().split('T')[0]}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
                ধন্যবাদ! আপনার অর্ডারটি আমরা পেয়েছি
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {/* 1. REASSURING CALL & VERIFICATION NOTICE (EXACT USER REQUIREMENT) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 border border-blue-200/80 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md mt-0.5">
              <PhoneCall className="w-5 h-5 animate-bounce" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-black text-sm text-blue-950 flex items-center gap-1.5">
                <span>হ্যাঁ, আপনার অর্ডারটি আমরা পেয়েছি এবং যাচাই করে দেখছি!</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                আপনার দেওয়া {isMFS ? `পেমেন্ট ট্রানজেকশন আইডি (${order.trxId || 'TrxID'}) ও ` : ''}অর্ডারের তথ্য আমাদের সিস্টেম গ্রহণ করেছে। আমাদের কাস্টমার প্রতিনিধি এখনই আপনার নম্বরে কল দিয়ে অর্ডারটি কনফার্ম করবেন। অনুগ্রহ করে আপনার ফোনটি সক্রিয় রাখুন:
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-blue-200 shadow-2xs mt-1">
                <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-mono font-black text-sm text-blue-950">{order.customerPhone}</span>
                <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-600 animate-spin" />
                  <span>কল অপেক্ষমাণ</span>
                </span>
              </div>
            </div>
          </div>

          {/* 2. ORDER REFERENCE & KEY INFO BOX */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold">অর্ডার নম্বর (Order ID):</span>
                <span className="font-mono font-black text-sm text-blue-700 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {orderId}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyOrderId}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'কপি হয়েছে' : 'আইডি কপি'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">গ্রাহকের নাম:</span>
                <span className="font-bold text-slate-900">{order.customerName}</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">ডেলিভারি ঠিকানা:</span>
                <span className="font-bold text-slate-900">
                  {order.shippingAddress}{order.area ? `, ${order.area}` : ''}, {order.district}
                </span>
              </div>
            </div>
          </div>

          {/* 3. PAYMENT & MFS VERIFICATION DETAILS WITH REAL BRAND LOGOS */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2.5">
                {order.paymentMethod === 'bKash' && <BkashLogo className="w-6 h-6 shrink-0" />}
                {order.paymentMethod === 'Nagad' && <NagadLogo className="w-6 h-6 shrink-0" />}
                {order.paymentMethod === 'Rocket' && <RocketLogo className="w-6 h-6 shrink-0" />}
                {order.paymentMethod === 'Upay' && <UpayLogo className="w-6 h-6 shrink-0" />}
                {order.paymentMethod === 'Cash on Delivery' && <CodLogo className="w-6 h-6 shrink-0" />}
                <span className="font-black text-slate-900 text-xs">
                  পদ্ধতি: <span className="text-slate-800">{order.paymentMethod}</span>
                </span>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                order.paymentStatus === 'Paid'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {order.paymentStatus === 'Paid' ? 'Paid / পরিশোধিত' : 'Pending Verification (যাচাই চলছে)'}
              </span>
            </div>

            {isMFS && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-[11px]">
                {order.trxId && (
                  <div>
                    <span className="text-slate-500 font-sans block text-[10px]">Transaction ID (TrxID):</span>
                    <strong className="text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-md border border-pink-200/80 inline-block mt-0.5 text-xs">
                      {order.trxId}
                    </strong>
                  </div>
                )}
                {order.senderNumber && (
                  <div>
                    <span className="text-slate-500 font-sans block text-[10px]">টাকা পাঠানোর নম্বর:</span>
                    <strong className="text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200 inline-block mt-0.5">
                      {order.senderNumber}
                    </strong>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-bold text-slate-600">সর্বমোট প্রদেয় মূল্য (Total):</span>
              <span className="font-mono font-black text-base text-slate-950">
                ৳{(order.total || order.grandTotal || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* 4. WORKFLOW PIPELINE PROGRESSION */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
              অর্ডার প্রসেসিং টাইমলাইন (Next Steps):
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                <Check className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span>১. অর্ডার গ্রহণ</span>
                <span className="block text-[9px] font-normal text-emerald-600">সম্পন্ন ✓</span>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-bold animate-pulse">
                <Clock className="w-4 h-4 text-blue-600 mx-auto mb-1 animate-spin" />
                <span>২. পেমেন্ট যাচাই</span>
                <span className="block text-[9px] font-bold text-blue-600">যাচাই চলছে...</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600">
                <PhoneCall className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <span>৩. প্রতিনিধি কল</span>
                <span className="block text-[9px] text-slate-400">কনফার্মেশন</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600">
                <Truck className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <span>৪. কুরিয়ার ডেলিভারি</span>
                <span className="block text-[9px] text-slate-400">২৪-৪৮ ঘণ্টার মধ্যে</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>১০০% অফিসিয়াল ওয়ারেন্টি ও নিরাপদ হোম ডেলিভারি</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onPrint && (
              <button
                type="button"
                onClick={onPrint}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer flex-1 sm:flex-none"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট রসিদ</span>
              </button>
            )}

            <button
              type="button"
              onClick={onTrack}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer flex-1 sm:flex-none"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>লাইভ স্ট্যাটাস ট্র্যাক করুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
