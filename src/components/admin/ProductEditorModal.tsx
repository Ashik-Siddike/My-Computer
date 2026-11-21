import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../../context/StoreContext';
import { resolveImageUrl } from '../../lib/api';
import {
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Layers,
  DollarSign,
  Eye,
  Tag,
  Package,
  Sparkles
} from 'lucide-react';

interface ProductEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null;
  onSaveSuccess: () => void;
  defaultCategory?: string;
}

export const ProductEditorModal: React.FC<ProductEditorModalProps> = ({
  isOpen,
  onClose,
  product,
  onSaveSuccess,
  defaultCategory = 'camera',
}) => {
  const { addToast } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'images' | 'specs' | 'display' | 'preview'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Media Library Modal within editor
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    slug: '',
    brand: 'Asus',
    model: '',
    sku: '',
    category: defaultCategory,
    categoryName: '',
    subcategory: '',
    description: '',
    price: '',
    costPrice: '',
    stock: '10',
    availability: 'In Stock',
    warranty: '1 Year Official Warranty',
    image: '',
    images: [] as string[],
    shortSpecs: [] as string[],
    specifications: {} as Record<string, Array<{ label: string; value: string }>>,
    isFeatured: false,
    isVisible: true,
    displayOrder: 0,
    badge: '',
    emiAvailable: true,
  });

  // Short spec input
  const [newShortSpec, setNewShortSpec] = useState('');
  // Spec section inputs
  const [newSpecSection, setNewSpecSection] = useState('');
  const [newSpecLabel, setNewSpecLabel] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  useEffect(() => {
    if (product) {
      const p = product;
      const imagesArr = Array.isArray(p.images) && p.images.length > 0 
        ? p.images 
        : [p.image || 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800&auto=format&fit=crop'];

      setForm({
        name: p.name || '',
        slug: p.slug || '',
        brand: p.brand || 'Other',
        model: p.model || p.sku || '',
        sku: p.sku || p.productId || p.id || '',
        category: p.category || defaultCategory,
        categoryName: p.categoryName || '',
        subcategory: p.subcategory || '',
        description: p.description || '',
        price: String(p.discountPrice || p.regularPrice || p.price || ''),
        costPrice: String(p.costPrice || ''),
        stock: String(p.stockCount ?? p.stock ?? 10),
        availability: p.stockStatus || p.availability || 'In Stock',
        warranty: p.warranty || '1 Year Official Warranty',
        image: imagesArr[0] || '',
        images: imagesArr,
        shortSpecs: Array.isArray(p.shortSpecs) ? [...p.shortSpecs] : [],
        specifications: p.specifications ? JSON.parse(JSON.stringify(p.specifications)) : {},
        isFeatured: !!p.isFeatured,
        isVisible: p.isVisible !== undefined ? !!p.isVisible : true,
        displayOrder: Number(p.displayOrder || 0),
        badge: p.badge || '',
        emiAvailable: p.emiAvailable !== undefined ? !!p.emiAvailable : true,
      });
    } else {
      setForm({
        name: '',
        slug: '',
        brand: 'Apple',
        model: '',
        sku: `SKU-${Date.now().toString().slice(-6)}`,
        category: defaultCategory,
        categoryName: '',
        subcategory: '',
        description: '',
        price: '',
        costPrice: '',
        stock: '15',
        availability: 'In Stock',
        warranty: '1 Year Official Warranty',
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop'],
        shortSpecs: ['100% Genuine Technology Item', 'Official Bangladesh Distributor Warranty'],
        specifications: {
          'General Specifications': [
            { label: 'Brand Origin', value: 'International Brand' },
            { label: 'Warranty Policy', value: 'Official Warranty' }
          ]
        },
        isFeatured: false,
        isVisible: true,
        displayOrder: 0,
        badge: '',
        emiAvailable: true,
      });
    }
    setErrorMessage(null);
    setActiveTab('basic');
  }, [product, defaultCategory, isOpen]);

  // Upload image handler
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'].includes(file.type)) {
      setErrorMessage('Invalid file type. Please upload JPG, PNG, or WebP images.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit. Please upload an optimized image.');
      return;
    }

    setUploadLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('mc_admin_token') || sessionStorage.getItem('mc_admin_token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();
      const chosenUrl = data.url || data.dataUri || data.fileUrl;
      if (res.ok && data.success && chosenUrl) {
        setForm(prev => {
          const updatedImages = [chosenUrl, ...prev.images.filter(x => x !== chosenUrl)];
          return {
            ...prev,
            image: chosenUrl,
            images: updatedImages,
          };
        });
        addToast('Image Uploaded', 'Product image uploaded and attached to card', 'success');
      } else {
        setErrorMessage(data.error || 'Failed to upload image');
      }
    } catch (err: any) {
      console.error('[Upload Error]:', err);
      setErrorMessage(err.message || 'Network error while uploading image');
    } finally {
      setUploadLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Fetch Media Library
  const fetchMediaLibrary = async () => {
    setMediaLoading(true);
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (data.success && Array.isArray(data.files)) {
        setMediaFiles(data.files);
      }
    } catch (err) {
      console.warn('[Fetch Media Error]:', err);
    } finally {
      setMediaLoading(false);
    }
  };

  // Specs helper functions
  const handleAddShortSpec = () => {
    if (!newShortSpec.trim()) return;
    setForm(prev => ({ ...prev, shortSpecs: [...prev.shortSpecs, newShortSpec.trim()] }));
    setNewShortSpec('');
  };

  const handleRemoveShortSpec = (index: number) => {
    setForm(prev => ({
      ...prev,
      shortSpecs: prev.shortSpecs.filter((_, i) => i !== index),
    }));
  };

  const handleAddSpecItem = (section: string) => {
    if (!newSpecLabel.trim() || !newSpecValue.trim()) return;
    setForm(prev => {
      const currentSection = prev.specifications[section] || [];
      return {
        ...prev,
        specifications: {
          ...prev.specifications,
          [section]: [...currentSection, { label: newSpecLabel.trim(), value: newSpecValue.trim() }],
        },
      };
    });
    setNewSpecLabel('');
    setNewSpecValue('');
  };

  const handleRemoveSpecItem = (section: string, itemIdx: number) => {
    setForm(prev => {
      const currentSection = prev.specifications[section] || [];
      const updated = currentSection.filter((_, i) => i !== itemIdx);
      const nextSpecs = { ...prev.specifications };
      if (updated.length === 0) {
        delete nextSpecs[section];
      } else {
        nextSpecs[section] = updated;
      }
      return { ...prev, specifications: nextSpecs };
    });
  };

  const handleAddSpecSection = () => {
    if (!newSpecSection.trim()) return;
    setForm(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [newSpecSection.trim()]: [],
      },
    }));
    setNewSpecSection('');
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!form.name.trim()) {
      setErrorMessage('Please enter a product name.');
      return;
    }

    const priceNum = Number(form.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMessage('Please enter a valid product price.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('mc_admin_token') || sessionStorage.getItem('mc_admin_token');
      const isEdit = !!product;
      const targetId = isEdit ? (product.productId || product.id || product._id) : `prod-${Date.now()}`;
      const url = isEdit ? `/api/products/${targetId}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        productId: targetId,
        id: targetId,
        name: form.name.trim(),
        slug: form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        brand: form.brand,
        model: form.model || form.sku,
        sku: form.sku,
        category: form.category,
        categoryName: form.categoryName || form.category.toUpperCase(),
        subcategory: form.subcategory,
        description: form.description,
        price: priceNum,
        regularPrice: priceNum,
        salePrice: priceNum,
        discountPrice: priceNum,
        discountPercentage: 0, // Enforcing pure price
        costPrice: Number(form.costPrice) || 0,
        stock: Number(form.stock) || 10,
        stockCount: Number(form.stock) || 10,
        availability: form.availability,
        stockStatus: form.availability,
        warranty: form.warranty,
        image: form.image || (form.images[0] || ''),
        images: form.images.length > 0 ? form.images : [form.image],
        shortSpecs: form.shortSpecs,
        specifications: form.specifications,
        isFeatured: form.isFeatured,
        isVisible: form.isVisible,
        displayOrder: Number(form.displayOrder) || 0,
        badge: form.badge,
        emiAvailable: form.emiAvailable,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast(
          isEdit ? 'Product Updated' : 'Product Created',
          `"${form.name.slice(0, 32)}" saved successfully and synchronized with website.`,
          'success'
        );
        onSaveSuccess();
        onClose();
      } else {
        setErrorMessage(data.error || 'Failed to save product changes');
      }
    } catch (err: any) {
      console.error('[Product Submit Error]:', err);
      setErrorMessage(err.message || 'Network error while saving product');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative animate-scaleUp">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight text-white">
                {product ? 'Edit Product Card' : 'Create New Product Card'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Directly manages live MongoDB and storefront catalog records
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Organized Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 border-b border-slate-200 bg-slate-50 overflow-x-auto no-scrollbar flex-shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'basic' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>1. Basic Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pricing' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>2. Pricing &amp; Stock</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('images')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'images' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>3. Images &amp; Upload</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'specs' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4. Specifications</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('display')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'display' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>5. Display &amp; Status</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'preview' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>6. Live Card Preview</span>
          </button>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* ──────────────── TAB 1: BASIC INFORMATION ──────────────── */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    Product Title (Displayed on Card) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Sony WH-1000XM5 Wireless Noise Canceling Headphones"
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={e => setForm({ ...form, brand: e.target.value })}
                    placeholder="e.g. Sony, Apple, Bose, ASUS"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="desktop-laptop">Desktop &amp; Laptop</option>
                    <option value="components">Components (CPU, GPU, RAM)</option>
                    <option value="monitors">Monitors</option>
                    <option value="storage">Storage &amp; SSD</option>
                    <option value="ups">UPS &amp; Power</option>
                    <option value="networking">Networking (Routers, ONU)</option>
                    <option value="camera">Camera &amp; Security</option>
                    <option value="accessories">Accessories</option>
                    <option value="printer-office">Printer &amp; Office</option>
                    <option value="gaming">Gaming Gear</option>
                    <option value="earbuds-headphones">Earbuds &amp; Headphones</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subcategory / Segment</label>
                  <input
                    type="text"
                    value={form.subcategory}
                    onChange={e => setForm({ ...form, subcategory: e.target.value })}
                    placeholder="e.g. Wireless Earbuds, Wi-Fi 6 Routers, Over-Ear"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">SKU / Model Number</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={e => setForm({ ...form, sku: e.target.value })}
                    placeholder="e.g. WH1000XM5/B"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Product Description</label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Enter complete product description and features..."
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── TAB 2: PRICING & STOCK ──────────────── */}
          {activeTab === 'pricing' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 font-medium">
                <span className="font-bold">Pure Pricing Architecture:</span> Products display their exact actual selling price in BDT. No promotional discounts or strike-through labels.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Selling Price (BDT ৳) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">৳</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                      placeholder="e.g. 38500"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-black text-base focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cost Price (Admin Internal)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">৳</span>
                    <input
                      type="number"
                      min="0"
                      value={form.costPrice}
                      onChange={e => setForm({ ...form, costPrice: e.target.value })}
                      placeholder="e.g. 32000"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Status Pill</label>
                  <select
                    value={form.availability}
                    onChange={e => setForm({ ...form, availability: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="In Stock">In Stock (সবুজ ব্যাজ)</option>
                    <option value="Limited Stock">Limited Stock (অরেঞ্জ ব্যাজ)</option>
                    <option value="Out of Stock">Out of Stock (লাল ব্যাজ)</option>
                    <option value="Pre-Order">Pre-Order (নীল ব্যাজ)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Official Warranty Text</label>
                  <input
                    type="text"
                    value={form.warranty}
                    onChange={e => setForm({ ...form, warranty: e.target.value })}
                    placeholder="e.g. 1 Year Official Brand Warranty"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── TAB 3: IMAGES & UPLOAD ──────────────── */}
          {activeTab === 'images' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Drag and Drop Upload Area */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 hover:border-blue-600 rounded-3xl p-6 sm:p-8 bg-blue-50/40 hover:bg-blue-50/70 transition-all text-center cursor-pointer flex flex-col items-center justify-center space-y-2 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-14 h-14 rounded-2xl bg-white shadow-md text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {uploadLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>

                <h4 className="font-extrabold text-slate-900 text-sm">
                  {uploadLoading ? 'Uploading Image to Server...' : 'Click to Upload from Computer or Drag & Drop'}
                </h4>
                <p className="text-slate-500 text-[11px]">
                  Supports JPG, PNG, and WebP (up to 10MB). Stored directly in server/uploads.
                </p>
              </div>

              {/* Direct Image URL input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Or paste external image URL..."
                  value={form.image}
                  onChange={e => {
                    const url = e.target.value.trim();
                    setForm(prev => ({
                      ...prev,
                      image: url,
                      images: url ? [url, ...prev.images.filter(x => x !== url)] : prev.images,
                    }));
                  }}
                  className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-600"
                />

                <button
                  type="button"
                  onClick={() => {
                    setMediaLibraryOpen(true);
                    fetchMediaLibrary();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Choose from Library</span>
                </button>
              </div>

              {/* Gallery Thumbnails List */}
              <div className="space-y-2">
                <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Attached Product Images ({form.images.length})
                </h5>
                <div className="flex flex-wrap gap-3">
                  {form.images.map((imgUrl, i) => (
                    <div
                      key={i}
                      className={`relative w-24 h-24 rounded-2xl border-2 p-1.5 bg-white shadow-xs group ${
                        form.image === imgUrl ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200'
                      }`}
                    >
                      <img
                        src={resolveImageUrl(imgUrl)}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop';
                        }}
                        className="w-full h-full object-contain rounded-xl"
                      />

                      {/* Select as Primary */}
                      {form.image !== imgUrl && (
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, image: imgUrl })}
                          className="absolute bottom-1 left-1 right-1 py-0.5 rounded bg-blue-600 text-white font-black text-[9px] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Make Primary
                        </button>
                      )}

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => {
                          const filtered = form.images.filter((_, idx) => idx !== i);
                          setForm({
                            ...form,
                            images: filtered,
                            image: form.image === imgUrl ? (filtered[0] || '') : form.image,
                          });
                        }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow hover:bg-red-700 cursor-pointer"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── TAB 4: SPECIFICATIONS ──────────────── */}
          {activeTab === 'specs' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Short Features List */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Card Bullet Specifications (Displayed on product card &amp; details)</span>
                </h5>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newShortSpec}
                    onChange={e => setNewShortSpec(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddShortSpec();
                      }
                    }}
                    placeholder="e.g. Industry-leading Active Noise Cancellation with 8 mics"
                    className="flex-1 p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-medium text-xs focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddShortSpec}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  {form.shortSpecs.map((spec, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold text-xs">
                      <span>• {spec}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveShortSpec(i)}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Specifications Sections Builder */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Full Technical Specification Table Builder
                  </h5>

                  {/* Add New Section */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="New Section Name (e.g. Audio Drivers)"
                      value={newSpecSection}
                      onChange={e => setNewSpecSection(e.target.value)}
                      className="p-1.5 rounded-lg border border-slate-300 text-xs bg-slate-50"
                    />
                    <button
                      type="button"
                      onClick={handleAddSpecSection}
                      className="bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-blue-600 cursor-pointer"
                    >
                      + Add Section
                    </button>
                  </div>
                </div>

                {Object.keys(form.specifications).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No technical specification sections added yet.</p>
                ) : (
                  Object.entries(form.specifications).map(([section, items]) => (
                    <div key={section} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h6 className="font-extrabold text-blue-700 text-xs uppercase">{section}</h6>
                        <button
                          type="button"
                          onClick={() => {
                            const next = { ...form.specifications };
                            delete next[section];
                            setForm({ ...form, specifications: next });
                          }}
                          className="text-red-500 text-[11px] font-bold hover:underline"
                        >
                          Delete Section
                        </button>
                      </div>

                      {/* Items List */}
                      <div className="divide-y divide-slate-100 text-xs">
                        {Array.isArray(items) && items.map((item, idx) => (
                          <div key={idx} className="py-2 flex items-center justify-between">
                            <span className="font-bold text-slate-700">{item.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900">{item.value}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSpecItem(section, idx)}
                                className="text-slate-400 hover:text-red-600"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Item Row */}
                      <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-100">
                        <input
                          type="text"
                          placeholder="Label (e.g. Battery Life)"
                          value={newSpecLabel}
                          onChange={e => setNewSpecLabel(e.target.value)}
                          className="col-span-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. 30 Hours)"
                          value={newSpecValue}
                          onChange={e => setNewSpecValue(e.target.value)}
                          className="col-span-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSpecItem(section)}
                          className="bg-blue-600 text-white font-bold text-xs py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
                        >
                          Add Item
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ──────────────── TAB 5: DISPLAY & STATUS ──────────────── */}
          {activeTab === 'display' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Visibility &amp; Badges</h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-900 block">Published on Live Website</span>
                      <span className="text-[11px] text-slate-500">Uncheck to hide product from customers</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.isVisible}
                      onChange={e => setForm({ ...form, isVisible: e.target.checked })}
                      className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-900 block">Featured on Homepage</span>
                      <span className="text-[11px] text-slate-500">Highlight in homepage tech showcases</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                      className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                    />
                  </label>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Corner Badge Label</label>
                    <input
                      type="text"
                      value={form.badge}
                      onChange={e => setForm({ ...form, badge: e.target.value })}
                      placeholder="e.g. Best Seller, Pro Grade, New Arrival"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Display Sort Priority</label>
                    <input
                      type="number"
                      value={form.displayOrder}
                      onChange={e => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── TAB 6: LIVE CARD PREVIEW ──────────────── */}
          {activeTab === 'preview' && (
            <div className="flex flex-col items-center justify-center py-6 animate-fadeIn">
              <span className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">
                Real-Time Storefront Card Appearance
              </span>

              {/* Exact Card Preview */}
              <div className="w-full max-w-xs bg-white rounded-2xl border border-slate-200 p-4 shadow-xl space-y-3">
                <div className="relative aspect-[4/3] rounded-xl bg-slate-50 overflow-hidden p-2 flex items-center justify-center border border-slate-100">
                  <img
                    src={resolveImageUrl(form.image || form.images[0])}
                    alt={form.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800&auto=format&fit=crop';
                    }}
                    className="w-full h-full object-contain"
                  />
                  {form.badge && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-blue-600 text-white font-extrabold text-[9px] uppercase">
                      {form.badge}
                    </span>
                  )}
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[9px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {form.availability}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                    {form.brand}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-950 line-clamp-2 mt-0.5">
                    {form.name || 'Product Title'}
                  </h4>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Price</span>
                    <span className="font-black text-lg text-slate-950">
                      ৳{Number(form.price || 0).toLocaleString()}
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-[10px]">
                    Official BD
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Modal Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Product Card</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Nested Media Library Selector Modal */}
        {mediaLibraryOpen && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-xs flex flex-col p-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <span>Media Library (Select an Image)</span>
              </h4>
              <button
                type="button"
                onClick={() => setMediaLibraryOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {mediaLoading ? (
                <div className="text-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                </div>
              ) : mediaFiles.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs">
                  No uploaded media files found in the library.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {mediaFiles.map((m, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setForm(prev => ({
                          ...prev,
                          image: m.url,
                          images: [m.url, ...prev.images.filter(x => x !== m.url)],
                        }));
                        setMediaLibraryOpen(false);
                      }}
                      className="p-2 rounded-xl border border-slate-200 hover:border-blue-600 hover:shadow-md cursor-pointer transition-all flex flex-col items-center bg-slate-50"
                    >
                      <img src={m.url} alt="" className="w-20 h-20 object-contain rounded-lg" />
                      <span className="text-[10px] text-slate-500 font-mono truncate w-full text-center mt-1">
                        {m.filename}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
};
