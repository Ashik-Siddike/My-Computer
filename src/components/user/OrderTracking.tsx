import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import type { Order } from '../../types';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  PhoneCall,
  RefreshCw,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Package,
  ShieldCheck,
  CreditCard,
  MapPin
} from 'lucide-react';

export const OrderTracking: React.FC = () => {
  const { orders, activeTrackingId, setActiveTrackingId, fetchLiveOrder, language } = useStore();
  const [searchInput, setSearchInput] = useState(activeTrackingId || (orders[0]?.id || ''));
  const [currentOrder, setCurrentOrder] = useState<Order | null>(orders[0] || null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  // Live order fetcher directly connecting to MongoDB and server routes
  const handleFetchLive = useCallback(async (query: string) => {
    if (!query || !query.trim()) return;
    setIsSearching(true);
    setErrorMessage(null);

    try {
      const live = await fetchLiveOrder(query.trim());
      if (live) {
        setCurrentOrder(live);
        setLastChecked(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        // Fallback to local stored orders
        const local = orders.find(
          o =>
            o.id.toUpperCase() === query.trim().toUpperCase() ||
            o.customerPhone === query.trim() ||
            o.orderId?.toUpperCase() === query.trim().toUpperCase()
        );
        if (local) {
          setCurrentOrder(local);
          setLastChecked(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        } else {
          setErrorMessage(
            language === 'EN'
              ? `No order found with reference "${query}". Please verify your Order ID or Phone number.`
              : `"${query}" দিয়ে কোনো অর্ডার পাওয়া যায়নি। অনুগ্রহ করে সঠিক অর্ডার আইডি বা মোবাইল নম্বর দিন।`
          );
        }
      }
    } catch {
      setErrorMessage(
        language === 'EN'
          ? 'Failed to retrieve live tracking data from server.'
          : 'সার্ভার থেকে ট্র্যাকিং তথ্য লোড করতে সমস্যা হয়েছে।'
      );
    } finally {
      setIsSearching(false);
    }
  }, [fetchLiveOrder, orders, language]);

  // Sync on mount or when activeTrackingId changes
  useEffect(() => {
    const target = activeTrackingId || searchInput || (orders[0]?.id || '');
    if (target) {
      setSearchInput(target);
      handleFetchLive(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrackingId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveTrackingId(searchInput.trim().toUpperCase());
      handleFetchLive(searchInput.trim());
    }
  };

  const handleCopyId = () => {
    if (!currentOrder) return;
    const idToCopy = currentOrder.orderId || currentOrder.id || '';
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Status-specific badges and colors
  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'Confirmed':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-600',
          bn: 'অর্ডার কনফার্মড (গৃহীত)',
        };
      case 'Processing':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-600',
          bn: 'প্রসেসিং ও প্যাকেজিং চলছে',
        };
      case 'Shipped':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          dot: 'bg-sky-600',
          bn: 'কুরিয়ারে হস্তান্তর (পথে রয়েছে)',
        };
      case 'Delivered':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-600',
          bn: 'সফলভাবে ডেলিভারি সম্পন্ন',
        };
      case 'Cancelled':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          dot: 'bg-red-600',
          bn: 'অর্ডার বাতিল করা হয়েছে',
        };
      default:
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500 animate-ping',
          bn: 'অপেক্ষমাণ (প্রতিনিধি কল ভেরিফিকেশন)',
        };
    }
  };

  const statusInfo = currentOrder ? getStatusBadge(currentOrder.orderStatus || 'Pending') : null;

  return (
    <div className="py-6 sm:py-10 space-y-8 animate-fadeIn max-w-4xl mx-auto px-4 sm:px-6">
      
      {/* Search Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white border border-slate-800 shadow-xl text-center space-y-4 relative overflow-hidden">
        <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30">
          <Truck className="w-7 h-7" />
        </div>
        
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {language === 'EN' ? 'Live Order Tracking' : 'লাইভ অর্ডার ট্র্যাকিং'}
          </h1>
          <p className="text-xs text-blue-200/80 max-w-md mx-auto">
            {language === 'EN'
              ? 'Enter your Order Reference ID (e.g. MC-ORD-10001) or 11-digit mobile number to track real-time dispatch status.'
              : 'অর্ডারের লাইভ অগ্রগতি জানতে আপনার অর্ডার আইডি (যেমন: MC-ORD-10001) বা ১১ ডিজিটের ফোন নম্বর দিন।'}
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-lg mx-auto pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Order ID (MC-ORD-...) or Phone (017...)"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/90 text-white placeholder-slate-400 border border-slate-700 text-xs font-bold focus:outline-hidden focus:border-orange-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{language === 'EN' ? 'Track Live' : 'ট্র্যাক করুন'}</span>
          </button>
        </form>

        {errorMessage && (
          <div className="max-w-md mx-auto p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Empty State when no order matches */}
      {!currentOrder && !isSearching && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-base text-slate-900">
              {language === 'EN' ? 'No Order Tracked Yet' : 'এখনো কোনো অর্ডার ট্র্যাক করা হয়নি'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {language === 'EN'
                ? 'Search above using your Order Reference ID or customer phone number to check live status.'
                : 'আপনার অর্ডার আইডি বা মোবাইল নম্বর দিয়ে উপরে সার্চ করে লাইভ স্ট্যাটাস দেখুন।'}
            </p>
          </div>
        </div>
      )}

      {/* Real-Time Order Status Card */}
      {currentOrder && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg space-y-6 animate-fadeIn">
          
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Order Reference:</span>
                <span className="font-mono font-black text-base text-slate-900">{currentOrder.id || currentOrder.orderId}</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  title="Copy ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="text-xs text-slate-500 mt-0.5 block">
                Placed on: {currentOrder.date || currentOrder.createdAt?.split('T')[0] || 'Recent'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] text-slate-400 font-semibold block">লাইভ স্ট্যাটাস</span>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${statusInfo?.bg}`}>
                  <span className={`w-2 h-2 rounded-full ${statusInfo?.dot}`}></span>
                  <span>{currentOrder.orderStatus} • {statusInfo?.bn}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleFetchLive(currentOrder.orderId || currentOrder.id || '')}
                disabled={isSearching}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors cursor-pointer border border-slate-200"
                title="রিয়েল-টাইম স্ট্যাটাস রিফ্রেশ করুন"
              >
                <RefreshCw className={`w-4 h-4 ${isSearching ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Last refreshed status badge */}
          {lastChecked && (
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>মঙ্গোডিবি এটলাস ও সার্ভার ডাটাবেসের সাথে রিয়েল-টাইমে সিঙ্কড</span>
              </span>
              <span className="font-mono text-slate-400">সর্বশেষ আপডেট: {lastChecked}</span>
            </div>
          )}

          {/* 1. REPRESENTATIVE CALL NOTICE (IF PENDING) */}
          {currentOrder.orderStatus === 'Pending' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <PhoneCall className="w-5 h-5 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-sm text-blue-950">
                  আমাদের কাস্টমার প্রতিনিধি শীঘ্রই আপনাকে কল করে অর্ডারটি কনফার্ম করবেন
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  আপনার ডেলিভারি ও পেমেন্ট যাচাইয়ের জন্য আমাদের একজন রিপ্রেজেন্টেটিভ এখনই এই নম্বরে কল দিচ্ছেন:
                </p>
                <span className="inline-block font-mono font-bold text-sm text-blue-900 bg-white px-3 py-1 rounded-lg border border-blue-200 mt-1">
                  {currentOrder.customerPhone}
                </span>
              </div>
            </div>
          )}

          {/* 2. CONFIRMED NOTICE (IF CONFIRMED BY ADMIN) */}
          {currentOrder.orderStatus === 'Confirmed' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-sm text-emerald-950">
                  অর্ডারটি কনফার্ম করা হয়েছে!
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  আমাদের রিপ্রেজেন্টেটিভ আপনার সাথে কথা বলে অর্ডারটি চূড়ান্তভাবে কনফার্ম করেছেন। পণ্যটি এখন সেন্ট্রাল ওয়্যারহাউসে কোয়ালিটি চেকিং ও প্যাকেজিংয়ের জন্য প্রস্তুত হচ্ছে।
                </p>
              </div>
            </div>
          )}

          {/* 3. CANCELLED NOTICE (IF CANCELLED BY ADMIN) */}
          {currentOrder.orderStatus === 'Cancelled' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-sm text-red-950">
                  অর্ডারটি বাতিল করা হয়েছে
                </h4>
                <p className="text-xs text-red-700 leading-relaxed">
                  অ্যাডমিন ড্যাশবোর্ড থেকে এই অর্ডারটি বাতিল করা হয়েছে। স্টক সীমাবদ্ধতা বা গ্রাহক অনুরোধের কারণে এটি হতে পারে। যেকোনো সহায়তার জন্য আমাদের হটলাইনে (16789) যোগাযোগ করুন।
                </p>
              </div>
            </div>
          )}

          {/* Interactive Steps Pipeline */}
          <div className="space-y-4 py-2">
            <h4 className="font-black text-xs text-slate-500 uppercase tracking-wider">
              অর্ডার প্রগ্রেস ও ট্র্যাকিং টাইমলাইন:
            </h4>

            <div className="relative pl-6 space-y-7 border-l-2 border-slate-200">
              {currentOrder.trackingSteps && currentOrder.trackingSteps.length > 0 ? (
                currentOrder.trackingSteps.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div
                      className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                        step.completed
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : step.current
                          ? 'bg-blue-600 text-white border-blue-400 animate-pulse'
                          : 'bg-slate-200 text-slate-400 border-slate-300'
                      }`}
                    >
                      {step.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3 h-3" />}
                    </div>

                    <div>
                      <h5 className={`font-bold text-xs sm:text-sm ${step.completed || step.current ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.title}
                      </h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">{step.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500">Pipeline initializing...</div>
              )}
            </div>
          </div>

          {/* Recipient and Payment Details */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>ডেলিভারি তথ্য</span>
              </span>
              <div className="font-bold text-slate-900 text-sm">{currentOrder.customerName}</div>
              <div className="font-mono text-slate-600">{currentOrder.customerPhone}</div>
              <div className="text-slate-600 leading-relaxed">
                {currentOrder.shippingAddress}{currentOrder.area ? `, ${currentOrder.area}` : ''}, {currentOrder.district}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                <span>পেমেন্ট ও মূল্য বিবরণী</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{currentOrder.paymentMethod}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-slate-200">
                  {currentOrder.paymentStatus || 'Pending'}
                </span>
              </div>
              {currentOrder.trxId && (
                <div className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 inline-block">
                  TrxID: <strong>{currentOrder.trxId}</strong>
                </div>
              )}
              {currentOrder.senderNumber && (
                <div className="text-[11px] font-mono text-slate-600">
                  Sender: {currentOrder.senderNumber}
                </div>
              )}
              <div className="font-black font-mono text-base text-slate-950 pt-1">
                সর্বমোট প্রদেয়: ৳{(currentOrder.total || currentOrder.grandTotal || 0).toLocaleString()}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
