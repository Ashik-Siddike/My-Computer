import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShoppingCart, X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    setCurrentView,
    language
  } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div 
        className="fixed inset-0 cursor-pointer" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl border-l border-slate-200 z-10">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">
                {language === 'EN' ? 'Shopping Cart' : 'শপিং কার্ট'}
              </h3>
              <span className="text-[11px] text-slate-400">
                {cart.length} {cart.length === 1 ? 'item' : 'items'} selected
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3.5">
          {cart.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-base text-slate-900">
                {language === 'EN' ? 'Your cart is empty' : 'আপনার কার্ট খালি'}
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {language === 'EN' 
                  ? 'Explore our technology catalog and add genuine hardware to your bag.'
                  : 'আমাদের পণ্য ক্যাটালগ ঘুরে দেখুন এবং প্রয়োজনীয় পণ্য কার্টে যুক্ত করুন।'}
              </p>
              <button
                onClick={() => {
                  setCurrentView('shop');
                  onClose();
                }}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all"
              >
                {language === 'EN' ? 'Explore Products' : 'পণ্য দেখুন'}
              </button>
            </div>
          ) : (
            cart.map(item => {
              const itemPrice = item.product.discountPrice || item.product.regularPrice || item.product.price || 0;
              const lineTotal = itemPrice * item.quantity;

              return (
                <div
                  key={item.product.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-3.5 hover:border-slate-300 transition-all"
                >
                  <img
                    src={item.product.images[0] || 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800&auto=format&fit=crop'}
                    alt={item.product.name}
                    className="w-16 h-16 object-contain rounded-xl bg-white p-1.5 border border-slate-200/80 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 truncate" title={item.product.name}>
                      {item.product.name}
                    </h4>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-extrabold text-xs text-orange-600">
                        ৳{itemPrice.toLocaleString()}
                      </span>
                      {item.product.brand && (
                        <span className="text-[10px] bg-slate-200/70 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                          {item.product.brand}
                        </span>
                      )}
                    </div>

                    {/* Qty Counter & Remove */}
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-xs">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="p-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-l-lg transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-black text-slate-900 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="p-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-r-lg transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">
                          ৳{lineTotal.toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Order Summary */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-200 space-y-4 bg-slate-50">
            {/* Trust highlights */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-semibold bg-white p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>100% Genuine BD Stock</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span>Fast Nationwide Courier</span>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{language === 'EN' ? 'Cart Subtotal:' : 'উপমোট:'}</span>
                <span className="font-bold text-slate-900">৳{cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>{language === 'EN' ? 'Standard Delivery:' : 'ডেলিভারি চার্জ:'}</span>
                <span className="font-semibold text-slate-700">Inside Dhaka ৳120 / Outside ৳200</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-950 pt-2.5 border-t border-slate-200">
                <span>{language === 'EN' ? 'Estimated Total:' : 'সর্বমোট মূল্য:'}</span>
                <span className="text-orange-600 text-lg font-black">৳{cartSubtotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => {
                setCurrentView('checkout');
                onClose();
              }}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>{language === 'EN' ? 'Proceed to Secure Checkout' : 'নিরাপদ চেকআউট করুন'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
