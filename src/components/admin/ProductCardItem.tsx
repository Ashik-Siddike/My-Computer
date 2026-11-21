import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Upload,
  Edit2,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface ProductCardItemProps {
  product: any;
  token: string | null;
  onEdit: (product: any) => void;
  onDuplicate: (product: any) => void;
  onDelete: (product: any) => void;
  onPreview: (product: any) => void;
  onUpdateSuccess: () => void;
}

export const ProductCardItem: React.FC<ProductCardItemProps> = ({
  product,
  token,
  onEdit,
  onDuplicate,
  onDelete,
  onPreview,
  onUpdateSuccess,
}) => {
  const { addToast } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [updatingStock, setUpdatingStock] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);

  // Inline Price Editing
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const currentPrice = product.discountPrice || product.regularPrice || product.price || 0;
  const [priceInput, setPriceInput] = useState(String(currentPrice));
  const [savingPrice, setSavingPrice] = useState(false);

  const productId = product._id || product.id || product.productId;
  const image = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : (product.image || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop');
  const isVisible = product.isVisible !== false;
  const stockStatus = product.stockStatus || product.availability || 'In Stock';
  const isInStock = stockStatus === 'In Stock';

  // 1. Direct Image Replace from Computer
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!token) {
      addToast('Error', 'Admin authentication required', 'warning');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success || !uploadData.url) {
        throw new Error(uploadData.error || 'Failed to upload image file');
      }

      const uploadedUrl = uploadData.url;

      // Update product record in DB
      const currentImages = Array.isArray(product.images) ? [...product.images] : [];
      const updatedImages = [uploadedUrl, ...currentImages.slice(1)];

      const updateRes = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          image: uploadedUrl,
          images: updatedImages,
        }),
      });

      const updateData = await updateRes.json();
      if (updateRes.ok && updateData.success) {
        addToast('Image Replaced!', 'Product image updated and synced to database');
        onUpdateSuccess();
      } else {
        throw new Error(updateData.error || 'Failed to update product image');
      }
    } catch (err: any) {
      addToast('Upload Failed', err.message || 'Could not replace product image', 'warning');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 2. Stock Status Toggle
  const handleToggleStock = async () => {
    if (!token) return;
    setUpdatingStock(true);
    const nextStatus = isInStock ? 'Out of Stock' : 'In Stock';
    const nextCount = isInStock ? 0 : 15;

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stockStatus: nextStatus,
          availability: nextStatus,
          stock: nextCount,
          stockCount: nextCount,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Stock Status Updated', `${product.name} is now marked ${nextStatus}`);
        onUpdateSuccess();
      } else {
        throw new Error(data.error || 'Failed to update stock status');
      }
    } catch (err: any) {
      addToast('Update Failed', err.message, 'warning');
    } finally {
      setUpdatingStock(false);
    }
  };

  // 3. Visibility Toggle
  const handleToggleVisibility = async () => {
    if (!token) return;
    setUpdatingVisibility(true);
    const nextVisibility = !isVisible;

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isVisible: nextVisibility,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast(
          nextVisibility ? 'Card Visible' : 'Card Hidden',
          `${product.name} is now ${nextVisibility ? 'published' : 'hidden from public view'}`
        );
        onUpdateSuccess();
      } else {
        throw new Error(data.error || 'Failed to toggle visibility');
      }
    } catch (err: any) {
      addToast('Update Failed', err.message, 'warning');
    } finally {
      setUpdatingVisibility(false);
    }
  };

  // 4. Inline Price Save
  const handleSavePrice = async () => {
    const numericPrice = parseFloat(priceInput);
    if (isNaN(numericPrice) || numericPrice < 0) {
      addToast('Invalid Price', 'Please enter a valid positive number', 'warning');
      return;
    }

    if (!token) return;
    setSavingPrice(true);

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          price: numericPrice,
          regularPrice: numericPrice,
          discountPrice: numericPrice,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Price Saved', `Price updated to ৳${numericPrice.toLocaleString()}`);
        setIsEditingPrice(false);
        onUpdateSuccess();
      } else {
        throw new Error(data.error || 'Failed to save price');
      }
    } catch (err: any) {
      addToast('Save Failed', err.message, 'warning');
    } finally {
      setSavingPrice(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden group shadow-xs hover:shadow-md ${
        !isVisible ? 'border-amber-200/90 bg-amber-50/20 opacity-80' : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      {/* Hidden File Input for Image Replacement */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Card Content Top */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Top Badges & Visibility */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
              {product.brand || 'Tech'}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
              {product.category || 'General'}
            </span>
          </div>

          {/* Quick Visibility & Stock status pills */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleVisibility}
              disabled={updatingVisibility}
              title={isVisible ? 'Card is published on website' : 'Card is hidden from public view'}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isVisible
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              {updatingVisibility ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isVisible ? (
                <Eye className="w-3.5 h-3.5" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleToggleStock}
              disabled={updatingStock}
              title="Click to toggle stock status"
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                isInStock
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
              }`}
            >
              {updatingStock ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <span className={`w-1.5 h-1.5 rounded-full ${isInStock ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              )}
              <span>{stockStatus}</span>
            </button>
          </div>
        </div>

        {/* Product Image with Direct Hover Replace Button */}
        <div className="relative w-full aspect-square bg-slate-50 rounded-xl overflow-hidden mb-3.5 border border-slate-100 flex items-center justify-center p-2 group/img">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
          />

          {uploadingImage && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-2">
              <Loader2 className="w-6 h-6 animate-spin mb-1 text-blue-400" />
              <span className="text-[11px] font-bold">Uploading...</span>
            </div>
          )}

          {/* Direct Replace Image Overlay Button */}
          {!uploadingImage && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-x-2 bottom-2 py-2 px-3 rounded-lg bg-slate-900/85 hover:bg-slate-950 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition-all shadow-md backdrop-blur-xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Replace Image</span>
            </button>
          )}
        </div>

        {/* SKU & Name */}
        <div className="mb-2">
          <div className="text-[10px] text-slate-600 font-mono font-medium uppercase tracking-wider mb-0.5">
            SKU: {product.sku || product.productId || 'MC-ITEM'}
          </div>
          <h4
            onClick={() => onEdit(product)}
            className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h4>
        </div>

        {/* Short Specs / Highlights */}
        {Array.isArray(product.shortSpecs) && product.shortSpecs.length > 0 && (
          <div className="mb-3 space-y-1">
            {product.shortSpecs.slice(0, 2).map((sp: string, idx: number) => (
              <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0"></span>
                <span className="truncate">{sp}</span>
              </div>
            ))}
          </div>
        )}

        {/* Inline Price Update & Stock Indicator */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">
              Selling Price
            </div>

            {isEditingPrice ? (
              <div className="flex items-center gap-1 mt-0.5">
                <input
                  type="number"
                  value={priceInput}
                  onChange={e => setPriceInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSavePrice();
                    if (e.key === 'Escape') setIsEditingPrice(false);
                  }}
                  autoFocus
                  className="w-24 px-2 py-1 text-xs font-bold border border-blue-500 rounded-md focus:outline-hidden bg-blue-50/40"
                />
                <button
                  type="button"
                  onClick={handleSavePrice}
                  disabled={savingPrice}
                  className="p-1 rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  title="Save price"
                >
                  {savingPrice ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingPrice(false)}
                  className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 group/price mt-0.5">
                <span className="text-base font-black text-slate-900 tracking-tight">
                  ৳{Number(currentPrice).toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPriceInput(String(currentPrice));
                    setIsEditingPrice(true);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover/price:opacity-100 transition-opacity cursor-pointer"
                  title="Quick edit price"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-600 font-medium">Stock Count</div>
            <div className="text-xs font-bold text-slate-700">
              {product.stockCount ?? product.stock ?? 10} Units
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Toolbar */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5">
        <button
          type="button"
          onClick={() => onPreview(product)}
          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-white transition-colors cursor-pointer"
          title="Preview storefront card"
        >
          <ExternalLink className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onDuplicate(product)}
          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-white transition-colors cursor-pointer"
          title="Duplicate card record"
        >
          <Copy className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onEdit(product)}
          className="flex-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>

        <button
          type="button"
          onClick={() => onDelete(product)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          title="Delete card"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
