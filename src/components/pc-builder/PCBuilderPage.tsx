import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS } from '../../data/mockData';
import {
  Sparkles,
  Cpu,
  HardDrive,
  MemoryStick,
  CircuitBoard,
  Database,
  Zap,
  Box,
  Fan,
  Monitor,
  Keyboard,
  Mouse,
  Plug,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ShoppingCart,
  Search,
  X,
  RotateCcw,
  Info
} from 'lucide-react';

const slotIcons: Record<string, React.ReactNode> = {
  cpu: <Cpu className="w-5 h-5 text-blue-600" />,
  motherboard: <HardDrive className="w-5 h-5 text-indigo-600" />,
  ram: <MemoryStick className="w-5 h-5 text-cyan-600" />,
  gpu: <CircuitBoard className="w-5 h-5 text-purple-600" />,
  storage: <Database className="w-5 h-5 text-emerald-600" />,
  psu: <Zap className="w-5 h-5 text-amber-600" />,
  case: <Box className="w-5 h-5 text-slate-700" />,
  cooler: <Fan className="w-5 h-5 text-teal-600" />,
  fans: <Fan className="w-5 h-5 text-sky-600" />,
  monitor: <Monitor className="w-5 h-5 text-rose-600" />,
  keyboard: <Keyboard className="w-5 h-5 text-amber-700" />,
  mouse: <Mouse className="w-5 h-5 text-slate-800" />,
  accessories: <Plug className="w-5 h-5 text-blue-700" />
};

