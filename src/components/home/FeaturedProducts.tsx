import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS } from '../../data/mockData';
import { ProductCard } from '../shop/ProductCard';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useScrollReveal';
import {
  Sparkles,
  ChevronRight,
  Layers,
  Camera,
  Wifi,
  Gamepad2,
  HardDrive,
  Keyboard
} from 'lucide-react';

const TABS = [
  { id: 'all', label: { EN: 'All Featured', BN: 'সকল পণ্য' }, icon: Layers },
  { id: 'camera', label: { EN: 'Cameras & Security', BN: 'ক্যামেরা ও সিকিউরিটি' }, icon: Camera },
  { id: 'networking', label: { EN: 'Networking & Fiber', BN: 'নেটওয়ার্কিং' }, icon: Wifi },
  { id: 'gaming', label: { EN: 'Gaming Systems', BN: 'গেমিং গিয়ার' }, icon: Gamepad2 },
  { id: 'storage', label: { EN: 'Storage & SSDs', BN: 'স্টোরেজ' }, icon: HardDrive },
  { id: 'accessories', label: { EN: 'Workstation Peripherals', BN: 'এক্সেসরিজ' }, icon: Keyboard },
] as const;

type TabId = typeof TABS[number]['id'];

export const FeaturedProducts: React.FC = () => {
  const { setCurrentView, setFilters, language, products } = useStore();
  const [activeTab, setActiveTab] = useState<TabId>('all');

  const productList = products && products.length > 0 ? products : PRODUCTS;
  const filtered = productList.filter(p => {
    if (p.isVisible === false) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'camera') return p.category === 'camera';
    if (activeTab === 'networking') return p.category === 'networking' || p.category === 'onu-device';
    if (activeTab === 'gaming') return p.isGaming || p.category === 'gaming';
    if (activeTab === 'storage') return p.category === 'storage';
    if (activeTab === 'accessories') return p.category === 'accessories' || p.category === 'keyboard-mouse' || p.category === 'headphone-audio';
    return p.category === activeTab;
  });

  const { ref: headerRef, inView: headerInView } = useScrollReveal<HTMLDivElement>();
  const { containerRef, inView: gridInView } = useStaggerReveal<HTMLDivElement>(8);

  const handleTabClick = (tabId: TabId) => {
    setActiveTab(tabId);
  };

  const handleViewCategory = () => {
    if (activeTab === 'all') {
      setFilters(prev => ({ ...prev, category: null }));
    } else {
      setFilters(prev => ({ ...prev, category: activeTab }));
    }
    setCurrentView('shop');
  };

  return (
    <section className="bg-white rounded-3xl p-5 sm:p-7 md:p-8 border border-slate-200/90 shadow-xs">
      {/* Header & Tabs */}
      <div
        ref={headerRef}
        className={`flex flex-col gap-4 mb-6 transition-all duration-700 ${
          headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-slate-950">
                {language === 'EN' ? 'Featured Technology Collection' : 'বিশেষ প্রযুক্তি সংগ্রহ'}
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Official BD distributor stock with full manufacturer warranty
              </p>
            </div>
          </div>

          <button
            onClick={handleViewCategory}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>{language === 'EN' ? 'Explore Category' : 'ক্যাটাগরি দেখুন'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                <span>{tab.label[language]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div
        ref={containerRef}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
      >
        {filtered.slice(0, 8).map(product => (
          <div
            key={product.id}
            className={`stagger-item ${gridInView ? 'in-view' : ''}`}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};
