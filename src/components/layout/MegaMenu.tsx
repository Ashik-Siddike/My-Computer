import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Laptop,
  Cpu,
  ChevronRight,
  Sparkles,
  Signal,
  ShieldCheck,
  Monitor,
  HardDrive,
  Wifi,
  Camera,
  Printer,
  Gamepad2,
  Headphones,
  Keyboard
} from 'lucide-react';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => {
  const { setCurrentView, setFilters, language } = useStore();

  if (!isOpen) return null;

  const navigateCategory = (catId: string) => {
    setFilters(prev => ({ ...prev, category: catId }));
    setCurrentView('shop');
    onClose();
  };

  return (
    <div
      className="absolute top-full left-0 w-full bg-white shadow-2xl border-b border-slate-200 z-40 animate-fadeIn"
      onMouseLeave={onClose}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Column 1: Systems & Displays */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-black text-slate-950 border-b border-slate-200 pb-2">
            <Laptop className="w-5 h-5 text-blue-600" />
            <span>{language === 'EN' ? 'Systems & Displays' : 'সিস্টেম ও ডিসপ্লে'}</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-800 font-semibold">
            <li>
              <button onClick={() => navigateCategory('laptop')} className="hover:text-blue-600 flex items-center justify-between w-full py-1 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-slate-500" />
                  <span>Laptops &amp; MacBooks</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            </li>
            <li>
              <button onClick={() => navigateCategory('monitor')} className="hover:text-blue-600 flex items-center justify-between w-full py-1 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-slate-500" />
                  <span>Monitors &amp; 4K Displays</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            </li>
            <li>
              <button onClick={() => navigateCategory('gaming')} className="hover:text-blue-600 flex items-center justify-between w-full py-1 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-slate-500" />
                  <span>Gaming Systems &amp; Consoles</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            </li>
            <li>
              <button onClick={() => navigateCategory('accessories')} className="hover:text-blue-600 flex items-center justify-between w-full py-1 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-slate-500" />
                  <span>Workstation Keyboards &amp; Mice</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            </li>
            <li>
              <button onClick={() => navigateCategory('earbuds-headphones')} className="hover:text-blue-600 flex items-center justify-between w-full py-1 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-slate-500" />
                  <span>Earbuds &amp; Headphones</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            </li>
          </ul>
        </div>

        {/* Column 2: Components & Enterprise Storage */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-black text-slate-950 border-b border-slate-200 pb-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <span>{language === 'EN' ? 'Components & Storage' : 'কম্পোনেন্ট ও স্টোরেজ'}</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-800 font-semibold">
            <li>
              <button onClick={() => navigateCategory('processor')} className="hover:text-blue-600 flex items-center justify-between w-full py-1 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-slate-500" />
                  <span>Processors (Intel &amp; AMD)</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            </li>
            <li>
              <button onClick={() => navigateCategory('storage')} className="hover:text-blue-600 flex items-center justify-between w-full py-1 cursor-pointer">
                <span className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-slate-500" />
                  <span>NVMe SSDs, NAS &amp; Hard Drives</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            </li>
            <li>
              <button onClick={() => navigateCategory('server')} className="hover:text-blue-600 flex items-center justify-between w-full py-1 cursor-pointer">
                <span className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-slate-500" />
                  <span>Enterprise Servers &amp; Workstations</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            </li>
            <li>
              <button onClick={() => navigateCategory('software')} className="hover:text-blue-600 flex items-center justify-between w-full py-1 cursor-pointer">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <span>Genuine OS &amp; Office Licenses</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Networking & AI Surveillance */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-black text-slate-950 border-b border-slate-200 pb-2">
            <Wifi className="w-5 h-5 text-emerald-600" />
            <span>{language === 'EN' ? 'Networking & Security' : 'নেটওয়ার্কিং ও সিকিউরিটি'}</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-800 font-semibold">
            <li>
              <button onClick={() => navigateCategory('networking')} className="hover:text-blue-600 flex items-center justify-between w-full py-1 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-slate-500" />
                  <span>Wi-Fi 6 Routers, Switches &amp; Mesh</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            </li>
            <li>
              <button onClick={() => navigateCategory('onu-device')} className="hover:text-blue-600 flex items-center justify-between w-full py-1 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Signal className="w-4 h-4 text-slate-500" />
                  <span>Fiber Optical ONUs &amp; Modems</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            </li>
            <li>
              <button onClick={() => navigateCategory('camera')} className="hover:text-blue-600 flex items-center justify-between w-full py-1 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-slate-500" />
                  <span>Smart AI Cameras &amp; Surveillance</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            </li>
            <li>
              <button onClick={() => navigateCategory('office-equipment')} className="hover:text-blue-600 flex items-center justify-between w-full py-1 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Laser Printers &amp; Scanners</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Professional Custom PC Configurator Callout */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between relative overflow-hidden shadow-xl border border-slate-800">
          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/30 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Configurator Tool</span>
            </div>
            <h3 className="font-extrabold text-lg leading-tight text-white">
              {language === 'EN' ? 'Interactive PC Builder' : 'ইন্টারেক্টিভ পিসি বিল্ডার'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'EN'
                ? 'Check hardware compatibility, calculate TDP power draw, and generate certified quotations in BDT.'
                : 'পার্টস সামঞ্জস্যতা পরীক্ষা করুন, পাওয়ার হিসেব করুন এবং প্রিন্ট করুন।'}
            </p>
          </div>

          <button
            onClick={() => {
              setCurrentView('pc-builder');
              onClose();
            }}
            className="mt-4 bg-white hover:bg-blue-600 text-slate-900 hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <span>{language === 'EN' ? 'Launch PC Builder' : 'পিসি বিল্ডার খুলুন'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
