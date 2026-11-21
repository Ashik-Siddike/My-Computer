import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  SpatialCardCarousel,
  createDefaultHardwareItems,
  renderHardwareCard,
  type SpatialCardItem,
} from '../ui/spatial-card-carousel';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Tv2,
  HardDrive,
  Fan,
  Box,
  Monitor,
  CheckCircle2,
  ArrowRight,
  Star,
  Flame,
  Truck
} from 'lucide-react';

export const HeroSlider: React.FC = () => {
  const { setCurrentView, setFilters, language, getCardsBySection } = useStore();

  const hardwareItems = useMemo(() => {
    const heroCards = getCardsBySection('homepage-hero');
    if (heroCards && heroCards.length > 0) {
      return heroCards.map((c) => ({
        id: c.id,
        title: c.title,
        subtitle: c.subtitle || c.name,
        badge: c.badge || 'PRO COMPONENT',
        specs: c.description || 'Verified Stock',
        tagline: c.tagline || 'অফিসিয়াল ৩ বছর ওয়ারেন্টি',
        category: c.targetEntityId || 'components',
        image: c.image,
        accentColor: c.accentColor || '#2563eb',
        renderContent: () =>
          renderHardwareCard({
            id: c.id,
            title: c.title,
            subtitle: c.subtitle || c.name,
            badge: c.badge || 'PRO COMPONENT',
            specs: c.description || 'Verified Stock',
            tagline: c.tagline || 'অফিসিয়াল ৩ বছর ওয়ারেন্টি',
            category: c.targetEntityId || 'components',
            image: c.image,
            accentColor: c.accentColor || '#2563eb',
          }),
      }));
    }
    return createDefaultHardwareItems();
  }, [getCardsBySection]);

  const [activeItem, setActiveItem] = useState<SpatialCardItem>(hardwareItems[0]);

  const handleCardClick = (item: SpatialCardItem) => {
    if (item.id === 'component-cpu' || item.id === 'component-gpu' || item.id === 'component-mobo') {
      setFilters(prev => ({ ...prev, category: 'components' }));
      setCurrentView('shop');
    } else if (item.category === 'monitors') {
      setFilters(prev => ({ ...prev, category: 'monitors' }));
      setCurrentView('shop');
    } else if (item.category === 'storage') {
      setFilters(prev => ({ ...prev, category: 'storage' }));
      setCurrentView('shop');
    } else if (item.category === 'gaming') {
      setFilters(prev => ({ ...prev, category: 'gaming' }));
      setCurrentView('shop');
    } else {
      setFilters(prev => ({ ...prev, category: 'components' }));
      setCurrentView('shop');
    }
  };

  const handleLaunchBuilder = () => {
    setCurrentView('pc-builder');
  };

  const handleBrowseCatalog = () => {
    setFilters(prev => ({ ...prev, category: '' }));
    setCurrentView('shop');
  };

  const quickCategories = [
    { label: language === 'EN' ? 'Processors' : 'প্রসেসর', cat: 'components', icon: Cpu },
    { label: language === 'EN' ? 'Graphics Cards' : 'গ্রাফিক্স কার্ড', cat: 'components', icon: Tv2 },
    { label: language === 'EN' ? 'RAM & Memory' : 'র‍্যাম মেমোরি', cat: 'components', icon: Sparkles },
    { label: language === 'EN' ? 'SSD & Storage' : 'এসএসডি স্টোরেজ', cat: 'storage', icon: HardDrive },
    { label: language === 'EN' ? 'Cooling Systems' : 'লিকুইড কুলার', cat: 'components', icon: Fan },
    { label: language === 'EN' ? 'Casings' : 'গেমিং কেসিং', cat: 'components', icon: Box },
    { label: language === 'EN' ? 'Monitors' : 'মনিটর', cat: 'monitors', icon: Monitor },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-sky-50/40 to-blue-50/50 border border-blue-200/80 shadow-[0_20px_50px_-15px_rgba(37,99,235,0.08)] text-slate-900 transition-colors duration-500">
      {/* Light Mode subtle ambient glowing halos */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(37,99,235,0.5) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Main Hero Container */}
      <div className="relative z-10 px-4 sm:px-8 lg:px-12 pt-8 sm:pt-10 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">

          {/* Left Column: Brand Story & Conversion Engine */}
          <div className="lg:col-span-5 space-y-5 lg:space-y-6 text-left">
            
            {/* Top Announcement Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-blue-200 shadow-xs backdrop-blur-md">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-700">
                {language === 'EN' ? 'PREMIER CUSTOM PC PLATFORM' : 'বাংলাদেশের সেরা কাস্টম পিসি ও হার্ডওয়্যার প্ল্যাটফর্ম'}
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.08] text-slate-950">
                <span>{language === 'EN' ? 'BUILD YOUR' : 'তৈরি করুন আপনার'}</span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                  {language === 'EN' ? 'DREAM COMPUTER' : 'স্বপ্নের গেমিং পিসি'}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed font-normal">
                {language === 'EN'
                  ? 'Genuine 14th Gen Intel & AMD Ryzen CPUs, RTX 40-Series GPUs, DDR5 RAM, and High-Speed PCIe 5.0 Storage. Built by passionate engineers with 100% official Bangladesh distributor warranty.'
                  : 'অরিজিনাল ইনটেল ও রাইজেন প্রসেসর, আরটিএক্স ৪০-সিরিজ গ্রাফিক্স কার্ড, ডিডিআর৫ র‍্যাম ও হাই-স্পিড এসএসডি দিয়ে আপনার পিসি সাজান শতভাগ অফিসিয়াল ওয়ারেন্টির নিশ্চয়তায়।'}
              </p>
            </div>

            {/* Live Active Component Spotlight Badge */}
            {activeItem && (
              <div className="p-3.5 rounded-2xl bg-white/95 border border-blue-200 shadow-md backdrop-blur-md flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {language === 'EN' ? 'Active Spotlight' : 'বর্তমানে প্রদর্শিত'}
                    </span>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-950">
                      {activeItem.title}
                    </h4>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCardClick(activeItem)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-1 cursor-pointer"
                >
                  <span>{language === 'EN' ? 'Explore' : 'দেখুন'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-800">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 border border-slate-200 shadow-xs hover:border-blue-300 transition-colors">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-[11px]">{language === 'EN' ? '100% Official BD Warranty' : '১০০% অফিসিয়াল ওয়ারেন্টি'}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 border border-slate-200 shadow-xs hover:border-blue-300 transition-colors">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px]">{language === 'EN' ? 'Fast 64-District Delivery' : 'সারাদেশে দ্রুত হোম ডেলিভারি'}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 border border-slate-200 shadow-xs hover:border-blue-300 transition-colors">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-[11px]">{language === 'EN' ? 'Free Stress-Testing' : 'ফ্রি অ্যাসেম্বলি ও টেস্ট'}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 border border-slate-200 shadow-xs hover:border-blue-300 transition-colors">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-[11px]">{language === 'EN' ? '0% EMI Facility' : 'সহজ ইএমআই সুবিধা'}</span>
              </div>
            </div>

            {/* High-Converting Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleLaunchBuilder}
                className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
              >
                <Cpu className="w-4 h-4 text-cyan-200" />
                <span>{language === 'EN' ? 'Start PC Builder' : 'পিসি বিল্ডার শুরু করুন'}</span>
              </button>

              <button
                type="button"
                onClick={handleBrowseCatalog}
                className="flex-1 sm:flex-initial px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 font-bold text-xs sm:text-sm border border-slate-300 shadow-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{language === 'EN' ? 'Browse All Parts' : 'সব কম্পোনেন্ট দেখুন'}</span>
              </button>
            </div>

            {/* Customer Rating Metric */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs text-slate-600 font-medium">
                <strong className="text-slate-950 font-bold">4.9 / 5.0</strong> ({language === 'EN' ? 'Over 12,400+ Verified Buyers across Bangladesh' : '১২,৪০০+ ভেরিফাইড গ্রাহক'})
              </span>
            </div>

          </div>

          {/* Right Column: 3D Orbital Spatial Card Carousel Centerpiece */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[460px] sm:min-h-[540px] md:min-h-[600px] lg:min-h-[640px]">
            <SpatialCardCarousel
              items={hardwareItems}
              theme="light"
              autoPlay={true}
              interval={2800}
              pauseOnHover={true}
              onActiveChange={(_, item) => setActiveItem(item)}
              onCardClick={handleCardClick}
              ariaLabel="3D Spatial PC Hardware Showcase"
              className="w-full"
            />
          </div>

        </div>

        {/* Bottom Category Quick-Launcher Bar */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between gap-4 mb-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'EN' ? 'Browse by Component Type' : 'কম্পোনেন্ট ক্যাটাগরি অনুযায়ী ব্রাউজ করুন'}</span>
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline-block">
              {language === 'EN' ? 'Click to view real-time catalog prices & stock' : 'লাইভ স্টক ও প্রাইজ দেখতে ক্লিক করুন'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {quickCategories.map((qc, idx) => {
              const IconComp = qc.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setFilters(prev => ({ ...prev, category: qc.cat }));
                    setCurrentView('shop');
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-400/50 text-slate-700 hover:text-blue-700 transition-all duration-200 cursor-pointer group text-left shadow-xs"
                >
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold truncate">{qc.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSlider;
