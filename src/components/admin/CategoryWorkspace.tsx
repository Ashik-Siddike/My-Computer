import React, { useState, useMemo } from 'react';
import { ProductCardItem } from './ProductCardItem';
import {
  Plus,
  Search,
  Laptop,
  Cpu,
  Monitor,
  HardDrive,
  Zap,
  Wifi,
  Camera,
  Keyboard,
  Printer,
  Gamepad2,
  Headphones,
  FolderTree,
  Package,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CategoryWorkspaceProps {
  categoryId: string;
  categoryName: string;
  categoryNameBn?: string;
  iconName: string;
  products: any[];
  token: string | null;
  onAddProduct: (categorySlug: string) => void;
  onEditProduct: (product: any) => void;
  onDuplicateProduct: (product: any) => void;
  onDeleteProduct: (product: any) => void;
  onPreviewProduct: (product: any) => void;
  onRefresh: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Laptop,
  Cpu,
  Monitor,
  HardDrive,
  Zap,
  Wifi,
  Camera,
  Keyboard,
  Printer,
  Gamepad2,
  Headphones,
  FolderTree,
};

// Category matching criteria to capture all relevant catalog items
const CATEGORY_MATCH_MAP: Record<string, string[]> = {
  'desktop-laptop': ['desktop-laptop', 'desktop', 'laptop', 'all-in-one-pc', 'business-laptop', 'gaming-laptop'],
  'components': ['components', 'component', 'processor', 'motherboard', 'ram', 'graphics-card', 'casing', 'power-supply'],
  'monitors': ['monitors', 'monitor', '4k-monitor', 'gaming-monitor'],
  'storage': ['storage', 'ssd', 'hdd', 'external-drive', 'nas'],
  'ups': ['ups', 'online-ups', 'offline-ups', 'ips'],
  'networking': ['networking', 'onu-device', 'router', 'switch', 'access-point', 'ethernet-cable'],
  'camera-security': ['camera-security', 'camera', 'security', 'cctv-security', 'ip-camera', 'dvr-nvr'],
  'accessories': ['accessories', 'keyboard-mouse', 'cable', 'converter', 'hub-dock', 'thermal-paste'],
  'printer-office': ['printer-office', 'printer', 'scanner', 'copier', 'shredder', 'tv-appliance', 'air-conditioner', 'appliance', 'office-equipment'],
  'gaming-gear': ['gaming-gear', 'gaming', 'gaming-mouse', 'gaming-keyboard', 'gaming-chair'],
  'earbuds-headphones': ['earbuds-headphones', 'headphone-audio', 'earbuds', 'headphones', 'neckband', 'wireless-earbuds'],
};

export const CategoryWorkspace: React.FC<CategoryWorkspaceProps> = ({
  categoryId,
  categoryName,
  categoryNameBn,
  iconName,
  products,
  token,
  onAddProduct,
  onEditProduct,
  onDuplicateProduct,
  onDeleteProduct,
  onPreviewProduct,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'stock'>('name');

  const IconComponent = ICON_MAP[iconName] || FolderTree;

  // Filter products belonging to this category
  const categoryProducts = useMemo(() => {
    const matchRules = CATEGORY_MATCH_MAP[categoryId] || [categoryId];
    return products.filter(p => {
      const pCat = String(p.category || '').toLowerCase();
      const pSubCat = String(p.subcategory || '').toLowerCase();
      return matchRules.some(rule => pCat.includes(rule) || pSubCat.includes(rule));
    });
  }, [products, categoryId]);

  // Compute category statistics
  const stats = useMemo(() => {
    const total = categoryProducts.length;
    let inStock = 0;
    let outOfStock = 0;
    let totalPrice = 0;

    categoryProducts.forEach(p => {
      const isAvailable = (p.stockStatus || p.availability || 'In Stock') === 'In Stock';
      if (isAvailable) inStock++;
      else outOfStock++;
      const price = Number(p.discountPrice || p.regularPrice || p.price || 0);
      totalPrice += price;
    });

    const avgPrice = total > 0 ? Math.round(totalPrice / total) : 0;
    return { total, inStock, outOfStock, avgPrice };
  }, [categoryProducts]);

  // Filtered & Sorted products for display
  const displayedProducts = useMemo(() => {
    return categoryProducts
      .filter(p => {
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = (p.name || '').toLowerCase().includes(q);
          const matchBrand = (p.brand || '').toLowerCase().includes(q);
          const matchSku = (p.sku || p.productId || '').toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchSku) return false;
        }
        // Stock filter
        if (stockFilter === 'in-stock') {
          return (p.stockStatus || p.availability || 'In Stock') === 'In Stock';
        }
        if (stockFilter === 'out-of-stock') {
          return (p.stockStatus || p.availability || 'In Stock') !== 'In Stock';
        }
        return true;
      })
      .sort((a, b) => {
        const priceA = Number(a.discountPrice || a.regularPrice || a.price || 0);
        const priceB = Number(b.discountPrice || b.regularPrice || b.price || 0);
        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'stock') {
          const stockA = Number(a.stockCount ?? a.stock ?? 0);
          const stockB = Number(b.stockCount ?? b.stock ?? 0);
          return stockB - stockA;
        }
        return (a.name || '').localeCompare(b.name || '');
      });
  }, [categoryProducts, search, stockFilter, sortBy]);

  return (
    <div className="space-y-6">
      
      {/* Category Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
              <IconComponent className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/20 mb-1.5 uppercase tracking-wider">
                Category Workspace
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {categoryName}
              </h2>
              {categoryNameBn && (
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {categoryNameBn} — Full live card management and inventory control
                </p>
              )}
            </div>
          </div>

          {/* Quick Add Product Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onAddProduct(categoryId)}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add New {categoryName} Product</span>
            </button>
          </div>
        </div>

        {/* Live Category Metrics Row */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/50 backdrop-blur-xs rounded-2xl p-3.5 border border-slate-700/60">
            <div className="text-[11px] text-slate-400 font-medium">Total Products</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {stats.total}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xs rounded-2xl p-3.5 border border-slate-700/60">
            <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>In Stock</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
              {stats.inStock}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xs rounded-2xl p-3.5 border border-slate-700/60">
            <div className="text-[11px] text-red-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>Out of Stock</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-red-400 mt-0.5">
              {stats.outOfStock}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xs rounded-2xl p-3.5 border border-slate-700/60">
            <div className="text-[11px] text-blue-300 font-medium">Average Price</div>
            <div className="text-xl sm:text-2xl font-black text-blue-300 mt-0.5">
              ৳{stats.avgPrice.toLocaleString()}
            </div>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${categoryName} by name, brand, SKU...`}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50/50 font-medium"
          />
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Stock Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                stockFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({categoryProducts.length})
            </button>
            <button
              type="button"
              onClick={() => setStockFilter('in-stock')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                stockFilter === 'in-stock' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Stock ({stats.inStock})
            </button>
            <button
              type="button"
              onClick={() => setStockFilter('out-of-stock')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                stockFilter === 'out-of-stock' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Out of Stock ({stats.outOfStock})
            </button>
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="name">Sort: Name (A-Z)</option>
            <option value="price-asc">Sort: Price (Low to High)</option>
            <option value="price-desc">Sort: Price (High to Low)</option>
            <option value="stock">Sort: Stock Quantity</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      {displayedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {displayedProducts.map(prod => (
            <ProductCardItem
              key={prod._id || prod.id || prod.productId}
              product={prod}
              token={token}
              onEdit={onEditProduct}
              onDuplicate={onDuplicateProduct}
              onDelete={onDeleteProduct}
              onPreview={onPreviewProduct}
              onUpdateSuccess={onRefresh}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            No products found in {categoryName}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            {search.trim()
              ? `No products matched "${search}". Try adjusting your search query.`
              : `Start by adding genuine ${categoryName} items with pure selling prices.`}
          </p>
          <button
            type="button"
            onClick={() => onAddProduct(categoryId)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add First {categoryName} Product</span>
          </button>
        </div>
      )}

    </div>
  );
};