export const PCBuilderPage: React.FC = () => {
  const {
    pcBuildComponents,
    addPCComponent,
    removePCComponent,
    clearPCBuild,
    pcBuildTotalBDT,
    pcBuildTotalWattage,
    addAllPCToCart,
    products,
    language
  } = useStore();

  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [modalSearch, setModalSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  const handlePrint = () => {
    window.print();
  };

  // Match real products from database for the active slot
  const slotProducts = useMemo(() => {
    if (!activeSlot) return [];
    const list = products && products.length > 0 ? products : PRODUCTS;

    return list.filter(p => {
      if (p.isVisible === false) return false;
      const name = (p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const sub = (p.subcategory || '').toLowerCase();

      let isCategoryMatch = false;
      switch (activeSlot) {
        case 'cpu':
          isCategoryMatch = p.pcBuilderCategory === 'cpu' || cat === 'processor' || name.includes('core i') || name.includes('ryzen');
          break;
        case 'motherboard':
          isCategoryMatch = p.pcBuilderCategory === 'motherboard' || cat === 'motherboard' || name.includes('motherboard') || name.includes('b760') || name.includes('z790') || name.includes('b650') || name.includes('h610');
          break;
        case 'gpu':
          isCategoryMatch = p.pcBuilderCategory === 'gpu' || cat === 'graphics-card' || name.includes('geforce') || name.includes('rtx') || name.includes('radeon') || name.includes('gtx');
          break;
        case 'ram':
          isCategoryMatch = p.pcBuilderCategory === 'ram' || cat === 'ram' || name.includes('ddr4') || name.includes('ddr5') || name.includes('corsair') || name.includes('fury');
          break;
        case 'storage':
          isCategoryMatch = p.pcBuilderCategory === 'storage' || cat === 'storage' || sub === 'ssd-internal' || sub === 'nas-storage' || name.includes('ssd') || name.includes('nvme') || name.includes('barracuda');
          break;
        case 'psu':
          isCategoryMatch = p.pcBuilderCategory === 'psu' || cat === 'power' || name.includes('power supply') || name.includes('bronze') || name.includes('gold') || name.includes('watt');
          break;
        case 'cooler':
          isCategoryMatch = p.pcBuilderCategory === 'cooler' || name.includes('cooler') || name.includes('liquid cooler') || name.includes('deepcool');
          break;
        case 'case':
          isCategoryMatch = p.pcBuilderCategory === 'case' || name.includes('casing') || name.includes('pc case') || name.includes('chassis');
          break;
        case 'fans':
          isCategoryMatch = name.includes('fan') || name.includes('cooler') || cat === 'accessories';
          break;
        case 'monitor':
          isCategoryMatch = cat === 'monitor' || name.includes('monitor') || name.includes('ultrasharp') || name.includes('curved');
          break;
        case 'keyboard':
          isCategoryMatch = (cat === 'accessories' && name.includes('keyboard')) || name.includes('mechanical keyboard') || sub === 'keyboards';
          break;
        case 'mouse':
          isCategoryMatch = (cat === 'accessories' && name.includes('mouse')) || name.includes('gaming mouse') || sub === 'mouse';
          break;
        case 'accessories':
          isCategoryMatch = cat === 'accessories' || cat === 'gadget' || cat === 'networking';
          break;
        default:
          isCategoryMatch = p.pcBuilderCategory === activeSlot || cat === activeSlot;
      }

      // If user typed inside the modal search bar, match query across all attributes
      if (modalSearch.trim()) {
        const q = modalSearch.toLowerCase().trim();
        const matchesQuery =
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.shortSpecs.some(s => s.toLowerCase().includes(q));
        return matchesQuery;
      }

      // Brand filter
      if (selectedBrand !== 'all' && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }

      return isCategoryMatch;
    });
  }, [activeSlot, products, modalSearch, selectedBrand]);

  // Available brands in the active slot
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    slotProducts.forEach(p => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands);
  }, [slotProducts]);

  // Selected count & build completion rate
  const selectedCount = pcBuildComponents.filter(s => s.product !== null).length;
  const totalSlotsCount = pcBuildComponents.length;
  const completionPercentage = Math.round((selectedCount / totalSlotsCount) * 100);

  // Advanced Compatibility Engine
  const cpuPart = pcBuildComponents.find(s => s.slotId === 'cpu')?.product;
  const moboPart = pcBuildComponents.find(s => s.slotId === 'motherboard')?.product;
  const ramPart = pcBuildComponents.find(s => s.slotId === 'ram')?.product;
  const psuPart = pcBuildComponents.find(s => s.slotId === 'psu')?.product;

  const compatibilityStatus = useMemo(() => {
    const warnings: string[] = [];
    let isFatal = false;

    // 1. Socket check
    if (cpuPart && moboPart) {
      if (cpuPart.socketType && moboPart.socketType) {
        if (cpuPart.socketType !== moboPart.socketType) {
          warnings.push(`Socket Mismatch: CPU requires ${cpuPart.socketType}, but Motherboard is ${moboPart.socketType}.`);
          isFatal = true;
        }
      } else {
        warnings.push(`Socket verification notice: Please verify CPU (${cpuPart.name}) and Motherboard (${moboPart.name}) socket compatibility before assembly.`);
      }
    }

    // 2. RAM Generation check (DDR4 vs DDR5)
    if (moboPart && ramPart) {
      const moboIsDDR5 = moboPart.name.includes('DDR5') || moboPart.shortSpecs.some(s => s.includes('DDR5'));
      const moboIsDDR4 = moboPart.name.includes('DDR4') || moboPart.shortSpecs.some(s => s.includes('DDR4'));
      const ramIsDDR5 = ramPart.name.includes('DDR5') || ramPart.shortSpecs.some(s => s.includes('DDR5'));
      const ramIsDDR4 = ramPart.name.includes('DDR4') || ramPart.shortSpecs.some(s => s.includes('DDR4'));

      if (moboIsDDR5 && ramIsDDR4) {
        warnings.push(`RAM Generation Incompatible: Motherboard requires DDR5, but DDR4 RAM was selected.`);
        isFatal = true;
      } else if (moboIsDDR4 && ramIsDDR5) {
        warnings.push(`RAM Generation Incompatible: Motherboard requires DDR4, but DDR5 RAM was selected.`);
        isFatal = true;
      }
    }

    // 3. Power Supply Wattage check
    if (psuPart && psuPart.wattage && pcBuildTotalWattage > 0) {
      if (pcBuildTotalWattage > psuPart.wattage) {
        warnings.push(`Power Alert: Estimated system load (${pcBuildTotalWattage}W) exceeds selected PSU capacity (${psuPart.wattage}W). Recommended: at least ${pcBuildTotalWattage + 150}W.`);
        isFatal = true;
      }
    }

    return { warnings, isFatal };
  }, [cpuPart, moboPart, ramPart, psuPart, pcBuildTotalWattage]);

  return (
    <div className="py-6 sm:py-8 space-y-8 animate-fadeIn max-w-[1500px] mx-auto">
      {/* 1. Header & Configuration Dashboard */}
      <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 md:p-10 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-blue-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Professional Hardware Configurator</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white">
              {language === 'EN' ? 'Custom PC Builder' : 'কাস্টম পিসি বিল্ডার'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Assemble your custom workstation or gaming rig with verified authentic components. Monitor live power draw, verify socket compatibility, and export official quotations.
            </p>

            {/* Progress indicator */}
            <div className="pt-2 max-w-md">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1.5">
                <span>Build Completion</span>
                <span className="text-white font-mono">{selectedCount} of {totalSlotsCount} Selected ({completionPercentage}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Pricing & Wattage Summary Card */}
          <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-800 min-w-[280px] sm:min-w-[320px] space-y-4">
            <div>
              <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                Total Configuration Price
              </span>
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                ৳{pcBuildTotalBDT.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 border-t border-slate-800 pt-3">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Zap className="w-4 h-4" />
                <span className="font-bold">Estimated TDP:</span>
              </div>
              <span className="font-mono font-bold text-white text-sm">{pcBuildTotalWattage} W</span>
            </div>

            {/* Action buttons inside header */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={addAllPCToCart}
                disabled={selectedCount === 0}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-extrabold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add Complete Rig to Cart</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Quotation</span>
                </button>

                <button
                  type="button"
                  onClick={clearPCBuild}
                  disabled={selectedCount === 0}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Real-Time Hardware Compatibility Engine Banner */}
      {compatibilityStatus.warnings.length > 0 ? (
        <div
          className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 shadow-xs ${
            compatibilityStatus.isFatal
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <AlertTriangle
            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              compatibilityStatus.isFatal ? 'text-red-600' : 'text-amber-600'
            }`}
          />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider">
              {compatibilityStatus.isFatal ? 'Hardware Incompatibility Detected' : 'Hardware Configuration Notice'}
            </h4>
            <ul className="text-xs font-medium space-y-1">
              {compatibilityStatus.warnings.map((warn, i) => (
                <li key={i}>{warn}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div className="text-xs font-semibold">
            All selected components pass hardware compatibility verification! You can order online or print an official quotation.
          </div>
        </div>
      )}

      {/* 3. Component Slots Architecture */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
              Hardware Component Slots
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select verified components from the official inventory
            </p>
          </div>

          <div className="text-xs text-slate-500 font-semibold">
            {selectedCount} of {totalSlotsCount} Configured
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {pcBuildComponents.map(slot => {
            const hasProduct = slot.product !== null;

            return (
              <div
                key={slot.slotId}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                {/* Slot Identity & Icon */}
                <div className="flex items-center gap-4 min-w-[240px]">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200/60 shadow-xs">
                    {slotIcons[slot.slotId] || <Cpu className="w-5 h-5 text-slate-600" />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {language === 'EN' ? slot.slotName : slot.slotNameBn}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {['cpu', 'motherboard', 'ram', 'storage', 'psu'].includes(slot.slotId)
                        ? 'Core Component'
                        : 'Peripheral / Expansion'}
                    </span>
                  </div>
                </div>

                {/* Selected Component Information or Empty State */}
                <div className="flex-1">
                  {hasProduct ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                      <div className="flex items-center gap-3">
                        <img
                          src={slot.product!.images[0]}
                          alt={slot.product!.name}
                          className="w-12 h-12 object-contain rounded-xl bg-white p-1 border border-slate-200 flex-shrink-0"
                        />
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            {slot.product!.brand}
                          </span>
                          <h5 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                            {slot.product!.name}
                          </h5>
                          {slot.product!.socketType && (
                            <span className="text-[11px] text-blue-600 font-semibold mr-2">
                              Socket: {slot.product!.socketType}
                            </span>
                          )}
                          {slot.product!.wattage && (
                            <span className="text-[11px] text-amber-600 font-semibold">
                              TDP: {slot.product!.wattage}W
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex items-center justify-between sm:justify-end gap-3 pl-2">
                        <div className="font-black text-sm sm:text-base text-slate-950">
                          ৳{(slot.product!.discountPrice || slot.product!.regularPrice || slot.product!.price || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic flex items-center gap-1.5 py-1">
                      <Info className="w-3.5 h-3.5 text-slate-300" />
                      <span>No part currently selected for this slot</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 min-w-[150px]">
                  {hasProduct ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSlot(slot.slotId);
                          setModalSearch('');
                          setSelectedBrand('all');
                        }}
                        className="text-xs font-bold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => removePCComponent(slot.slotId)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Remove Component"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSlot(slot.slotId);
                        setModalSearch('');
                        setSelectedBrand('all');
                      }}
                      className="bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Select Part</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Component Selection Modal with Live Database Search */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                  {slotIcons[activeSlot] || <Cpu className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight">
                    Select {activeSlot.toUpperCase()} Component
                  </h3>
                  <p className="text-xs text-slate-400">
                    Showing available authentic inventory matching this slot
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveSlot(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products by model, brand, or specifications..."
                  value={modalSearch}
                  onChange={e => setModalSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-blue-500 shadow-xs"
                />
                {modalSearch && (
                  <button
                    onClick={() => setModalSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {availableBrands.length > 0 && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Brand:</span>
                  <select
                    value={selectedBrand}
                    onChange={e => setSelectedBrand(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 cursor-pointer shadow-xs"
                  >
                    <option value="all">All Brands</option>
                    {availableBrands.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Product List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
              {slotProducts.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Info className="w-8 h-8 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">No Components Found</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    No hardware in the catalog matched the current search criteria. Try clearing the search or exploring other components.
                  </p>
                </div>
              ) : (
                slotProducts.map(p => {
                  const itemPrice = p.discountPrice || p.regularPrice || p.price || 0;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        addPCComponent(activeSlot, p);
                        setActiveSlot(null);
                      }}
                      className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 hover:border-blue-500 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-blue-50/20 group shadow-xs hover:shadow-md"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={p.images && p.images.length > 0 ? p.images[0] : '/images/placeholder.webp'}
                          alt={p.name}
                          className="w-14 h-14 object-contain rounded-xl bg-slate-50 p-1 border border-slate-100 flex-shrink-0"
                          loading="lazy"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              {p.brand}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                              {p.stockStatus}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {p.name}
                          </h4>
                          {p.shortSpecs && p.shortSpecs.length > 0 && (
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              {p.shortSpecs.slice(0, 3).join(' • ')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex items-center justify-between sm:justify-end gap-3 sm:pl-3">
                        <div>
                          <span className="font-black text-sm sm:text-base text-slate-950 block">
                            ৳{itemPrice.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {p.warranty || 'Official BD Warranty'}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="bg-slate-900 group-hover:bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-xs"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
