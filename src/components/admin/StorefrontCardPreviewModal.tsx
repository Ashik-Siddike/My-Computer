import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Smartphone, Monitor, ShieldCheck, ShoppingCart } from 'lucide-react';

interface StorefrontCardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null;
}

export const StorefrontCardPreviewModal: React.FC<StorefrontCardPreviewModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const displayPrice = product.discountPrice || product.regularPrice || product.price || 0;
  const image = Array.isArray(product.images) && product.images.length > 0 
    ? product.images[0] 
    : (product.image || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop');
  const shortSpecs = Array.isArray(product.shortSpecs) && product.shortSpecs.length > 0 
    ? product.shortSpecs 
    : ['Official Bangladesh Distributor Stock', '100% Genuine Sealed Tech'];

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">Live Storefront Card Preview</h3>
            </div>
            <p className="text-xs text-slate-500">
              Exact customer-facing rendering with pure actual pricing
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Switcher */}
            <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center gap-1 shadow-xs">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  device === 'desktop' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setDevice('mobile')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  device === 'mobile' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Mobile</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100 flex items-center justify-center">
          <div
            className={`transition-all duration-300 w-full ${
              device === 'mobile' ? 'max-w-xs' : 'max-w-sm'
            }`}
          >
            {/* The Storefront Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5 flex flex-col justify-between relative transition-all">
              
              {/* Badges row */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 uppercase tracking-wider">
                  {product.brand || 'Premium'}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                  (product.stockStatus || product.availability || 'In Stock') === 'In Stock'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : 'bg-red-50 text-red-700 border border-red-200/60'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    (product.stockStatus || product.availability || 'In Stock') === 'In Stock' ? 'bg-emerald-500' : 'bg-red-500'
                  }`}></span>
                  {product.stockStatus || product.availability || 'In Stock'}
                </span>
              </div>

              {/* Product Image */}
              <div className="w-full aspect-square bg-slate-50 rounded-xl overflow-hidden mb-4 flex items-center justify-center border border-slate-100 p-2">
                <img
                  src={image}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>

              {/* Title & SKU */}
              <div className="mb-3">
                <div className="text-[11px] text-slate-600 font-mono font-medium mb-1 uppercase tracking-wider">
                  SKU: {product.sku || product.productId || 'MC-PROD'}
                </div>
                <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                  {product.name}
                </h4>
              </div>

              {/* Short Specs */}
              {shortSpecs.length > 0 && (
                <div className="mb-4 space-y-1 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  {shortSpecs.slice(0, 3).map((spec: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                      <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                      <span className="line-clamp-1">{spec}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Warranty & Genuine Trust */}
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium mb-4">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{product.warranty || '1 Year Official Warranty'}</span>
              </div>

              {/* Price & Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">
                    Actual Selling Price
                  </div>
                  <div className="text-lg font-black text-slate-900 tracking-tight">
                    ৳{Number(displayPrice).toLocaleString()}
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
          <span>Target Category: <strong className="text-slate-800">{product.category || 'General'}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
