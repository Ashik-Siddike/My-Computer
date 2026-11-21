import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Logo } from '../common/Logo';
import { PCBuildDropdown } from './PCBuildDropdown';
import type { Product } from '../../types';
import {
  Search,
  ShoppingCart,
  Heart,
  GitCompare,
  User,
  PhoneCall,
  Truck,
  ShieldCheck,
  Menu,
  X,
  Laptop,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  Camera,
  Gamepad2,
  Printer,
  Keyboard,
  Headphones,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart }) => {
  const {
    setCurrentView,
    language,
    toggleLanguage,
    searchQuery,
    setSearchQuery,
    cart,
    cartTotal,
    wishlist,
    compareList,
    setFilters,
    products,
    openProductDetail
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [selectedSearchCategory, setSelectedSearchCategory] = useState<string>('all');
  const [searchFocused, setSearchFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const categoryNavRef = useRef<HTMLDivElement>(null);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Close search suggestions when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Real-time Global Search System: Tokenized matching across all MongoDB / catalog products
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return { products: [], totalCount: 0, matchedBrands: [], matchedCategories: [] };

    const tokens = query.split(/\s+/).filter(Boolean);

    let list = products && products.length > 0 ? products : [];
    if (selectedSearchCategory !== 'all') {
      list = list.filter(p => p.category === selectedSearchCategory || p.subcategory === selectedSearchCategory);
    }

    const matchedProducts = list.filter(product => {
      if (product.isVisible === false) return false;
      const specsJoined = Array.isArray(product.shortSpecs) ? product.shortSpecs.join(' ') : '';
      const detailedSpecsJoined = product.specifications 
        ? Object.values(product.specifications).flatMap(v => Array.isArray(v) ? v.map((item: any) => `${item.label || ''} ${item.value || ''}`) : []).join(' ')
        : '';
      const text = `${product.name} ${product.brand} ${product.category} ${product.categoryName || ''} ${product.subcategory || ''} ${product.slug || ''} ${product.id || ''} ${product.description || ''} ${specsJoined} ${detailedSpecsJoined}`.toLowerCase();

      return tokens.every(token => text.includes(token));
    });

    // Extract relevant matching brands & categories
    const brandsSet = new Set<string>();
    const categoriesSet = new Set<string>();

    matchedProducts.forEach(p => {
      if (p.brand && brandsSet.size < 4) brandsSet.add(p.brand);
      if (p.category && categoriesSet.size < 4) categoriesSet.add(p.category);
    });

    return {
      products: matchedProducts.slice(0, 6),
      totalCount: matchedProducts.length,
      matchedBrands: Array.from(brandsSet),
      matchedCategories: Array.from(categoriesSet),
    };
  }, [searchQuery, products, selectedSearchCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setFilters(prev => ({
        ...prev,
        searchQuery: searchQuery.trim(),
        category: selectedSearchCategory !== 'all' ? selectedSearchCategory : null,
      }));
      setSearchFocused(false);
      setMobileSearch(false);
      setCurrentView('shop');
    }
  };

  const handleSelectProduct = (product: Product) => {
    openProductDetail(product.id);
    setSearchFocused(false);
    setMobileSearch(false);
  };

  const handleSelectCategoryFilter = (catId: string) => {
    setFilters(prev => ({ ...prev, category: catId, searchQuery: '' }));
    setSearchFocused(false);
    setMobileSearch(false);
    setCurrentView('shop');
  };

  const handleSelectBrandFilter = (brandName: string) => {
    setFilters(prev => ({ ...prev, brand: [brandName], searchQuery: '' }));
    setSearchFocused(false);
    setMobileSearch(false);
    setCurrentView('shop');
  };

  // Keyboard navigation inside search suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!searchFocused || searchResults.products.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < searchResults.products.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : searchResults.products.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < searchResults.products.length) {
        e.preventDefault();
        handleSelectProduct(searchResults.products[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setSearchFocused(false);
    }
  };

  // Main Desktop Navigation Links
  const mainNavItems = [
    { id: 'all-products', label: language === 'EN' ? 'All Products' : 'সকল পণ্য', onClick: () => { setFilters(p => ({ ...p, category: null })); setCurrentView('shop'); } },
    { id: 'desktop-laptop', label: language === 'EN' ? 'Desktop & Laptop' : 'ডেস্কটপ ও ল্যাপটপ', onClick: () => { setFilters(p => ({ ...p, category: 'laptop' })); setCurrentView('shop'); }, icon: Laptop },
    { id: 'components', label: language === 'EN' ? 'Components' : 'কম্পোনেন্টস', onClick: () => { setFilters(p => ({ ...p, category: 'processor' })); setCurrentView('shop'); }, icon: Cpu },
    { id: 'monitors', label: language === 'EN' ? 'Monitors' : 'মনিটর', onClick: () => { setFilters(p => ({ ...p, category: 'monitor' })); setCurrentView('shop'); }, icon: Monitor },
    { id: 'storage', label: language === 'EN' ? 'Storage & NAS' : 'স্টোরেজ', onClick: () => { setFilters(p => ({ ...p, category: 'storage' })); setCurrentView('shop'); }, icon: HardDrive },
    { id: 'networking', label: language === 'EN' ? 'Networking' : 'নেটওয়ার্কিং', onClick: () => { setFilters(p => ({ ...p, category: 'networking' })); setCurrentView('shop'); }, icon: Wifi },
    { id: 'camera', label: language === 'EN' ? 'Camera & Security' : 'ক্যামেরা', onClick: () => { setFilters(p => ({ ...p, category: 'camera' })); setCurrentView('shop'); }, icon: Camera },
    { id: 'accessories', label: language === 'EN' ? 'Accessories' : 'এক্সেসরিজ', onClick: () => { setFilters(p => ({ ...p, category: 'accessories' })); setCurrentView('shop'); }, icon: Keyboard },
    { id: 'printers', label: language === 'EN' ? 'Printers & Office' : 'প্রিন্টার', onClick: () => { setFilters(p => ({ ...p, category: 'office-equipment' })); setCurrentView('shop'); }, icon: Printer },
    { id: 'gaming', label: language === 'EN' ? 'Gaming Gear' : 'গেমিং', onClick: () => { setFilters(p => ({ ...p, category: 'gaming' })); setCurrentView('shop'); }, icon: Gamepad2 },
    { id: 'earbuds-headphones', label: language === 'EN' ? 'Earbuds & Headphones' : 'ইয়ারবাডস ও হেডফোন', onClick: () => { setFilters(p => ({ ...p, category: 'earbuds-headphones' })); setCurrentView('shop'); }, icon: Headphones },
    { id: 'pc-builder', label: language === 'EN' ? 'PC Builder' : 'পিসি বিল্ডার', onClick: () => setCurrentView('pc-builder'), highlight: true, icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white transition-all duration-300">
      {/* ── Top Utility Reassurance Bar ──────────────────────── */}
      <div className="hidden sm:block border-b border-slate-200/80 bg-slate-900 text-slate-300 text-xs py-2">
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
              <span>Customer Care: <strong className="text-white">16789</strong> (10:00 AM – 8:00 PM)</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Genuine Tech • Official BD Distributor Warranty</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 text-slate-300">
              <Truck className="w-3.5 h-3.5 text-blue-400" />
              <span>Insured Nationwide Delivery (All 64 Districts)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('store-locator')}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px] font-semibold"
            >
              Store Locator
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => setCurrentView('order-tracking')}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px] font-semibold"
            >
              Track Order
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={toggleLanguage}
              className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
            >
              {language === 'EN' ? 'বাংলা' : 'EN'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Navigation Header Row ──────────────────────── */}
      <div className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs relative z-30">
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-3 flex items-center justify-between gap-4">
          
          {/* Mobile: Hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
            title="Open Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* MY COMPUTER Brand Identity Logo */}
          <div
            onClick={() => {
              setFilters(p => ({ ...p, category: null, searchQuery: '' }));
              setCurrentView('home');
              setMobileMenuOpen(false);
            }}
            className="cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
          >
            <div className="hidden sm:block">
              <Logo size="lg" showTagline={true} />
            </div>
            <div className="sm:hidden">
              <Logo size="md" showTagline={false} />
            </div>
          </div>

          {/* ADVANCED GLOBAL PRODUCT SEARCH SYSTEM (Central Component) */}
          <div ref={searchContainerRef} className="hidden lg:block flex-1 max-w-2xl relative">
            <form
              onSubmit={handleSearchSubmit}
              className={`flex items-center rounded-2xl bg-slate-50 border transition-all duration-200 shadow-inner ${
                searchFocused ? 'border-blue-600 ring-2 ring-blue-500/10 bg-white' : 'border-slate-300/80 hover:border-slate-400'
              }`}
            >
              {/* Category selector dropdown inside search */}
              <select
                value={selectedSearchCategory}
                onChange={e => setSelectedSearchCategory(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 pl-4 pr-2 py-2.5 border-r border-slate-200 focus:outline-hidden cursor-pointer rounded-l-2xl max-w-[140px] truncate"
              >
                <option value="all">All Catalog</option>
                <option value="laptop">Laptops</option>
                <option value="processor">Components</option>
                <option value="monitor">Monitors</option>
                <option value="networking">Networking</option>
                <option value="camera">Cameras</option>
                <option value="storage">Storage</option>
                <option value="accessories">Accessories</option>
                <option value="gaming">Gaming</option>
              </select>

              {/* Live search input */}
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  language === 'EN'
                    ? 'Search HP laptops, RTX 4060, Canon printers, routers, SSDs...'
                    : 'ল্যাপটপ, প্রসেসর, গ্রাফিক্স কার্ড, ক্যামেরা খুঁজুন...'
                }
                className="w-full bg-transparent px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden"
              />

              {/* Clear button if text present */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 mr-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Search submit button */}
              <button
                type="submit"
                className="p-2.5 m-1 rounded-xl bg-slate-900 hover:bg-blue-600 text-white transition-colors px-4 flex items-center justify-center cursor-pointer shadow-xs"
                title="Search Products"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* REAL-TIME AUTOCOMPLETE SUGGESTIONS DROPDOWN */}
            {searchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in duration-150">
                {searchResults.products.length === 0 ? (
                  /* Professional No-Results Empty State with Helpful Suggestions */
                  <div className="p-6 text-center space-y-3">
                    <p className="text-xs text-slate-500 font-medium">
                      No matching hardware found for <strong className="text-slate-900">"{searchQuery}"</strong>.
                    </p>
                    <div className="text-xs font-semibold text-slate-400">Popular hardware categories:</div>
                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                      {['Laptops', 'Wi-Fi 6 Routers', 'EZVIZ Cameras', 'NVMe SSDs', 'Monitors', 'Mechanical Keyboards'].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setSearchQuery(tag);
                            setFilters(p => ({ ...p, searchQuery: tag }));
                            setCurrentView('shop');
                            setSearchFocused(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Matching Category & Brand Shortcuts */}
                    {(searchResults.matchedCategories.length > 0 || searchResults.matchedBrands.length > 0) && (
                      <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quick Jump:</span>
                        {searchResults.matchedCategories.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleSelectCategoryFilter(cat)}
                            className="px-2.5 py-0.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            In {cat.toUpperCase()}
                          </button>
                        ))}
                        {searchResults.matchedBrands.map(b => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => handleSelectBrandFilter(b)}
                            className="px-2.5 py-0.5 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-800 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            By {b}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Matching Product Cards List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {searchResults.products.map((product, idx) => {
                        const isHighlighted = idx === highlightedIndex;
                        const itemPrice = product.discountPrice || product.regularPrice || product.price || 0;

                        return (
                          <div
                            key={product.id}
                            onClick={() => handleSelectProduct(product)}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                            className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                              isHighlighted ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={product.images && product.images.length > 0 ? product.images[0] : '/images/placeholder.webp'}
                                alt={product.name}
                                className="w-12 h-12 object-contain rounded-xl bg-white p-1 border border-slate-200 flex-shrink-0"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {product.brand}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                                    {product.stockStatus}
                                  </span>
                                </div>
                                <h4 className="font-bold text-xs text-slate-900 line-clamp-1 leading-snug">
                                  {product.name}
                                </h4>
                                {product.shortSpecs && product.shortSpecs.length > 0 && (
                                  <p className="text-[11px] text-slate-500 line-clamp-1">
                                    {product.shortSpecs[0]}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <div className="font-black text-xs sm:text-sm text-slate-950">
                                ৳{itemPrice.toLocaleString()}
                              </div>
                              <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5 justify-end mt-0.5">
                                <span>View</span>
                                <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom view all matching items footer */}
                    <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 pl-2">
                        Found <strong className="text-slate-900">{searchResults.totalCount}</strong> matching products
                      </span>
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>See All Results</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile search trigger icon */}
          <button
            onClick={() => setMobileSearch(prev => !prev)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Action Center Buttons: Compare, Wishlist, PC Builder, Cart, Account */}
          <div className="flex items-center gap-2">
            
            {/* Compare Shortcut */}
            <button
              onClick={() => setCurrentView('compare')}
              className="hidden md:flex relative p-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              title="Compare Hardware"
            >
              <GitCompare className="w-5 h-5" />
              {compareList.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center">
                  {compareList.length}
                </span>
              )}
            </button>

            {/* Wishlist Shortcut */}
            <button
              onClick={() => setCurrentView('user-dashboard')}
              className="hidden md:flex relative p-2.5 text-slate-700 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              title="Saved Items"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* PC Builder Header Dropdown */}
            <PCBuildDropdown />

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white px-3 sm:px-3.5 py-2 rounded-xl transition-all shadow-md group cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 w-4 h-4 bg-blue-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[10px] text-slate-300 uppercase tracking-wider leading-none">Cart</p>
                <p className="text-xs font-black leading-tight text-white">৳{cartTotal.toLocaleString()}</p>
              </div>
            </button>

            {/* Account Profile Button */}
            <button
              onClick={() => setCurrentView('user-dashboard')}
              className="hidden sm:flex p-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 cursor-pointer"
              title="Customer Account"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        {mobileSearch && (
          <div className="lg:hidden px-4 pb-3">
            <form onSubmit={handleSearchSubmit} className="flex items-center rounded-xl bg-slate-100 border border-slate-300 focus-within:border-blue-600">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search laptops, components, networking..."
                autoFocus
                className="flex-1 bg-transparent px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden"
              />
              <button type="submit" className="p-2.5 bg-slate-900 text-white rounded-r-xl">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── Secondary Category Navigation Bar ────────────────── */}
      <div ref={categoryNavRef} className="hidden lg:block bg-white border-b border-slate-200/80 shadow-xs relative z-20">
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between">
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0">
            {mainNavItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`px-3 py-3 text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${
                    item.highlight
                      ? 'border-transparent text-blue-600 bg-blue-50/70 hover:bg-blue-100/70 rounded-t-lg font-black'
                      : 'border-transparent text-slate-700 hover:text-blue-600 hover:border-blue-600'
                  }`}
                >
                  {Icon && <Icon className={`w-3.5 h-3.5 ${item.highlight ? 'text-blue-600' : 'text-slate-500'}`} />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ────────────────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex">
          <div className="bg-white w-4/5 max-w-sm h-full shadow-2xl overflow-y-auto flex flex-col justify-between p-5 animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <Logo size="md" showTagline={false} />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Category List */}
              <div className="py-4 space-y-1">
                {mainNavItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.onClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-2">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800">Hotline: 16789</span>
              </div>
              <p>IDB Bhaban &amp; Multiplan Center, Dhaka</p>
            </div>
          </div>

          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};
