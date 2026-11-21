import React, { useState, useRef } from 'react';
import type { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { ShoppingCart, Heart, GitCompare, Eye, Check, ShieldCheck, Edit2 } from 'lucide-react';
import { resolveImageUrl } from '../../lib/api';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    addToCompare,
    isInCompare,
    setQuickViewProduct,
    openProductDetail,
    setCurrentView,
    language
  } = useStore();

  const isAdmin = typeof window !== 'undefined' && !!(localStorage.getItem('mc_admin_token') || sessionStorage.getItem('mc_admin_token'));

  const [addedPulse, setAddedPulse] = useState(false);
  const inWish = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  // 3D subtle interactive tilt & lighting
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({
    rotX: 0,
    rotY: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = ((y - centerY) / centerY) * -5;
    const rotY = ((x - centerX) / centerX) * 5;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ rotX, rotY, glareX, glareY, isHovered: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rotX: 0, rotY: 0, glareX: 50, glareY: 50, isHovered: false });
  };

  const handleAddToCart = () => {
    addToCart(product, 1);
    setAddedPulse(true);
    setTimeout(() => setAddedPulse(false), 700);
  };

  // Pure selling price (No discount percentage or fake strike-through)
  const displayPrice = product.discountPrice || product.regularPrice || product.price || 0;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => openProductDetail(product.id)}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotX.toFixed(2)}deg) rotateY(${tilt.rotY.toFixed(2)}deg) translateY(${tilt.isHovered ? '-5px' : '0px'})`,
        transformStyle: 'preserve-3d',
        transition: tilt.isHovered
          ? 'transform 0.08s ease-out, box-shadow 0.25s ease'
          : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease',
      }}
      className={`product-card group bg-white rounded-2xl border flex flex-col justify-between p-4 sm:p-5 relative cursor-pointer transition-all duration-300 ${
        tilt.isHovered
          ? 'shadow-[0_20px_40px_-15px_rgba(15,23,42,0.12),0_0_15px_-3px_rgba(37,99,235,0.12)] border-blue-500/80'
          : 'border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300'
      }`}
    >
      {/* Specular glare overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 z-30 overflow-hidden"
        style={{
          opacity: tilt.isHovered ? 0.3 : 0,
          background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.1) 40%, transparent 70%)`,
        }}
      />

      {/* Top Floating Actions: Wishlist, Compare, Quick View, Admin Edit */}
      <div
        className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0"
        style={{
          transform: tilt.isHovered ? 'translateZ(30px)' : 'translateZ(0px)',
        }}
      >
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
          className={`p-2 rounded-xl backdrop-blur-md border shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            inWish
              ? 'bg-rose-500 text-white border-rose-400'
              : 'bg-white/95 text-slate-700 hover:text-rose-500 border-slate-200'
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${inWish ? 'fill-current' : ''}`} />
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); addToCompare(product); }}
          className={`p-2 rounded-xl backdrop-blur-md border shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            inCompare
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-white/95 text-slate-700 hover:text-blue-600 border-slate-200'
          }`}
          title="Compare Specifications"
        >
          <GitCompare className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
          className="p-2 rounded-xl bg-white/95 text-slate-700 hover:text-blue-600 border border-slate-200 shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Quick View"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              localStorage.setItem('mc_edit_product_id', product.id);
              setCurrentView('admin');
            }}
            className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white border border-amber-400 shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Edit in Admin Panel"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Product Image Section */}
      <div
        className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-slate-50/70 border border-slate-100 flex items-center justify-center p-3 relative group/img"
        style={{
          transform: tilt.isHovered ? 'translateZ(20px)' : 'translateZ(0px)',
        }}
      >
        <img
          src={resolveImageUrl((product.images && product.images.length > 0 ? product.images[0] : (product as unknown as { image?: string }).image))}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop';
          }}
          className="w-full h-full object-contain transform group-hover/img:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        {/* Subtle quick view hover indicator */}
        <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-xl pointer-events-none">
          <span className="bg-white/95 backdrop-blur-xs text-slate-900 text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-slate-200">
            <Eye className="w-3 h-3 text-blue-600" />
            <span>Quick View</span>
          </span>
        </div>
      </div>

      {/* Product Content Details */}
      <div
        className="space-y-2 flex-1 flex flex-col justify-between"
        style={{
          transform: tilt.isHovered ? 'translateZ(10px)' : 'translateZ(0px)',
        }}
      >
        <div>
          {/* Brand & Stock Availability Header */}
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
              {product.brand}
            </span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 ${
                product.stockStatus === 'In Stock'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${product.stockStatus === 'In Stock' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span>{product.stockStatus}</span>
            </span>
          </div>

          {/* Product Title */}
          <h3
            className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 line-clamp-2 transition-colors leading-snug tracking-tight"
          >
            {product.name}
          </h3>

          {/* Short Specifications List */}
          {Array.isArray(product.shortSpecs) && product.shortSpecs.length > 0 && (
            <ul className="text-[11px] text-slate-600 font-medium space-y-1 mt-2">
              {product.shortSpecs.slice(0, 2).map((spec, idx) => (
                <li key={idx} className="truncate flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80 flex-shrink-0" />
                  <span className="truncate">{spec}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pricing & Warranty Row */}
        <div>
          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Price
              </div>
              <div className="font-black text-base sm:text-lg text-slate-950 tracking-tight">
                ৳{displayPrice.toLocaleString()}
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                <span>{product.warranty ? product.warranty.replace('Official', 'Off.') : 'Warranty'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action: Add to Cart Button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
        style={{
          transform: tilt.isHovered ? 'translateZ(18px)' : 'translateZ(0px)',
        }}
        className={`mt-3 w-full font-bold text-xs py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] cursor-pointer ${
          addedPulse
            ? 'bg-emerald-600 text-white scale-[0.98]'
            : 'bg-slate-900 hover:bg-blue-600 text-white'
        }`}
      >
        {addedPulse ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>Added to Cart!</span>
          </>
        ) : (
          <>
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{language === 'EN' ? 'Add to Cart' : 'কার্টে যোগ করুন'}</span>
          </>
        )}
      </button>
    </div>
  );
};
