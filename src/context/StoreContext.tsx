import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product, Category, CartItem, FilterState, ViewMode, Order, Coupon, PCBuildComponent, SiteCard, CardSection } from '../types';
import { PRODUCTS, CATEGORIES, MOCK_COUPONS } from '../data/mockData';

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
}

interface StoreContextType {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  openProductDetail: (id: string) => void;

  // Theme & Language
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: 'EN' | 'BN';
  toggleLanguage: () => void;

  // Search & Modals
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  aiSearchOpen: boolean;
  setAiSearchOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  appliedCoupon: Coupon | null;
  couponDiscountBDT: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  cartTotal: number;

  // Wishlist & Compare
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;

  // PC Builder State
  pcBuildComponents: PCBuildComponent[];
  addPCComponent: (slotId: string, product: Product) => void;
  removePCComponent: (slotId: string) => void;
  clearPCBuild: () => void;
  pcBuildTotalBDT: number;
  pcBuildTotalWattage: number;
  pcBuildCompatibilityIssue: string | null;
  addAllPCToCart: () => void;

  // Products & Categories (Dynamic Live Database Store)
  products: Product[];
  categories: Category[];
  refreshProducts: () => Promise<void>;
  refreshCategories: () => Promise<void>;

  // Cards (Dynamic Live Database Store)
  cards: SiteCard[];
  refreshCards: () => Promise<void>;
  getCardsBySection: (section: CardSection) => SiteCard[];

  // Website Settings (Dynamic Live Database Store)
  siteSettings: any;
  refreshSettings: () => Promise<void>;
  updateSiteSettings: (updates: any) => Promise<boolean>;

  // Filters & Catalog
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  filteredProducts: Product[];

  // Orders & Account
  orders: Order[];
  createOrder: (orderData: Partial<Order>) => Order;
  placeOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    shippingAddress: string;
    area?: string;
    district: string;
    additionalNote?: string;
    paymentMethod?: string;
    paymentNumber?: string;
    senderNumber?: string;
    trxId?: string;
  }) => Promise<{ success: boolean; orderId?: string; order?: Order; error?: string }>;
  fetchLiveOrder: (query: string) => Promise<Order | null>;
  activeTrackingId: string;
  setActiveTrackingId: (id: string) => void;

  // Toasts
  toasts: Toast[];
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
}

const initialFilters: FilterState = {
  category: null,
  brand: [],
  priceRange: [0, 500000],
  stockOnly: false,
  gamingOnly: false,
  emiOnly: false,
  rating: null,
  searchQuery: '',
  sortBy: 'featured'
};

const initialPCComponents: PCBuildComponent[] = [
  { slotId: 'cpu', slotName: 'Processor (CPU)', slotNameBn: 'প্রসেসর', icon: 'Cpu', product: null },
  { slotId: 'motherboard', slotName: 'Motherboard', slotNameBn: 'মাদারবোর্ড', icon: 'HardDrive', product: null },
  { slotId: 'ram', slotName: 'Memory (RAM)', slotNameBn: 'র‌্যাম', icon: 'MemoryStick', product: null },
  { slotId: 'gpu', slotName: 'Graphics Card (GPU)', slotNameBn: 'গ্রাফিক্স কার্ড', icon: 'CircuitBoard', product: null },
  { slotId: 'storage', slotName: 'Storage (SSD/HDD)', slotNameBn: 'স্টোরেজ', icon: 'Database', product: null },
  { slotId: 'psu', slotName: 'Power Supply (PSU)', slotNameBn: 'পাওয়ার সাপ্লাই', icon: 'Zap', product: null },
  { slotId: 'cooler', slotName: 'CPU Cooler', slotNameBn: 'সিপিইউ কুলার', icon: 'Fan', product: null },
  { slotId: 'case', slotName: 'Casing / Chassis', slotNameBn: 'কেসিং', icon: 'Box', product: null },
  { slotId: 'fans', slotName: 'Case Fans', slotNameBn: 'কেস ফ্যান', icon: 'Fan', product: null },
  { slotId: 'monitor', slotName: 'Monitor', slotNameBn: 'মনিটর', icon: 'Monitor', product: null },
  { slotId: 'keyboard', slotName: 'Keyboard', slotNameBn: 'কীবোর্ড', icon: 'Keyboard', product: null },
  { slotId: 'mouse', slotName: 'Mouse', slotNameBn: 'মাউস', icon: 'Mouse', product: null },
  { slotId: 'accessories', slotName: 'UPS & Accessories', slotNameBn: 'ইউপিএস ও এক্সেসরিজ', icon: 'Plug', product: null },
];

