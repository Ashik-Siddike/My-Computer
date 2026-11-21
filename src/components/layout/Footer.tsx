import React from 'react';
import { useStore } from '../../context/StoreContext';
import { STORE_LOCATIONS } from '../../data/mockData';
import { Logo } from '../common/Logo';
import { useStaggerReveal, useScrollReveal } from '../../hooks/useScrollReveal';
import {
  PhoneCall,
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Clock,
  ChevronRight
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView, setFilters, getCardsBySection } = useStore();
  const valueCards = getCardsBySection('value-proposition');
  const { containerRef: valueRef, inView: valueInView } = useStaggerReveal<HTMLDivElement>(4);
  const { ref: colRef, inView: colInView } = useScrollReveal<HTMLDivElement>();

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Truck': return <Truck className="w-5 h-5" />;
      case 'CreditCard': return <CreditCard className="w-5 h-5" />;
      case 'RotateCcw': return <RotateCcw className="w-5 h-5" />;
      default: return <ShieldCheck className="w-5 h-5" />;
    }
  };

  return (
    <footer className="bg-white text-slate-900 pt-10 pb-10 border-t border-slate-200 mt-6">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-12">
        
        {/* 1. Value Proposition Banner */}
        <div ref={valueRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 p-6 rounded-2xl bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/90 border border-blue-100 shadow-xs">
          {valueCards && valueCards.length > 0 ? (
            valueCards.map((card, idx) => (
              <div 
                key={card.id || idx} 
                className={`stagger-item ${valueInView ? 'in-view' : ''} flex items-center space-x-3.5`}
              >
                <div 
                  className="p-3 rounded-xl shadow-xs"
                  style={{
                    backgroundColor: card.backgroundColor || '#eff6ff',
                    color: card.accentColor || '#2563eb'
                  }}
                >
                  {renderIcon(card.icon)}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-950 text-xs sm:text-sm">{card.title}</h4>
                  <p className="text-[11px] text-slate-700 font-semibold">{card.subtitle || card.description}</p>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className={`stagger-item ${valueInView ? 'in-view' : ''} flex items-center space-x-3.5`}>
                <div className="p-3 rounded-xl bg-blue-100 text-blue-700 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-950 text-xs sm:text-sm">100% Genuine Tech</h4>
                  <p className="text-[11px] text-slate-700 font-semibold">Official Brand Warranty</p>
                </div>
              </div>

              <div className={`stagger-item ${valueInView ? 'in-view' : ''} flex items-center space-x-3.5`}>
                <div className="p-3 rounded-xl bg-orange-100 text-orange-700 shadow-xs">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-950 text-xs sm:text-sm">Fast BD Delivery</h4>
                  <p className="text-[11px] text-slate-700 font-semibold">24h Dhaka, 48h Nationwide</p>
                </div>
              </div>

              <div className={`stagger-item ${valueInView ? 'in-view' : ''} flex items-center space-x-3.5`}>
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-950 text-xs sm:text-sm">0% EMI Available</h4>
                  <p className="text-[11px] text-slate-700 font-semibold">18+ Partner Banks</p>
                </div>
              </div>

              <div className={`stagger-item ${valueInView ? 'in-view' : ''} flex items-center space-x-3.5`}>
                <div className="p-3 rounded-xl bg-purple-100 text-purple-700 shadow-xs">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-950 text-xs sm:text-sm">Easy Returns</h4>
                  <p className="text-[11px] text-slate-700 font-semibold">7 Days Replacement</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 2. Main Footer Columns */}
        <div ref={colRef} className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 transition-all duration-700 ${colInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Column 1: Brand & Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <Logo size="xl" variant="auto" showTagline={true} />
            </div>

            <p className="text-xs text-slate-800 font-medium leading-relaxed max-w-sm">
              My Computer is Bangladesh’s premier technology destination. We deliver top-tier Smart Cameras, Enterprise Networking, Licensed Software, Servers, High-Speed Storage, Accessories, Gadgets &amp; Gaming Gear with unmatched official warranty support.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-950">Hotline: 16789 / +880 9678-000111</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                <Mail className="w-4 h-4 text-slate-600" />
                <span>support@mycomputer.com.bd</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                <Clock className="w-4 h-4 text-slate-600" />
                <span>Everyday: 10:00 AM - 8:00 PM</span>
              </div>
            </div>
          </div>

          {/* Column 2: Popular Categories */}
          <div className="space-y-3">
            <h4 className="font-black text-slate-950 text-xs uppercase tracking-wider">
              Top Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => { setFilters(p => ({ ...p, category: 'camera' })); setCurrentView('shop'); }} className="hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3 h-3 text-slate-400" /> Cameras &amp; Security
                </button>
              </li>
              <li>
                <button onClick={() => { setFilters(p => ({ ...p, category: 'networking' })); setCurrentView('shop'); }} className="hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3 h-3 text-slate-400" /> Routers &amp; Networking
                </button>
              </li>
              <li>
                <button onClick={() => { setFilters(p => ({ ...p, category: 'software' })); setCurrentView('shop'); }} className="hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3 h-3 text-slate-400" /> Genuine Software
                </button>
              </li>
              <li>
                <button onClick={() => { setFilters(p => ({ ...p, category: 'server' })); setCurrentView('shop'); }} className="hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3 h-3 text-slate-400" /> Enterprise Servers
                </button>
              </li>
              <li>
                <button onClick={() => { setFilters(p => ({ ...p, category: 'storage' })); setCurrentView('shop'); }} className="hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3 h-3 text-slate-400" /> NVMe SSDs &amp; NAS
                </button>
              </li>
              <li>
                <button onClick={() => { setFilters(p => ({ ...p, category: 'gaming' })); setCurrentView('shop'); }} className="hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3 h-3 text-slate-400" /> Esports Gaming Gear
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className="space-y-3">
            <h4 className="font-black text-slate-950 text-xs uppercase tracking-wider">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs text-slate-800 font-semibold">
              <li>
                <button onClick={() => setCurrentView('order-tracking')} className="hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3 h-3 text-slate-500" /> Track Your Order
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('store-locator')} className="hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3 h-3 text-slate-500" /> Store Locations in BD
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('user-dashboard')} className="hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3 h-3 text-slate-500" /> Warranty Claims &amp; Status
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('contact')} className="hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3 h-3 text-slate-500" /> Contact Support
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('about')} className="hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3 h-3 text-slate-500" /> About My Computer
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('admin')} className="hover:text-blue-600 flex items-center gap-1.5 transition-colors text-indigo-600 font-bold">
                  <ChevronRight className="w-3 h-3 text-indigo-500" /> Admin Portal (অ্যাডমিন প্যানেল)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Branches */}
          <div className="space-y-3">
            <h4 className="font-black text-slate-950 text-xs uppercase tracking-wider">
              Showroom Hubs
            </h4>
            <div className="space-y-2.5 text-xs text-slate-800">
              {STORE_LOCATIONS.slice(0, 3).map(store => (
                <div key={store.id} className="border-b border-slate-200 pb-2">
                  <p className="font-bold text-slate-950">{store.name}</p>
                  <p className="text-[11px] text-slate-700 font-medium line-clamp-1">{store.address}</p>
                </div>
              ))}
              <button
                onClick={() => setCurrentView('store-locator')}
                className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center gap-1 mt-1"
              >
                <span>View All 5 Locations</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Authorized Importer & Compliance */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-700">
          <div className="text-center sm:text-left">
            <p className="font-extrabold text-slate-950 text-sm">Authorized Technology Importer &amp; Retailer</p>
            <p className="text-[11px] text-slate-600 font-medium">100% Genuine Products with Official Brand Warranty across Bangladesh</p>
          </div>

          <div className="text-center sm:text-right font-medium">
            <p className="font-bold text-slate-900">Trade License: TRAD/DNCC/024881/2023</p>
            <p className="text-[11px] text-slate-500">Registered Enterprise Tax ID: 748192038102</p>
          </div>
        </div>

        {/* 4. Copyright & Legal */}
        <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-700 font-semibold flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} My Computer BD Ltd. All Rights Reserved.</p>
          <div className="flex space-x-4">
            <a href="#privacy" className="hover:underline">Privacy Policy</a>
            <a href="#terms" className="hover:underline">Terms of Service</a>
            <a href="#sitemap" className="hover:underline">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
