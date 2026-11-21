import React from 'react';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS } from '../../data/mockData';
import { ProductCard } from '../shop/ProductCard';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useScrollReveal';
import { TrendingUp, ArrowRight, ShieldCheck } from 'lucide-react';

export const BestSellers: React.FC = () => {
  const { setCurrentView, setFilters, language, products } = useStore();

  const productList = products && products.length > 0 ? products : PRODUCTS;
  // Curate top best selling products from database
  const bestSellingProducts = productList
    .filter(p => p.isVisible !== false && (p.badge === 'Best Seller' || p.badge === 'Hot' || p.isFeatured || p.rating >= 4.8))
    .slice(0, 4);

  const { ref: headerRef, inView: headerInView } = useScrollReveal<HTMLDivElement>();
  const { containerRef, inView: cardsInView } = useStaggerReveal<HTMLDivElement>(4);

  const handleExploreAll = () => {
    setFilters(prev => ({ ...prev, sortBy: 'rating' }));
    setCurrentView('shop');
  };

  return (
    <section className="bg-white rounded-3xl p-5 sm:p-7 md:p-8 border border-slate-200/90 shadow-xs relative overflow-hidden">
      {/* Header */}
      <div
        ref={headerRef}
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 transition-all duration-700 ${
          headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-slate-950">
                {language === 'EN' ? 'Best-Selling Technology Hardware' : 'শীর্ষ বিক্রিত টেকনোলজি হার্ডওয়্যার'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] uppercase tracking-wider border border-slate-200">
                Verified
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {language === 'EN'
                ? 'High-performance hardware trusted by businesses and power users nationwide'
                : 'ব্যবসা ও প্রফেশনাল ব্যবহারকারীদের পছন্দের নির্ভরযোগ্য হার্ডওয়্যার'}
            </p>
          </div>
        </div>

        <button
          onClick={handleExploreAll}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer group"
        >
          <span>{language === 'EN' ? 'View All Best Sellers' : 'সকল শীর্ষ পণ্য দেখুন'}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Product Grid */}
      <div
        ref={containerRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
      >
        {bestSellingProducts.map(product => (
          <div
            key={product.id}
            className={`stagger-item ${cardsInView ? 'in-view' : ''}`}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Trust reassurance banner below cards */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">Every product includes an official manufacturer warranty in Bangladesh.</span>
        </div>
        <div className="text-slate-500 font-medium">
          Fast nationwide insured dispatch across all 64 districts.
        </div>
      </div>
    </section>
  );
};