function getViewFromUrl(): ViewMode {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
  const segment = path.split('/')[0] || hash.split('/')[0] || '';

  if (segment === 'admin' || segment === 'admin-dashboard' || segment === 'admin-panel') return 'admin';
  if (segment === 'cart') return 'cart';
  if (segment === 'checkout') return 'checkout';
  if (segment === 'pc-builder') return 'pc-builder';
  if (segment === 'compare') return 'compare';
  if (segment === 'order-tracking' || segment === 'track-order' || segment === 'tracking') return 'order-tracking';
  if (segment === 'user-dashboard' || segment === 'profile' || segment === 'account') return 'user-dashboard';
  if (segment === 'shop' || segment === 'products') return 'shop';
  if (segment === 'offers') return 'offers';
  if (segment === 'about') return 'about';
  if (segment === 'contact') return 'contact';
  if (segment === 'store-locator') return 'store-locator';
  if (segment === 'blog') return 'blog';
  if (segment === 'lg-monitors') return 'lg-monitors';
  if (segment === 'asus-monitors') return 'asus-monitors';
  if (segment === 'samsung-monitors') return 'samsung-monitors';

  return 'home';
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentViewState] = useState<ViewMode>(getViewFromUrl);

  const setCurrentView = (view: ViewMode) => {
    setCurrentViewState(view);
    if (typeof window !== 'undefined') {
      const targetPath = view === 'home' ? '/' : '/' + view;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view }, '', targetPath);
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const nextView = getViewFromUrl();
      setCurrentViewState(nextView);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<'EN' | 'BN'>('EN');

  // Live Products and Categories State
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [cards, setCards] = useState<SiteCard[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [aiSearchOpen, setAiSearchOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [compareList, setCompareList] = useState<Product[]>([]);

  const [pcBuildComponents, setPcBuildComponents] = useState<PCBuildComponent[]>(initialPCComponents);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('mc_customer_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTrackingId, setActiveTrackingId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('mc_customer_orders');
      const list = saved ? JSON.parse(saved) : [];
      return list.length > 0 ? (list[0].id || list[0].orderId || '') : '';
    } catch {
      return '';
    }
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Fetch dynamic categories from database / API
  const refreshCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      }
    } catch (err) {
      console.warn('[refreshCategories error]:', err);
    }
  }, []);

  // Fetch dynamic products from database / API
  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products?limit=1000');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          const mapped: Product[] = data.products.map((p: any) => ({
            id: p.productId || p.id,
            name: p.name,
            slug: p.slug || p.id,
            brand: p.brand || 'Other',
            category: p.category || 'camera',
            categoryName: p.categoryName || (p.category || 'camera').toUpperCase(),
            subcategory: p.subcategory || '',
            badge: p.badge || '',
            regularPrice: Number(p.regularPrice || p.price || 0),
            discountPrice: Number(p.discountPrice || p.salePrice || p.price || 0),
            discountPercentage: Number(p.discountPercentage || 0),
            rating: Number(p.rating || 5.0),
            reviewCount: Number(p.reviewCount || 0),
            stockStatus: (p.stockStatus || p.availability || 'In Stock') as any,
            stockCount: Number(p.stockCount ?? p.stock ?? 10),
            isFeatured: !!p.isFeatured,
            isFlashSale: !!p.isFlashSale,
            isGaming: !!p.isGaming,
            isSmartHome: !!p.isSmartHome,
            isVisible: p.isVisible !== undefined ? !!p.isVisible : true,
            images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image || '/images/placeholder.webp'],
            shortSpecs: Array.isArray(p.shortSpecs) ? p.shortSpecs : [],
            specifications: p.specifications || {},
            warranty: p.warranty || '1 Year Official Warranty',
            emiAvailable: !!p.emiAvailable,
            emiStartingBDT: p.emiStartingBDT,
            reviews: p.reviews || [],
            questions: p.questions || [],
            createdDate: p.createdAt || p.createdDate || new Date().toISOString(),
          }));
          setProducts(mapped);
        }
      }
    } catch (err) {
      console.warn('[refreshProducts error]:', err);
    }
  }, []);

  // Fetch dynamic cards from database / API
  const refreshCards = useCallback(async () => {
    try {
      const res = await fetch('/api/cards');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCards(data.data);
        }
      }
    } catch (err) {
      console.warn('[refreshCards error]:', err);
    }
  }, []);

  const getCardsBySection = useCallback(
    (section: CardSection) => {
      return cards
        .filter(c => c.section === section && c.isVisible !== false && c.status !== 'draft')
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    },
    [cards]
  );

  // Website Settings State
  const [siteSettings, setSiteSettings] = useState<any>({
    navbar: { logoUrl: '', logoHeight: 42, brandName: 'MY COMPUTER', tagline: 'Leading Tech Retailer', hotline: '16789' },
    cardAppearance: { imageRatio: '4/3', borderRadius: 'rounded-2xl', shadow: 'shadow-xs', hoverEffect: 'tilt', showSpecs: true, showWarrantyBadge: true },
    homepageSections: [],
    footer: { aboutText: '', hotline: '16789 / +880 9678-000111', email: 'support@mycomputer.com.bd', showAcceptedPayments: false }
  });

  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSiteSettings(data.settings);
        }
      }
    } catch (err) {
      console.warn('[refreshSettings error]:', err);
    }
  }, []);

  const updateSiteSettings = useCallback(async (updates: any): Promise<boolean> => {
    try {
      const token = localStorage.getItem('mc_admin_token') || sessionStorage.getItem('mc_admin_token');
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSiteSettings(data.settings);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('[updateSiteSettings error]:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    refreshCategories();
    refreshProducts();
    refreshCards();
    refreshSettings();
  }, [refreshCategories, refreshProducts, refreshCards, refreshSettings]);

  // Toast System
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  // Theme Manager - White theme default
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'light' : 'light'));
    document.documentElement.classList.remove('dark');
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'EN' ? 'BN' : 'EN'));
  };

  const openProductDetail = (id: string) => {
    setSelectedProductId(id);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart Functions
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    addToast(language === 'EN' ? 'Added to Cart' : 'কার্টে যোগ করা হয়েছে', `${product.name.slice(0, 35)}...`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    addToast(language === 'EN' ? 'Item Removed' : 'আইটেম সরানো হয়েছে', '', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.discountPrice * item.quantity,
    0
  );

  const couponDiscountBDT = appliedCoupon
    ? Math.min((cartSubtotal * appliedCoupon.discountPercent) / 100, appliedCoupon.maxDiscountBDT)
    : 0;

  const cartTotal = Math.max(0, cartSubtotal - couponDiscountBDT);

  const applyCoupon = (code: string) => {
    const coupon = MOCK_COUPONS.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!coupon) {
      return { success: false, message: language === 'EN' ? 'Invalid Coupon Code' : 'অকার্যকর কুপন কোড' };
    }
    if (cartSubtotal < coupon.minSpendBDT) {
      return {
        success: false,
        message: language === 'EN'
          ? `Minimum spend of ৳${coupon.minSpendBDT.toLocaleString()} required`
          : `ন্যূনতম ৳${coupon.minSpendBDT.toLocaleString()} খরচ করতে হবে`
      };
    }
    setAppliedCoupon(coupon);
    addToast(language === 'EN' ? 'Coupon Applied!' : 'কুপন প্রয়োগ করা হয়েছে!', `${coupon.discountPercent}% Discount`);
    return { success: true, message: language === 'EN' ? 'Coupon Applied Successfully!' : 'কুপন সফলভাবে প্রয়োগ করা হয়েছে!' };
  };

  // Wishlist & Compare
  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        addToast(language === 'EN' ? 'Removed from Wishlist' : 'উইশলিস্ট থেকে সরানো হয়েছে', '', 'info');
        return prev.filter(p => p.id !== product.id);
      } else {
        addToast(language === 'EN' ? 'Added to Wishlist' : 'উইশলিস্টে যোগ করা হয়েছে', product.name.slice(0, 30));
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.some(p => p.id === productId);

  const addToCompare = (product: Product) => {
    if (compareList.some(p => p.id === product.id)) {
      addToast(language === 'EN' ? 'Already in Comparison' : 'ইতিমধ্যে তুলনামূলক তালিকায় আছে', '', 'warning');
      return;
    }
    if (compareList.length >= 4) {
      addToast(language === 'EN' ? 'Compare limit reached' : 'সর্বোচ্চ ৪ টি পণ্য তুলনা করতে পারবেন', '', 'warning');
      return;
    }
    setCompareList(prev => [...prev, product]);
    addToast(language === 'EN' ? 'Added to Compare' : 'তুলনায় যোগ করা হয়েছে', product.name.slice(0, 30));
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(prev => prev.filter(p => p.id !== productId));
  };

  const clearCompare = () => setCompareList([]);

  const isInCompare = (productId: string) => compareList.some(p => p.id === productId);

  // PC Builder
  const addPCComponent = (slotId: string, product: Product) => {
    setPcBuildComponents(prev =>
      prev.map(slot => (slot.slotId === slotId ? { ...slot, product } : slot))
    );
    addToast(language === 'EN' ? 'PC Part Selected' : 'কম্পোনেন্ট নির্বাচন করা হয়েছে', product.name.slice(0, 30));
  };

  const removePCComponent = (slotId: string) => {
    setPcBuildComponents(prev =>
      prev.map(slot => (slot.slotId === slotId ? { ...slot, product: null } : slot))
    );
  };

  const clearPCBuild = () => {
    setPcBuildComponents(initialPCComponents);
    addToast(language === 'EN' ? 'Build Reset' : 'পিসি বিল্ড রিসেট হয়েছে', '', 'info');
  };

  const pcBuildTotalBDT = pcBuildComponents.reduce(
    (sum, slot) => sum + (slot.product ? slot.product.discountPrice : 0),
    0
  );

  const pcBuildTotalWattage = pcBuildComponents.reduce(
    (sum, slot) => sum + (slot.product?.wattage || 0),
    0
  );

  // Check socket compatibility
  const cpuComp = pcBuildComponents.find(s => s.slotId === 'cpu')?.product;
  const moboComp = pcBuildComponents.find(s => s.slotId === 'motherboard')?.product;
  const psuComp = pcBuildComponents.find(s => s.slotId === 'psu')?.product;

  let pcBuildCompatibilityIssue: string | null = null;
  if (cpuComp && moboComp && cpuComp.socketType && moboComp.socketType) {
    if (cpuComp.socketType !== moboComp.socketType) {
      pcBuildCompatibilityIssue = `Socket Mismatch! CPU (${cpuComp.socketType}) is incompatible with Motherboard (${moboComp.socketType}).`;
    }
  }
  if (psuComp && psuComp.wattage && pcBuildTotalWattage > psuComp.wattage) {
    pcBuildCompatibilityIssue = `Power Warning! Estimated system draw (${pcBuildTotalWattage}W) exceeds PSU rating (${psuComp.wattage}W). Please upgrade PSU.`;
  }

  const addAllPCToCart = () => {
    const selected = pcBuildComponents.filter(s => s.product !== null);
    if (selected.length === 0) return;

    selected.forEach(slot => {
      if (slot.product) addToCart(slot.product, 1);
    });
    addToast(
      language === 'EN' ? 'Custom Rig Added to Cart!' : 'কাস্টম পিসি কার্টে যোগ করা হয়েছে!',
      `${selected.length} components added`
    );
  };

  // Dynamic Filtering System calculated from live products state
  const resetFilters = () => setFilters(initialFilters);

  const filteredProducts = products.filter(product => {
    // Hidden products
    if (product.isVisible === false) return false;

    // Category filter
    if (filters.category) {
      const cat = String(filters.category).toLowerCase();
      const pCat = String(product.category || '').toLowerCase();
      const pSub = String(product.subcategory || '').toLowerCase();
      const pName = String(product.name || '').toLowerCase();

      let isMatch = false;

      if (cat === 'desktop-laptop' || cat === 'desktop' || cat === 'laptop') {
        isMatch = ['desktop-laptop', 'desktop', 'laptop', 'all-in-one-pc', 'business-laptop', 'gaming-laptop'].includes(pCat) ||
                  ['business-laptop', 'gaming-laptop', 'apple-macbook', 'all-in-one-pc'].includes(pSub) ||
                  pName.includes('laptop') || pName.includes('macbook') || pName.includes('desktop');
      } else if (cat === 'components' || cat === 'component' || cat === 'processor') {
        isMatch = ['components', 'component', 'processor', 'motherboard', 'ram', 'graphics-card', 'casing', 'power-supply'].includes(pCat) ||
                  ['processor', 'motherboard', 'ram', 'graphics-card', 'casing'].includes(pSub) ||
                  pName.includes('intel') || pName.includes('ryzen') || pName.includes('motherboard') || pName.includes('rtx');
      } else if (cat === 'monitors' || cat === 'monitor') {
        isMatch = ['monitors', 'monitor', '4k-monitor', 'gaming-monitor'].includes(pCat) ||
                  ['lg-monitor', 'asus-monitor', '4k-monitor', 'gaming-monitor'].includes(pSub) ||
                  pName.includes('monitor');
      } else if (cat === 'storage') {
        isMatch = ['storage', 'ssd', 'hdd', 'external-drive', 'nas', 'server-storage'].includes(pCat) ||
                  ['nas-storage', 'server-hdd', 'ssd-internal', 'portable-ssd'].includes(pSub) ||
                  pName.includes('ssd') || pName.includes('hdd') || pName.includes('nvme');
      } else if (cat === 'ups') {
        isMatch = ['ups', 'online-ups', 'offline-ups', 'ips', 'power'].includes(pCat) ||
                  ['online-ups', 'offline-ups'].includes(pSub) ||
                  pName.includes('ups');
      } else if (cat === 'networking') {
        isMatch = ['networking', 'onu-device', 'router', 'switch', 'access-point', 'ethernet-cable'].includes(pCat) ||
                  ['wifi-routers', '4g-lte-router', 'mesh-wifi', 'mikrotik', 'gpon-onu', 'epon-onu', 'network-switch'].includes(pSub);
      } else if (cat === 'camera' || cat === 'camera-security' || cat === 'security') {
        isMatch = ['camera-security', 'camera', 'security', 'cctv-security', 'ip-camera', 'dvr-nvr'].includes(pCat) ||
                  ['ezviz-camera', 'cc-camera', 'action-camera', 'dslr', 'mirrorless-camera', 'ip-camera', 'dvr-nvr'].includes(pSub) ||
                  pName.includes('camera') || pName.includes('ezviz') || pName.includes('hikvision') || pName.includes('dahua');
      } else if (cat === 'accessories') {
        isMatch = ['accessories', 'keyboard-mouse', 'cable', 'converter', 'hub-dock', 'thermal-paste'].includes(pCat) ||
                  ['keyboards', 'mouse', 'mousepad', 'hub-dock'].includes(pSub);
      } else if (cat === 'printer-office' || cat === 'office-equipment' || cat === 'printers') {
        isMatch = ['printer-office', 'printer', 'scanner', 'copier', 'shredder', 'tv-appliance', 'air-conditioner', 'appliance', 'office-equipment'].includes(pCat) ||
                  ['printers', 'scanner', 'projector'].includes(pSub);
      } else if (cat === 'gaming' || cat === 'gaming-gear') {
        isMatch = product.isGaming || ['gaming-gear', 'gaming', 'gaming-pc', 'gaming-laptop', 'gaming-monitor'].includes(pCat) ||
                  pName.includes('gaming') || pName.includes('esports');
      } else if (cat === 'earbuds-headphones' || cat === 'headphone-audio') {
        isMatch = ['earbuds-headphones', 'headphone-audio', 'earbuds', 'headphones', 'neckband', 'wireless-earbuds', 'tws-earbuds'].includes(pCat) ||
                  ['wireless-earbuds', 'gaming-headsets', 'over-ear-headphones', 'neckbands'].includes(pSub) ||
                  pName.includes('earbuds') || pName.includes('headphone') || pName.includes('airpods') || pName.includes('headset');
      } else {
        isMatch = pCat === cat || pSub === cat;
      }

      if (!isMatch) return false;
    }

    // Brand filter
    if (filters.brand.length > 0 && !filters.brand.includes(product.brand)) return false;

    // Price range
    if (product.discountPrice < filters.priceRange[0] || product.discountPrice > filters.priceRange[1]) return false;

    // Stock
    if (filters.stockOnly && product.stockStatus !== 'In Stock') return false;

    // Gaming
    if (filters.gamingOnly && !product.isGaming) return false;

    // EMI
    if (filters.emiOnly && !product.emiAvailable) return false;

    // Rating
    if (filters.rating && product.rating < filters.rating) return false;

    // Advanced Global Search: Tokenized matching across all product metadata
    const effectiveSearch = (filters.searchQuery || searchQuery || '').trim().toLowerCase();
    if (effectiveSearch) {
      const tokens = effectiveSearch.split(/\s+/).filter(Boolean);
      const specsJoined = Array.isArray(product.shortSpecs) ? product.shortSpecs.join(' ') : '';
      const detailedSpecsJoined = product.specifications 
        ? Object.values(product.specifications).flatMap(v => Array.isArray(v) ? v.map((item: any) => `${item.label || ''} ${item.value || ''}`) : []).join(' ')
        : '';
      const searchableText = `${product.name} ${product.brand} ${product.category} ${product.categoryName || ''} ${product.subcategory || ''} ${product.slug || ''} ${product.id || ''} ${product.description || ''} ${specsJoined} ${detailedSpecsJoined}`.toLowerCase();

      const allTokensMatch = tokens.every(token => searchableText.includes(token));
      if (!allTokensMatch) return false;
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'price-low') return a.discountPrice - b.discountPrice;
    if (filters.sortBy === 'price-high') return b.discountPrice - a.discountPrice;
    if (filters.sortBy === 'rating') return b.rating - a.rating;
    if (filters.sortBy === 'newest') return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  // Create New Order
  const createOrder = (orderData: Partial<Order>): Order => {
    const newId = `MC-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      id: newId,
      date: new Date().toISOString().split('T')[0],
      customerName: orderData.customerName || 'Customer',
      customerPhone: orderData.customerPhone || '',
      customerEmail: orderData.customerEmail || '',
      shippingAddress: orderData.shippingAddress || '',
      district: orderData.district || 'Dhaka',
      items: cart.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        image: i.product.images[0],
        price: i.product.discountPrice,
        quantity: i.quantity
      })),
      subtotal: cartSubtotal,
      discount: couponDiscountBDT,
      shippingCost: orderData.district === 'Dhaka' ? 70 : 140,
      total: cartTotal + (orderData.district === 'Dhaka' ? 70 : 140),
      paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
      paymentStatus: orderData.paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
      orderStatus: 'Placed',
      trackingSteps: [
        { title: 'Order Placed', date: 'Just Now', completed: true, current: true },
        { title: 'Payment Verification', date: 'Pending', completed: false },
        { title: 'Packing at Central Warehouse', date: 'Pending', completed: false },
        { title: 'Handed to Courier (Paperfly/RedX)', date: 'Pending', completed: false },
        { title: 'Delivered', date: 'Pending', completed: false }
      ]
    };

    setOrders(prev => {
      const updated = [newOrder, ...prev];
      try { localStorage.setItem('mc_customer_orders', JSON.stringify(updated)); } catch {}
      return updated;
    });
    setActiveTrackingId(newId);
    clearCart();
    return newOrder;
  };

  const placeOrder = async (orderData: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    shippingAddress: string;
    area?: string;
    district: string;
    additionalNote?: string;
    paymentMethod?: string;
    paymentNumber?: string;
    senderNumber?: string;
    trxId?: string;
  }): Promise<{ success: boolean; orderId?: string; order?: Order; error?: string }> => {
    try {
      const itemsPayload = cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        image: item.product.images[0] || '',
        quantity: item.quantity,
        unitPrice: item.product.discountPrice,
      }));

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: orderData.customerName,
          phone: orderData.customerPhone,
          customerPhone: orderData.customerPhone,
          address: orderData.shippingAddress,
          shippingAddress: orderData.shippingAddress,
          customerEmail: orderData.customerEmail,
          products: itemsPayload,
          items: itemsPayload,
          total: cartTotal + (orderData.district === 'Dhaka' ? 70 : 140),
          area: orderData.area,
          district: orderData.district,
          additionalNote: orderData.additionalNote,
          paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
          paymentNumber: orderData.paymentNumber || '01873434639',
          senderNumber: orderData.senderNumber || '',
          trxId: orderData.trxId || '',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        const errorMsg = data.message || data.error || 'Failed to place order';
        addToast(language === 'EN' ? 'Order Failed' : 'অর্ডার ব্যর্থ হয়েছে', errorMsg, 'warning');
        return { success: false, error: errorMsg };
      }

      const saved = data.order || {};
      const newId = data.orderId || data.insertedId || saved.orderId; if (!newId) throw new Error('Server did not return a valid order ID');
      const newOrder: Order = {
        id: newId,
        orderId: newId,
        date: new Date().toISOString().split('T')[0],
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerEmail: orderData.customerEmail || '',
        shippingAddress: orderData.shippingAddress,
        area: orderData.area,
        district: orderData.district,
        note: orderData.additionalNote,
        items: saved.items?.map((it: any) => ({
          productId: it.productId,
          productName: it.name,
          image: it.image,
          price: it.unitPrice,
          quantity: it.quantity,
        })) || cart.map(i => ({
          productId: i.product.id,
          productName: i.product.name,
          image: i.product.images[0],
          price: i.product.discountPrice,
          quantity: i.quantity,
        })),
        subtotal: saved.subtotal || cartSubtotal,
        discount: saved.discount || couponDiscountBDT,
        shippingCost: saved.deliveryCharge || (orderData.district === 'Dhaka' ? 70 : 140),
        deliveryCharge: saved.deliveryCharge || (orderData.district === 'Dhaka' ? 70 : 140),
        total: saved.grandTotal || (cartTotal + (orderData.district === 'Dhaka' ? 70 : 140)),
        grandTotal: saved.grandTotal,
        paymentMethod: (saved.paymentMethod || orderData.paymentMethod || 'Cash on Delivery') as any,
        paymentNumber: saved.paymentNumber || orderData.paymentNumber || '01873434639',
        senderNumber: saved.senderNumber || orderData.senderNumber || '',
        trxId: saved.trxId || orderData.trxId || '',
        paymentStatus: saved.paymentStatus || (orderData.paymentMethod === 'Cash on Delivery' ? 'Pending' : (orderData.trxId ? 'Paid' : 'Pending')),
        orderStatus: saved.orderStatus || 'Pending',
        trackingSteps: saved.trackingSteps || [
          { title: 'Order Placed', date: 'Just Now', completed: true, current: true },
          { title: 'Payment Verification', date: 'Pending', completed: false },
          { title: 'Packing at Central Warehouse', date: 'Pending', completed: false },
          { title: 'Handed to Courier', date: 'Pending', completed: false },
          { title: 'Delivered', date: 'Pending', completed: false }
        ],
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      };

      setOrders(prev => {
        const updated = [newOrder, ...prev];
        try { localStorage.setItem('mc_customer_orders', JSON.stringify(updated)); } catch {}
        return updated;
      });
      setActiveTrackingId(newId);
      clearCart();
      addToast(
        language === 'EN' ? 'Order Confirmed!' : 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে!',
        (language === 'EN' ? 'Order ID: ' : 'অর্ডার আইডি: ') + newId
      );
      return { success: true, orderId: newId, order: newOrder };
    } catch (networkError: any) {
      console.error('[placeOrder error]:', networkError);
      const errorMsg = language === 'EN' ? (networkError.message || 'Could not connect to server. Please try again.') : (networkError.message || 'সার্ভারে সংযোগ করা সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
      addToast(language === 'EN' ? 'Order Failed' : 'অর্ডার ব্যর্থ হয়েছে', errorMsg, 'warning');
      return { success: false, error: errorMsg };
    }
  };

  const fetchLiveOrder = useCallback(async (query: string): Promise<Order | null> => {
    if (!query || !query.trim()) return null;
    try {
      const clean = query.trim();
      const res = await fetch(`/api/orders/${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (res.ok && data.success && data.order) {
        const o = data.order;
        const normalized: Order = {
          id: o.orderId || o.id,
          orderId: o.orderId || o.id,
          date: o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : (o.date || 'Recent'),
          customerName: o.customer?.name || o.customerName || 'Customer',
          customerPhone: o.customer?.phone || o.customerPhone || '',
          customerEmail: o.customer?.email || o.customerEmail || '',
          shippingAddress: o.delivery?.address || o.shippingAddress || '',
          area: o.delivery?.area || o.area || '',
          district: o.delivery?.district || o.district || '',
          note: o.delivery?.note || o.note || '',
          items: o.items?.map((it: any) => ({
            productId: it.productId,
            productName: it.name || it.productName,
            image: it.image,
            price: it.unitPrice || it.price,
            quantity: it.quantity,
          })) || [],
          subtotal: o.subtotal || 0,
          discount: o.discount || 0,
          shippingCost: o.deliveryCharge || 0,
          deliveryCharge: o.deliveryCharge || 0,
          total: o.grandTotal || o.total || 0,
          grandTotal: o.grandTotal || o.total || 0,
          paymentMethod: o.paymentMethod || 'Cash on Delivery',
          paymentNumber: o.paymentNumber || '',
          senderNumber: o.senderNumber || '',
          trxId: o.trxId || '',
          paymentStatus: o.paymentStatus || 'Pending',
          orderStatus: o.orderStatus || 'Pending',
          trackingSteps: o.trackingSteps || [],
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
        };

        setOrders(prev => {
          const idx = prev.findIndex(item => item.id === normalized.id);
          const updated = idx >= 0 ? prev.map((item, i) => (i === idx ? normalized : item)) : [normalized, ...prev];
          try { localStorage.setItem('mc_customer_orders', JSON.stringify(updated)); } catch {}
          return updated;
        });

        return normalized;
      }
      return null;
    } catch (err) {
      console.warn('[fetchLiveOrder error]:', err);
      return null;
    }
  }, []);

  // Real-time Order Status Polling & Customer Confirmation Notification
  useEffect(() => {
    const pendingOrders = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Processing');
    if (pendingOrders.length === 0) return;

    const interval = setInterval(async () => {
      for (const po of pendingOrders) {
        const orderId = po.id || po.orderId;
        if (!orderId) continue;
        try {
          const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
          const data = await res.json();
          if (res.ok && data.success && data.order) {
            const newStatus = data.order.orderStatus;
            if (newStatus && newStatus !== po.orderStatus) {
              if (newStatus === 'Confirmed') {
                addToast(
                  language === 'EN' ? 'Order Confirmed! 🎉' : 'অর্ডার কনফার্ম হয়েছে! 🎉',
                  language === 'EN'
                    ? `Your Order #${orderId} has been verified and confirmed by our team.`
                    : `আপনার অর্ডার #${orderId} সফলভাবে যাচাই ও কনফার্ম করা হয়েছে। ডেলিভারির প্রস্তুতি চলছে।`,
                  'success'
                );
              } else if (newStatus === 'Shipped') {
                addToast(
                  language === 'EN' ? 'Order Shipped! 🚚' : 'অর্ডার কুরিয়ারে পাঠানো হয়েছে! 🚚',
                  language === 'EN'
                    ? `Your Order #${orderId} is now on its way to your destination.`
                    : `আপনার অর্ডার #${orderId} ডেলিভারির জন্য কুরিয়ারে হস্তান্তর করা হয়েছে।`,
                  'info'
                );
              }
              fetchLiveOrder(orderId);
            }
          }
        } catch {}
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [orders, language, addToast, fetchLiveOrder]);

  return (
    <StoreContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedProductId,
        setSelectedProductId,
        openProductDetail,
        theme,
        toggleTheme,
        language,
        toggleLanguage,
        searchQuery,
        setSearchQuery,
        aiSearchOpen,
        setAiSearchOpen,
        quickViewProduct,
        setQuickViewProduct,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        appliedCoupon,
        couponDiscountBDT,
        applyCoupon,
        cartTotal,
        wishlist,
        toggleWishlist,
        isInWishlist,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        pcBuildComponents,
        addPCComponent,
        removePCComponent,
        clearPCBuild,
        pcBuildTotalBDT,
        pcBuildTotalWattage,
        pcBuildCompatibilityIssue,
        addAllPCToCart,
        products,
        categories,
        refreshProducts,
        refreshCategories,
        cards,
        refreshCards,
        getCardsBySection,
        siteSettings,
        refreshSettings,
        updateSiteSettings,
        filters,
        setFilters,
        resetFilters,
        filteredProducts,
        orders,
        createOrder,
        placeOrder,
        fetchLiveOrder,
        activeTrackingId,
        setActiveTrackingId,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};

export const useOptionalStore = () => {
  return useContext(StoreContext);
};

export { StoreContext };
