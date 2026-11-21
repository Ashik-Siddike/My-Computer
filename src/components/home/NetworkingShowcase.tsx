import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS } from '../../data/mockData';
import { ProductCard } from '../shop/ProductCard';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useScrollReveal';
import { Wifi, ChevronRight } from 'lucide-react';

const SEGMENTS = ['All', 'Wi-Fi Routers', 'ONU & Fiber', 'Gigabit Switches'] as const;
type Segment = typeof SEGMENTS[number];

export const NetworkingShowcase: React.FC = () => {
  const { language, products, setCurrentView, setFilters } = useStore();
  const [segment, setSegment] = useState<Segment>('All');

  const productList = products && products.length > 0 ? products : PRODUCTS;
  const networkingProducts = productList.filter(
    p => p.isVisible !== false && (p.category === 'networking' || p.category === 'onu-device')
  );

  const displayedItems = networkingProducts.filter(item => {
    if (segment === 'All') return true;
    if (segment === 'Wi-Fi Routers') {
      return item.category === 'networking' && !item.name.toLowerCase().includes('switch') && !item.name.toLowerCase().includes('onu');
    }
    if (segment === 'ONU & Fiber') {
      return item.category === 'onu-device' || item.name.toLowerCase().includes('onu') || item.name.toLowerCase().includes('gpon') || item.name.toLowerCase().includes('epon');
    }
    if (segment === 'Gigabit Switches') {
      return item.name.toLowerCase().includes('switch') || item.name.toLowerCase().includes('poe');
    }
    return true;
  });

  const { ref: headerRef, inView: headerInView } = useScrollReveal<HTMLDivElement>();
  const { containerRef, inView } = useStaggerReveal<HTMLDivElement>(4);

  return (
    <section className="bg-gradient-to-br from-sky-50/70 via-white to-indigo-50/50 rounded-3xl p-5 md:p-6 border border-blue-200/80 relative overflow-hidden shadow-[0_4px_20px_rgba(37,99,235,0.05)]">
      {/* Title */}
      <div
        ref={headerRef}
        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 transition-all duration-700 ${
          headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-2xl bg-blue-600/10 text-blue-600"
            style={{ animation: headerInView ? 'iconSpinPop 0.6s 0.2s cubic-bezier(0.34,1.56,0.64,1) both' : 'none' }}
          >
            <Wifi className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`text-xl md:text-2xl font-black tracking-tight text-slate-950 animated-underline ${headerInView ? 'in-view' : ''}`}>
              {language === 'EN' ? 'High-Speed Networking & Wi-Fi 6' : 'হাই-স্পিড নেটওয়ার্কিং ও রাউটার'}
            </h2>
            <p className="text-xs text-slate-800 font-semibold mt-0.5">
              TP-Link, Cisco, MikroTik, V-SOL, Tenda &amp; C-Data Gigabit Solutions
            </p>
          </div>
        </div>

        {/* Filter Tabs & View All */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {SEGMENTS.map((seg, i) => (
            <button
              key={seg}
              onClick={() => setSegment(seg)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap hover:-translate-y-0.5 border ${
                segment === seg
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white text-slate-900 border-blue-200 hover:bg-blue-50 shadow-xs'
              }`}
              style={{ transitionDelay: `${i * 0.04}s` }}
            >
              {seg}
            </button>
          ))}

          <button
            onClick={() => {
              setFilters(prev => ({ ...prev, category: 'networking' }));
              setCurrentView('shop');
            }}
            className="text-xs font-bold text-blue-600 hover:text-orange-600 flex items-center gap-1 ml-2 transition-colors whitespace-nowrap"
          >
            <span>{language === 'EN' ? 'View All' : 'সবগুলো'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-7 gap-y-7"
        key={segment}
      >
        {displayedItems.slice(0, 4).map((item, idx) => (
          <div
            key={item.id}
            className={`stagger-item ${inView ? 'in-view' : ''}`}
            style={{ transitionDelay: `${idx * 0.08}s` }}
          >
            <ProductCard product={item} />
          </div>
        ))}
      </div>
    </section>
  );
};
