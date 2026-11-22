import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS } from '../../data/mockData';
import { ProductCard } from '../shop/ProductCard';
import { resolveImageUrl } from '../../lib/api';
import {
  Star,
  ShoppingCart,
  Heart,
  GitCompare,
  ShieldCheck,
  Truck,
  CheckCircle,
  ChevronRight,
  Zap,
  CreditCard,
  RotateCcw,
  Building2
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const {
    selectedProductId,
    products,
    addToCart,
    toggleWishlist,
    isInWishlist,
    addToCompare,
    setCurrentView,
    language
  } = useStore();

  const allProducts = products && products.length > 0 ? products : PRODUCTS;
  const product =
    allProducts.find(p => p.id === selectedProductId || p.slug === selectedProductId) ||
    PRODUCTS.find(p => p.id === selectedProductId) ||
    allProducts[0] ||
    PRODUCTS[0];

  const [selectedImg, setSelectedImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'emi' | 'warranty' | 'reviews'>('specs');

  const inWish = isInWishlist(product.id);
  const displayPrice = product.discountPrice || product.regularPrice || (product as any).price || 0;

  // Calculate Bank EMI options
  const emiOptions = [
    { bank: 'City Bank (Amex)', m3: Math.round(displayPrice / 3), m6: Math.round(displayPrice / 6), m12: Math.round(displayPrice / 12) },
    { bank: 'BRAC Bank', m3: Math.round(displayPrice / 3), m6: Math.round(displayPrice / 6), m12: Math.round(displayPrice / 12) },
    { bank: 'Eastern Bank (EBL)', m3: Math.round(displayPrice / 3), m6: Math.round(displayPrice / 6), m12: Math.round(displayPrice / 12) },
    { bank: 'Standard Chartered', m3: Math.round(displayPrice / 3), m6: Math.round(displayPrice / 6), m12: Math.round(displayPrice / 12) },
    { bank: 'Dutch-Bangla Bank', m3: Math.round(displayPrice / 3), m6: Math.round(displayPrice / 6), m12: Math.round(displayPrice / 12) }
  ];

  const images = (product.images && product.images.length > 0)
    ? product.images
    : ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1200&auto=format&fit=crop'];

  const shortSpecs = product.shortSpecs || [];

  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleBuyNow = () => {
    addToCart(product, quantity);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="py-6 sm:py-8 space-y-10 animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-slate-500 font-medium overflow-x-auto no-scrollbar py-1">
        <button 
          onClick={() => setCurrentView('home')} 
          className="hover:text-blue-600 transition-colors whitespace-nowrap"
        >
          {language === 'EN' ? 'Home' : 'হোম'}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <button 
          onClick={() => setCurrentView('shop')} 
          className="hover:text-blue-600 transition-colors whitespace-nowrap"
        >
          {language === 'EN' ? 'Catalog' : 'ক্যাটালগ'}
        </button>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="capitalize text-slate-700 whitespace-nowrap font-semibold">
              {product.categoryName || product.category}
            </span>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span className="font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
          {product.name}
        </span>
      </nav>

      {/* Main Product Showcase Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: High-Res Interactive Gallery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 p-6 border border-slate-200 flex items-center justify-center relative group">
            <img
              src={resolveImageUrl(images[selectedImg] || images[0])}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop';
              }}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />

            {/* Badges */}
            <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 pointer-events-none">
              <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-extrabold text-[10px] tracking-wide uppercase shadow-sm">
                100% Genuine Tech
              </span>
              {product.stockStatus === 'In Stock' && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  In Stock
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex space-x-2.5 overflow-x-auto no-scrollbar pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(idx)}
                  className={`w-16 h-16 rounded-xl border-2 p-1.5 bg-white overflow-hidden flex-shrink-0 transition-all ${
                    selectedImg === idx 
                      ? 'border-blue-600 shadow-md ring-2 ring-blue-500/20' 
                      : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                  }`}
                  aria-label={`View thumbnail ${idx + 1}`}
                >
                  <img
                    src={resolveImageUrl(img)}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop';
                    }}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Title, Specs, Pure Price, Buy CTA */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Brand & Stock */}
            <div className="flex items-center space-x-3 text-xs">
              <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-800 font-extrabold uppercase tracking-wider border border-blue-200/80">
                {product.brand || 'Authorized Hardware'}
              </span>
              <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80">
                {product.stockStatus || 'In Stock'} ({product.stockCount || 25} Units Available)
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 leading-snug tracking-tight">
              {product.name}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-slate-300'}`} 
                  />
                ))}
              </div>
              <span className="font-extrabold text-slate-900">{product.rating || 5.0} / 5.0</span>
              <span className="text-slate-400 font-bold">•</span>
              <span className="text-slate-600 font-medium">({product.reviewCount || 12} Verified Customer Reviews)</span>
            </div>

            {/* Pricing Box - Pure Price Only */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Official Selling Price</span>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                    ৳{displayPrice.toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium mt-1">
                  Net Payable Amount • Inclusive of All Applicable BD Taxes
                </p>
              </div>

              {displayPrice >= 10000 && (
                <div className="px-4 py-2.5 rounded-xl bg-white text-slate-800 text-xs font-extrabold border border-slate-300 shadow-xs flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>EMI from ৳{Math.round(displayPrice / 12).toLocaleString()}/mo</span>
                </div>
              )}
            </div>

            {/* Key Specifications Bullet Points */}
            {shortSpecs.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-900">
                  Key Specifications:
                </h4>
                <ul className="text-xs text-slate-700 font-medium space-y-1.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                  {shortSpecs.map((spec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warranty & Logistics Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center space-x-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <h5 className="font-bold text-slate-900">Official Warranty</h5>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {product.warranty || '1 Year Official Brand Warranty'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200 flex items-center space-x-3">
                <Truck className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <div>
                  <h5 className="font-bold text-slate-900">Rapid Delivery</h5>
                  <p className="text-[11px] text-slate-600 font-medium">
                    24h Inside Dhaka • 48h Courier Outside
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs (Add to Cart, Buy Now, Wishlist, Compare) */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-3">
            {/* Quantity Selector */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-300">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg font-bold text-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-10 text-center font-black text-sm text-slate-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 rounded-lg font-bold text-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={() => addToCart(product, quantity)}
              className="flex-1 bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-300 hover:border-slate-400 font-extrabold text-xs sm:text-sm py-3.5 px-5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4 text-orange-500" />
              <span>{language === 'EN' ? 'Add to Cart' : 'কার্টে যোগ করুন'}</span>
            </button>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm py-3.5 px-6 rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{language === 'EN' ? 'Buy Now' : 'এখনই কিনুন'}</span>
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product)}
              className={`p-3.5 rounded-xl border transition-all ${
                inWish 
                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm' 
                  : 'bg-white text-slate-600 hover:text-rose-500 border-slate-300 hover:border-slate-400'
              }`}
              title="Add to Wishlist"
              aria-label="Add to Wishlist"
            >
              <Heart className="w-4 h-4" />
            </button>

            {/* Compare Button */}
            <button
              onClick={() => addToCompare(product)}
              className="p-3.5 rounded-xl bg-white text-slate-600 hover:text-blue-600 border border-slate-300 hover:border-slate-400 transition-all"
              title="Add to Compare"
              aria-label="Add to Compare"
            >
              <GitCompare className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabbed Technical Details & EMI Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex space-x-3 border-b border-slate-200 pb-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === 'specs' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-700 font-bold hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Technical Specifications
          </button>

          <button
            onClick={() => setActiveTab('emi')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === 'emi' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-700 font-bold hover:bg-slate-100 border border-slate-200'
            }`}
          >
            0% Bank EMI Breakdown
          </button>

          <button
            onClick={() => setActiveTab('warranty')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === 'warranty' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-700 font-bold hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Warranty &amp; Service Policy
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === 'reviews' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-700 font-bold hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Customer Reviews ({product.reviews?.length || 0})
          </button>
        </div>

        {/* Tab 1: Technical Specifications */}
        {activeTab === 'specs' && (
          <div className="py-6 space-y-6">
            {product.specifications && Object.keys(product.specifications).length > 0 ? (
              Object.entries(product.specifications).map(([section, items]) => (
                <div key={section} className="space-y-3">
                  <h3 className="font-black text-sm text-blue-700 uppercase tracking-wider">{section}</h3>
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                    {Array.isArray(items) ? (
                      items.map((item: any, idx: number) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 p-3.5 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                          <span className="font-extrabold text-slate-800">{item.label || item.key}</span>
                          <span className="sm:col-span-2 font-medium text-slate-900 mt-1 sm:mt-0">{item.value}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3.5 bg-slate-50/60 text-slate-800">{String(items)}</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-3">
                <h3 className="font-black text-sm text-blue-700 uppercase tracking-wider">Product Features</h3>
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  {shortSpecs.map((spec, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 p-3.5 bg-slate-50/60">
                      <span className="font-extrabold text-slate-800">Feature #{idx + 1}</span>
                      <span className="sm:col-span-2 font-medium text-slate-900 mt-1 sm:mt-0">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: 0% Bank EMI Breakdown */}
        {activeTab === 'emi' && (
          <div className="py-6 space-y-5">
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">
                0% Interest Equal Monthly Installments (EMI) Available
              </p>
              <p>
                Eligible on purchases above ৳10,000 using credit cards issued by our partner banks. Choose from 3, 6, or 12 months tenures during in-store or online checkout.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 rounded-2xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-950 uppercase font-black">
                  <tr>
                    <th className="p-3.5">Partner Bank</th>
                    <th className="p-3.5">3 Months Plan</th>
                    <th className="p-3.5">6 Months Plan</th>
                    <th className="p-3.5">12 Months Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                  {emiOptions.map((opt, i) => (
                    <tr key={i} className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-bold text-blue-700">{opt.bank}</td>
                      <td className="p-3.5">৳{opt.m3.toLocaleString()}/mo</td>
                      <td className="p-3.5">৳{opt.m6.toLocaleString()}/mo</td>
                      <td className="p-3.5 font-bold text-orange-600">৳{opt.m12.toLocaleString()}/mo</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Warranty & Return Policy */}
        {activeTab === 'warranty' && (
          <div className="py-6 space-y-6 text-xs text-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
                <h4 className="font-bold text-sm text-slate-950">100% Genuine Tech</h4>
                <p className="leading-relaxed">
                  Every product sold by My Computer is sourced directly through official Bangladesh brand distributors and carries valid serial numbers.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <RotateCcw className="w-6 h-6 text-emerald-600" />
                <h4 className="font-bold text-sm text-slate-950">7-Day Replacement</h4>
                <p className="leading-relaxed">
                  If the product arrives damaged or with factory manufacturing defects, request an immediate replacement within 7 calendar days.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <Building2 className="w-6 h-6 text-purple-600" />
                <h4 className="font-bold text-sm text-slate-950">Authorized Service</h4>
                <p className="leading-relaxed">
                  Official RMA service centers available in Dhaka (Multiplan &amp; IDB), Chattogram, and Sylhet for fast warranty repairs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Customer Reviews */}
        {activeTab === 'reviews' && (
          <div className="py-6 space-y-4">
            {(!product.reviews || product.reviews.length === 0) ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
                <Star className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-800">No customer reviews yet.</p>
                <p>Be the first verified customer to share your experience with this hardware.</p>
              </div>
            ) : (
              product.reviews.map(r => (
                <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{r.userName}</span>
                    <span className="text-slate-400">{r.date}</span>
                  </div>
                  <div className="flex text-amber-500">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700">{r.comment}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Frequently Bought Together / Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-extrabold text-lg text-slate-950 tracking-tight">
              {language === 'EN' ? 'Related Hardware & Accessories' : 'সম্পর্কিত পণ্য ও যন্ত্রাংশ'}
            </h3>
            <button
              onClick={() => {
                setCurrentView('shop');
              }}
              className="text-xs font-bold text-blue-600 hover:text-orange-600 transition-colors"
            >
              {language === 'EN' ? 'View All' : 'সবগুলো দেখুন'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
