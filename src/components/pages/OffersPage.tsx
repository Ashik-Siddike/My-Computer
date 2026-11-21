import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CreditCard, ShieldCheck, Truck, Building2, CheckCircle2, ChevronRight, PhoneCall, Headphones } from 'lucide-react';

export const OffersPage: React.FC = () => {
  const { language, setCurrentView } = useStore();

  const partnerBanks = [
    { name: 'City Bank (Amex)', tenures: '3, 6, 9, 12, 18, 24 Months', feature: '0% Interest EMI', logo: 'AMEX' },
    { name: 'BRAC Bank', tenures: '3, 6, 9, 12, 18 Months', feature: '0% Interest EMI', logo: 'BRAC' },
    { name: 'Eastern Bank (EBL)', tenures: '3, 6, 12 Months', feature: '0% Interest EMI', logo: 'EBL' },
    { name: 'Standard Chartered', tenures: '3, 6, 12 Months', feature: '0% Interest EMI', logo: 'SCB' },
    { name: 'Dutch-Bangla Bank (DBBL)', tenures: '3, 6, 12 Months', feature: '0% Interest EMI', logo: 'DBBL' },
    { name: 'Mutual Trust Bank (MTB)', tenures: '3, 6, 12 Months', feature: '0% Interest EMI', logo: 'MTB' },
    { name: 'Prime Bank', tenures: '3, 6, 12 Months', feature: '0% Interest EMI', logo: 'PRIME' },
    { name: 'Southeast Bank', tenures: '3, 6, 12 Months', feature: '0% Interest EMI', logo: 'SEB' },
  ];

  return (
    <div className="py-6 sm:py-10 space-y-10 animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
            <CreditCard className="w-3.5 h-3.5" />
            <span>{language === 'EN' ? 'Banking & Customer Privileges' : 'ব্যাংকিং ও গ্রাহক সুবিধা'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            {language === 'EN' ? '0% EMI & Customer Facilities' : '০% ইএমআই ও গ্রাহক সুবিধাসমূহ'}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            {language === 'EN'
              ? 'Enjoy seamless 0% interest EMI on credit cards from 18+ leading Bangladeshi banks, guaranteed authentic official distributor warranty, and prioritized nationwide logistics.'
              : '১৮+ শীর্ষ বাংলাদেশি ব্যাংকের ক্রেডিট কার্ডে ০% সুদে সহজ ইএমআই সুবিধা, ১০০% অফিসিয়াল ডিস্ট্রিবিউটর ওয়ারেন্টি এবং দ্রুততম ডেলিভারি উপভোগ করুন।'}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center flex-shrink-0 z-10">
          <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center mx-auto mb-2 font-black text-xl">
            0%
          </div>
          <span className="text-xs font-bold text-slate-300 block">Flexible Tenure</span>
          <span className="text-base font-extrabold text-white">Up to 24 Months</span>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* 0% EMI Banking Partners */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <span>{language === 'EN' ? '0% EMI Partner Banks' : '০% ইএমআই পার্টনার ব্যাংকসমূহ'}</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Available for eligible purchases above ৳10,000 using Visa, Mastercard &amp; Amex credit cards
            </p>
          </div>

          <button
            onClick={() => setCurrentView('shop')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>{language === 'EN' ? 'Shop EMI Eligible Tech' : 'ইএমআই পণ্য দেখুন'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {partnerBanks.map((bank, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-[11px] font-mono">
                  {bank.logo}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {bank.feature}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-slate-900">{bank.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tenures: {bank.tenures}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Instant In-Store &amp; Online Activation</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Core Privileges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">Official Brand Warranty</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every product is sourced directly from authorized Bangladeshi distributors. Full official repair, replacement, and RMA support across Bangladesh.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">Nationwide Insured Delivery</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Rapid 24-hour fulfillment across Dhaka city and 48-hour secure courier delivery across all 64 districts with full transit damage protection.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">Corporate &amp; IT Procurement</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Specialized B2B volume pricing, official VAT/TAX invoices, server configuration, network architecture, and dedicated institutional account managers.
          </p>
        </div>
      </div>

      {/* Corporate Contact CTA */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
              Need Assistance with EMI or Corporate Procurement?
            </h4>
            <p className="text-xs text-slate-600">
              Speak directly with our dedicated technical consultants: 10:00 AM - 8:00 PM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setCurrentView('contact')}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Contact Support</span>
          </button>
        </div>
      </div>
    </div>
  );
};
