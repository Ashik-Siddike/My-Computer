import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../../context/StoreContext';
import { ProductCardItem } from './ProductCardItem';
import { CategoryWorkspace } from './CategoryWorkspace';
import { WebsiteContentManager } from './WebsiteContentManager';
import { MediaLibraryManager } from './MediaLibraryManager';
import { CardManager } from './CardManager';
import { StorefrontCardPreviewModal } from './StorefrontCardPreviewModal';
import { ProductEditorModal } from './ProductEditorModal';
import {
  LayoutDashboard,
  LayoutGrid,
  Package,
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
  Sliders,
  Layers,
  FileText,
  Palette,
  ShoppingBag,
  AlertTriangle,
  Image as ImageIcon,
  Users,
  Settings,
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  Lock,
  LogOut,
  RefreshCw,
  Loader2,
  DollarSign,
  ShieldCheck,
  Database,
  ArrowRight,
  Store,
  Key,
  Sparkles
} from 'lucide-react';

interface OrderItem {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface ServerOrder {
  _id?: string;
  orderId: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  delivery: {
    address: string;
    area?: string;
    district: string;
    note?: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  grandTotal: number;
  paymentMethod: string;
  paymentNumber?: string;
  senderNumber?: string;
  trxId?: string;
  paymentStatus: string;
  orderStatus: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingSteps?: Array<{ title: string; date: string; completed: boolean; current?: boolean }>;
  createdAt?: string;
  updatedAt?: string;
}

interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders?: number;
  shippedOrders?: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  totalUsers: number;
  isDbConnected: boolean;
}

interface RegisteredUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
}

export const CATEGORY_DEFINITIONS = [
  { id: 'desktop-laptop', name: 'Desktop & Laptop', nameBn: 'ডেস্কটপ ও ল্যাপটপ', iconName: 'Laptop', icon: Laptop },
  { id: 'components', name: 'Components', nameBn: 'কম্পোনেন্টস', iconName: 'Cpu', icon: Cpu },
  { id: 'monitors', name: 'Monitors', nameBn: 'মনিটর', iconName: 'Monitor', icon: Monitor },
  { id: 'storage', name: 'Storage', nameBn: 'স্টোরেজ', iconName: 'HardDrive', icon: HardDrive },
  { id: 'ups', name: 'UPS', nameBn: 'ইউপিএস', iconName: 'Zap', icon: Zap },
  { id: 'networking', name: 'Networking', nameBn: 'নেটওয়ার্কিং', iconName: 'Wifi', icon: Wifi },
  { id: 'camera-security', name: 'Camera & Security', nameBn: 'ক্যামেরা ও সিকিউরিটি', iconName: 'Camera', icon: Camera },
  { id: 'accessories', name: 'Accessories', nameBn: 'এক্সেসরিজ', iconName: 'Keyboard', icon: Keyboard },
  { id: 'printer-office', name: 'Printer & Office', nameBn: 'প্রিন্টার ও অফিস', iconName: 'Printer', icon: Printer },
  { id: 'gaming-gear', name: 'Gaming Gear', nameBn: 'গেমিং গিয়ার', iconName: 'Gamepad2', icon: Gamepad2 },
  { id: 'earbuds-headphones', name: 'Earbuds & Headphones', nameBn: 'ইয়ারবাডস ও হেডফোন', iconName: 'Headphones', icon: Headphones },
];

export const AdminDashboard: React.FC = () => {
  const { addToast, setCurrentView, refreshProducts: refreshStoreProducts } = useStore();

  // Authentication State - Fresh authentication strictly required every time admin panel is entered.
  const [token, setToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<{ id?: string; email: string; name: string; username?: string; role?: string } | null>(null);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active View Tab (23 distinct views supported)
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Stats State
  const [stats, setStats] = useState<AdminStats>({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalProducts: 186,
    lowStockProducts: 0,
    totalUsers: 0,
    isDbConnected: true,
  });

  // Products State
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Card Management (Master Grid) Filters
  const [cardSearch, setCardSearch] = useState('');
  const [cardCategoryFilter, setCardCategoryFilter] = useState('all');
  const [cardStockFilter, setCardStockFilter] = useState('all');
  const [cardVisibilityFilter, setCardVisibilityFilter] = useState('all');

  // All Products Table Filters & Pagination
  const [tableSearch, setTableSearch] = useState('');
  const [tableCategoryFilter, setTableCategoryFilter] = useState('all');
  const [tableStockFilter, setTableStockFilter] = useState('all');
  const [tableSortBy, setTableSortBy] = useState<'name' | 'price' | 'stock'>('name');
  const [tableSortOrder, setTableSortOrder] = useState<'asc' | 'desc'>('asc');
  const [tablePage, setTablePage] = useState(1);
  const TABLE_PAGE_SIZE = 15;

  // Inventory Monitor Filters
  const [inventoryTab, setInventoryTab] = useState<'all' | 'out-of-stock' | 'low-stock'>('all');
  const [inventorySearch, setInventorySearch] = useState('');

  // Orders State
  const [orders, setOrders] = useState<ServerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<ServerOrder | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  // Categories State
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Users State
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Store Settings State
  const [settingsForm, setSettingsForm] = useState({
    username: '',
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Product Editor Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState<any | null>(null);
  const [defaultCategoryForModal, setDefaultCategoryForModal] = useState('camera');

  // Storefront Card Preview Modal
  const [isCardPreviewOpen, setIsCardPreviewOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<any | null>(null);

  // Delete Confirmation Modal
  const [deleteTargetProduct, setDeleteTargetProduct] = useState<any | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);

  // Fresh authentication strictly required every time admin panel is opened. Never persist or auto-login.
  useEffect(() => {
    localStorage.removeItem('mc_admin_token');
    sessionStorage.removeItem('mc_admin_token');
    setToken(null);
    setAdminUser(null);

    return () => {
      // Clear all tokens when leaving the admin panel
      localStorage.removeItem('mc_admin_token');
      sessionStorage.removeItem('mc_admin_token');
    };
  }, []);

  /* ── 1. Check or Verify Token ─────────────────────────────────────────── */
  useEffect(() => {
    if (token) {
      fetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.admin) {
            setAdminUser(data.admin);
            setSettingsForm(prev => ({
              ...prev,
              username: data.admin.username || 'admin',
              name: data.admin.name || 'Store Administrator',
              email: data.admin.email || '',
            }));
          } else {
            handleLogout();
          }
        })
        .catch(() => handleLogout());
    }
  }, [token]);

  /* ── 2. Login Handler ──────────────────────────────────────────────────── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginIdentifier,
          email: loginIdentifier,
          password: loginPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Authentication failed. Please verify credentials.');
        return;
      }

      // Retain token in sessionStorage strictly for active sub-modals during current session only
      // Never save in localStorage so every admin visit requires username & password
      sessionStorage.setItem('mc_admin_token', data.token);
      localStorage.removeItem('mc_admin_token');
      setToken(data.token);
      setAdminUser(data.admin);
      setSettingsForm(prev => ({
        ...prev,
        username: data.admin.username || 'admin',
        name: data.admin.name || 'Store Administrator',
        email: data.admin.email || '',
      }));
      addToast('Welcome Admin!', `Signed in as ${data.admin.username || data.admin.name}`);
    } catch (err: any) {
      setLoginError(err.message || 'Connection to authentication service failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mc_admin_token');
    localStorage.removeItem('mc_admin_token');
    setToken(null);
    setAdminUser(null);
    setLoginIdentifier('');
    setLoginPassword('');
    setShowPassword(false);
    setLoginError(null);
  };

  /* ── 3. Data Fetching Functions ────────────────────────────────────────── */
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await fetch('/api/products?limit=300');
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.warn('[Admin fetchProducts error]:', err);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setOrdersLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (orderSearch.trim()) params.append('search', orderSearch.trim());
      if (orderStatusFilter !== 'All') params.append('status', orderStatusFilter);

      const res = await fetch(`/api/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.warn('[Admin fetchOrders error]:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, [token, orderSearch, orderStatusFilter]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.warn('[Admin fetchStats error]:', err);
    }
  }, [token]);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch('/api/categories?all=true');
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setCategoriesList(data.categories);
      }
    } catch (err) {
      console.warn('[Admin fetchCategories error]:', err);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setUsersLoading(true);
    try {
      const res = await fetch('/api/admin/users?limit=50', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch (err) {
      console.warn('[Admin fetchUsers error]:', err);
    } finally {
      setUsersLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchProducts();
      fetchOrders();
      fetchStats();
      fetchCategories();
      fetchUsers();
    }
  }, [token, fetchProducts, fetchOrders, fetchStats, fetchCategories, fetchUsers]);

  /* ── 4. Card & Product Actions ─────────────────────────────────────────── */
  const handleOpenAddProduct = (categorySlug?: string) => {
    setModalProduct(null);
    setDefaultCategoryForModal(categorySlug || 'camera');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: any) => {
    setModalProduct(prod);
    setDefaultCategoryForModal(prod.category || 'camera');
    setIsProductModalOpen(true);
  };

  const handleOpenPreviewProduct = (prod: any) => {
    setPreviewProduct(prod);
    setIsCardPreviewOpen(true);
  };

  const handleDuplicateProduct = async (prod: any) => {
    if (!token) return;
    try {
      const copyPayload = {
        name: `Copy of ${prod.name}`,
        slug: `${prod.slug || 'product'}-copy-${Date.now().toString().slice(-4)}`,
        brand: prod.brand || 'Other',
        model: prod.model || '',
        sku: `${prod.sku || 'SKU'}-COPY-${Date.now().toString().slice(-4)}`,
        category: prod.category || 'camera',
        categoryName: prod.categoryName || '',
        subcategory: prod.subcategory || '',
        description: prod.description || '',
        price: Number(prod.discountPrice || prod.regularPrice || prod.price || 0),
        regularPrice: Number(prod.discountPrice || prod.regularPrice || prod.price || 0),
        discountPrice: Number(prod.discountPrice || prod.regularPrice || prod.price || 0),
        stock: Number(prod.stockCount ?? prod.stock ?? 10),
        stockCount: Number(prod.stockCount ?? prod.stock ?? 10),
        availability: prod.stockStatus || prod.availability || 'In Stock',
        stockStatus: prod.stockStatus || prod.availability || 'In Stock',
        warranty: prod.warranty || '1 Year Official Warranty',
        image: prod.image,
        images: Array.isArray(prod.images) ? prod.images : [prod.image],
        shortSpecs: Array.isArray(prod.shortSpecs) ? prod.shortSpecs : [],
        specifications: prod.specifications || {},
        isFeatured: false,
        isVisible: true,
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(copyPayload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Card Duplicated!', `Created copy of "${prod.name}" in database`);
        fetchProducts();
        fetchStats();
      } else {
        throw new Error(data.error || 'Failed to duplicate product');
      }
    } catch (err: any) {
      addToast('Duplicate Failed', err.message, 'warning');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetProduct || !token) return;
    const prodId = deleteTargetProduct._id || deleteTargetProduct.id || deleteTargetProduct.productId;
    setDeletingProduct(true);

    try {
      const res = await fetch(`/api/admin/products/${prodId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        addToast('Product Deleted', `Removed "${deleteTargetProduct.name}" from database`);
        setProducts(prev => prev.filter(p => (p._id || p.id || p.productId) !== prodId));
        setDeleteTargetProduct(null);
        fetchStats();
      } else {
        throw new Error(data.error || 'Failed to delete product');
      }
    } catch (err: any) {
      addToast('Delete Failed', err.message, 'warning');
    } finally {
      setDeletingProduct(false);
    }
  };

  /* ── 5. Inline Quick Restock ───────────────────────────────────────────── */
  const handleInlineRestock = async (prodId: string, addQty: number) => {
    if (!token) return;
    const target = products.find(p => (p._id || p.id || p.productId) === prodId);
    if (!target) return;

    const currentQty = Number(target.stockCount ?? target.stock ?? 0);
    const newQty = currentQty + addQty;
    const newStatus = newQty > 0 ? 'In Stock' : 'Out of Stock';

    try {
      const res = await fetch(`/api/admin/products/${prodId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stock: newQty,
          stockCount: newQty,
          stockStatus: newStatus,
          availability: newStatus,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Stock Updated', `Stock adjusted to ${newQty} units`);
        setProducts(prev =>
          prev.map(p => ((p._id || p.id || p.productId) === prodId ? { ...p, stock: newQty, stockCount: newQty, stockStatus: newStatus } : p))
        );
        fetchStats();
      }
    } catch (err: any) {
      addToast('Restock Failed', err.message, 'warning');
    }
  };

  /* ── 6. Order Status Update ────────────────────────────────────────────── */
  const handleUpdateOrderStatus = async (orderId: string, newStatus: ServerOrder['orderStatus']) => {
    if (!token) return;
    setStatusUpdating(orderId);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setOrders(prev =>
          prev.map(o => (o.orderId === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.orderId === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }
        addToast('Status Updated!', `Order ${orderId} marked as ${newStatus}`);
        fetchStats();
      } else {
        throw new Error(data.error || 'Failed to update order status');
      }
    } catch (err: any) {
      addToast('Update Failed', err.message, 'warning');
    } finally {
      setStatusUpdating(null);
    }
  };

  /* ── 7. Settings / Password Update ─────────────────────────────────────── */
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSettingsSaving(true);
    setSettingsMessage(null);

    if (settingsForm.newPassword) {
      if (settingsForm.newPassword !== settingsForm.confirmPassword) {
        setSettingsMessage({ type: 'error', text: 'New passwords do not match' });
        setSettingsSaving(false);
        return;
      }
      if (!settingsForm.currentPassword) {
        setSettingsMessage({ type: 'error', text: 'Current password is required to set a new password' });
        setSettingsSaving(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: settingsForm.name,
          email: settingsForm.email,
          currentPassword: settingsForm.currentPassword || undefined,
          newPassword: settingsForm.newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSettingsMessage({ type: 'success', text: 'Settings updated successfully' });
        addToast('Profile Updated', 'Administrator credentials saved');
        setSettingsForm(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        throw new Error(data.error || 'Failed to update settings');
      }
    } catch (err: any) {
      setSettingsMessage({ type: 'error', text: err.message });
    } finally {
      setSettingsSaving(false);
    }
  };

  /* ── 8. Re-seed & Sync Database Tool ───────────────────────────────────── */
  const handleResyncDatabase = async () => {
    if (!token) return;
    setSeeding(true);
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Database Synchronized', `Synchronized ${data.productsCount || 186} products and ${data.categoriesCount || 11} categories`);
        fetchProducts();
        fetchCategories();
        fetchStats();
      } else {
        throw new Error(data.error || 'Database resync failed');
      }
    } catch (err: any) {
      addToast('Sync Failed', err.message, 'warning');
    } finally {
      setSeeding(false);
    }
  };

  /* ── Filtered Master Cards Grid ────────────────────────────────────────── */
  const filteredCards = useMemo(() => {
    return products.filter(p => {
      if (cardSearch.trim()) {
        const q = cardSearch.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchBrand = (p.brand || '').toLowerCase().includes(q);
        const matchSku = (p.sku || p.productId || '').toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchSku) return false;
      }
      if (cardCategoryFilter !== 'all') {
        const pCat = String(p.category || '').toLowerCase();
        if (!pCat.includes(cardCategoryFilter.toLowerCase())) return false;
      }
      if (cardStockFilter === 'in-stock') {
        if ((p.stockStatus || p.availability || 'In Stock') !== 'In Stock') return false;
      } else if (cardStockFilter === 'out-of-stock') {
        if ((p.stockStatus || p.availability || 'In Stock') === 'In Stock') return false;
      }
      if (cardVisibilityFilter === 'visible') {
        if (p.isVisible === false) return false;
      } else if (cardVisibilityFilter === 'hidden') {
        if (p.isVisible !== false) return false;
      }
      return true;
    });
  }, [products, cardSearch, cardCategoryFilter, cardStockFilter, cardVisibilityFilter]);

  /* ── Filtered All Products Table ───────────────────────────────────────── */
  const tableProducts = useMemo(() => {
    return products
      .filter(p => {
        if (tableSearch.trim()) {
          const q = tableSearch.toLowerCase();
          const matchName = (p.name || '').toLowerCase().includes(q);
          const matchBrand = (p.brand || '').toLowerCase().includes(q);
          const matchSku = (p.sku || p.productId || '').toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchSku) return false;
        }
        if (tableCategoryFilter !== 'all') {
          const pCat = String(p.category || '').toLowerCase();
          if (!pCat.includes(tableCategoryFilter.toLowerCase())) return false;
        }
        if (tableStockFilter === 'in-stock') {
          if ((p.stockStatus || p.availability || 'In Stock') !== 'In Stock') return false;
        } else if (tableStockFilter === 'out-of-stock') {
          if ((p.stockStatus || p.availability || 'In Stock') === 'In Stock') return false;
        }
        return true;
      })
      .sort((a, b) => {
        let compare = 0;
        if (tableSortBy === 'price') {
          const priceA = Number(a.discountPrice || a.regularPrice || a.price || 0);
          const priceB = Number(b.discountPrice || b.regularPrice || b.price || 0);
          compare = priceA - priceB;
        } else if (tableSortBy === 'stock') {
          const stockA = Number(a.stockCount ?? a.stock ?? 0);
          const stockB = Number(b.stockCount ?? b.stock ?? 0);
          compare = stockA - stockB;
        } else {
          compare = (a.name || '').localeCompare(b.name || '');
        }
        return tableSortOrder === 'asc' ? compare : -compare;
      });
  }, [products, tableSearch, tableCategoryFilter, tableStockFilter, tableSortBy, tableSortOrder]);

  const totalTablePages = Math.max(1, Math.ceil(tableProducts.length / TABLE_PAGE_SIZE));
  const paginatedTableProducts = tableProducts.slice(
    (tablePage - 1) * TABLE_PAGE_SIZE,
    tablePage * TABLE_PAGE_SIZE
  );

  /* ── Filtered Inventory Monitor ────────────────────────────────────────── */
  const inventoryProducts = useMemo(() => {
    return products.filter(p => {
      const stock = Number(p.stockCount ?? p.stock ?? 0);
      if (inventoryTab === 'out-of-stock') {
        if (stock > 0) return false;
      } else if (inventoryTab === 'low-stock') {
        if (stock <= 0 || stock > 5) return false;
      }
      if (inventorySearch.trim()) {
        const q = inventorySearch.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchBrand = (p.brand || '').toLowerCase().includes(q);
        const matchSku = (p.sku || p.productId || '').toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchSku) return false;
      }
      return true;
    });
  }, [products, inventoryTab, inventorySearch]);

  /* ──────────────────────────────────────────────────────────────────────── */
  /* LOGIN VIEW (IF NOT AUTHENTICATED)                                        */
  /* ──────────────────────────────────────────────────────────────────────── */
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-8 sm:p-10 text-slate-900 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 mb-4 shadow-2xs">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              MY COMPUTER
            </h2>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-0.5">
              Enterprise Storefront Admin
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Sign in with authorized administrator credentials to manage catalog and storefront
            </p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Authentication Error</strong>
                <p className="mt-0.5">{loginError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Admin Username or Email
              </label>
              <input
                type="text"
                autoComplete="off"
                value={loginIdentifier}
                onChange={e => setLoginIdentifier(e.target.value)}
                placeholder="admin"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 bg-slate-50/50 font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full mt-6 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Access Admin Control Panel</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <button
              onClick={() => {
                handleLogout();
                setCurrentView('home');
              }}
              className="text-slate-600 hover:text-blue-600 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Public Storefront</span>
            </button>
            <span className="font-mono text-[10px] text-slate-400">v2.5 Enterprise</span>
          </div>

        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────────────────── */
  /* MAIN ADMIN PANEL INTERFACE                                               */
  /* ──────────────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900 font-sans">
      
      {/* Modals Mounted at Root */}
      <ProductEditorModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={modalProduct}
        defaultCategory={defaultCategoryForModal}
        onSaveSuccess={() => {
          fetchProducts();
          fetchStats();
          refreshStoreProducts();
        }}
      />

      <StorefrontCardPreviewModal
        isOpen={isCardPreviewOpen}
        onClose={() => setIsCardPreviewOpen(false)}
        product={previewProduct}
      />

      {/* Delete Product Confirmation Modal */}
      {deleteTargetProduct && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3 border border-red-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">
              Delete This Product?
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to permanently delete <strong className="text-slate-800">{deleteTargetProduct.name}</strong> from MongoDB Atlas and server storage? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTargetProduct(null)}
                disabled={deletingProduct}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deletingProduct}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                {deletingProduct ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Order Details Modal */}
      {selectedOrder && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 uppercase">
                  Order #{selectedOrder.orderId}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  Order Details & Verification
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Customer and Delivery info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <div className="font-bold text-slate-500 uppercase text-[10px] mb-1">Customer Information</div>
                  <div className="font-bold text-slate-900 text-sm">{selectedOrder.customer.name}</div>
                  <div className="text-slate-600 font-mono mt-0.5">{selectedOrder.customer.phone}</div>
                  {selectedOrder.customer.email && <div className="text-slate-500">{selectedOrder.customer.email}</div>}
                </div>

                <div>
                  <div className="font-bold text-slate-500 uppercase text-[10px] mb-1">Shipping Destination</div>
                  <div className="text-slate-800 font-medium">{selectedOrder.delivery.address}</div>
                  <div className="text-slate-600 mt-0.5">District: <strong>{selectedOrder.delivery.district}</strong></div>
                  {selectedOrder.delivery.note && (
                    <div className="text-slate-500 italic mt-1 bg-white p-2 rounded-lg border border-slate-200">
                      Note: {selectedOrder.delivery.note}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-blue-900 uppercase text-[10px]">Payment Method</div>
                  <div className="font-black text-sm text-blue-950 mt-0.5">{selectedOrder.paymentMethod}</div>
                </div>
                {selectedOrder.senderNumber && (
                  <div>
                    <div className="font-bold text-blue-900 uppercase text-[10px]">Sender Number</div>
                    <div className="font-mono font-bold text-xs text-blue-900 mt-0.5">{selectedOrder.senderNumber}</div>
                  </div>
                )}
                {selectedOrder.trxId && (
                  <div>
                    <div className="font-bold text-blue-900 uppercase text-[10px]">Transaction ID (TrxID)</div>
                    <div className="font-mono font-bold text-xs text-blue-900 mt-0.5">{selectedOrder.trxId}</div>
                  </div>
                )}
                <div>
                  <div className="font-bold text-blue-900 uppercase text-[10px]">Grand Total</div>
                  <div className="font-black text-base text-slate-900 mt-0.5">৳{Number(selectedOrder.grandTotal).toLocaleString()}</div>
                </div>
              </div>

              {/* Order Items Table */}
              <div>
                <div className="font-bold text-slate-700 uppercase text-[10px] mb-2">Itemized Breakdown</div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                      <tr>
                        <th className="py-2.5 px-3">Product</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {selectedOrder.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 flex items-center gap-2">
                            <img src={it.image} alt={it.name} className="w-8 h-8 object-contain rounded-md border border-slate-100" />
                            <span className="font-bold text-slate-900 line-clamp-1">{it.name}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">{it.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-mono">৳{Number(it.unitPrice).toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold">৳{Number(it.subtotal).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status Updater */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
                <span className="font-bold text-slate-700">Change Order Status:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      disabled={statusUpdating === selectedOrder.orderId}
                      onClick={() => handleUpdateOrderStatus(selectedOrder.orderId, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        selectedOrder.orderStatus === st
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-xs text-slate-800 transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ── LEFT SIDEBAR (Apple Business / Shopify Admin style) ──────── */}
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
          
          {/* Sidebar Header with Live DB indicator */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
                MC
              </div>
              <div>
                <div className="font-black text-white text-sm tracking-tight leading-none">
                  MY COMPUTER
                </div>
                <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mt-1">
                  Admin Console
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5" title="MongoDB Atlas Live Connected">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>

          {/* Sidebar Scrollable Nav */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-6 text-xs font-medium no-scrollbar">
            
            {/* 1. MAIN */}
            <div>
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Dashboard & Catalog
              </div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Overview / Metrics</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('cards')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'cards'
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="w-4 h-4 shrink-0" />
                    <span>Card Management</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono font-bold">
                    Master
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('hero-cards')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'hero-cards'
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Hero 3D & Site Cards</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold">
                    3D Hero
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('all-products')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'all-products'
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 shrink-0" />
                    <span>All Products (Table)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">
                    {products.length}
                  </span>
                </button>
              </div>
            </div>

            {/* 2. CATEGORY WORKSPACES (11 Dedicated Workspaces) */}
            <div>
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                <span>Category Workspaces</span>
                <span className="text-[9px] text-blue-400 font-mono">11</span>
              </div>
              <div className="space-y-0.5">
                {CATEGORY_DEFINITIONS.map(cat => {
                  const Icon = cat.icon;
                  const isCurrent = activeTab === `category-${cat.id}`;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveTab(`category-${cat.id}`)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                          : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{cat.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. STORE DESIGN & CONTENT */}
            <div>
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Content & Storefront
              </div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('categories')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'categories'
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <FolderTree className="w-4 h-4 shrink-0" />
                  <span>Category Taxonomy</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('navbar')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'navbar'
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <Sliders className="w-4 h-4 shrink-0" />
                  <span>Navbar & Logo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('homepage')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'homepage'
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>Homepage Sections</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('footer')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'footer'
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Footer Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('card-appearance')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'card-appearance'
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <Palette className="w-4 h-4 shrink-0" />
                  <span>Card Appearance</span>
                </button>
              </div>
            </div>

            {/* 4. OPERATIONS & SETTINGS */}
            <div>
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Operations & Settings
              </div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'orders'
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-4 h-4 shrink-0" />
                    <span>Orders</span>
                  </div>
                  {stats.pendingOrders > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                      {stats.pendingOrders}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('inventory')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'inventory'
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Stock Monitor</span>
                  </div>
                  {stats.lowStockProducts > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                      {stats.lowStockProducts}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('media-library')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'media-library'
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 shrink-0" />
                  <span>Media Library</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'users'
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Registered Users</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>Store Settings</span>
                </button>
              </div>
            </div>

          </nav>

          {/* Admin User Profile & Sign Out Footer */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 truncate">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {adminUser?.username?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">
                    {adminUser?.name || 'Store Administrator'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    @{adminUser?.username || 'admin'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Sign out of admin console"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                handleLogout();
                setCurrentView('home');
              }}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-blue-400" />
              <span>Visit Live Storefront</span>
            </button>
          </div>

        </aside>

        {/* ── MAIN CONTENT AREA ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Top Global Bar */}
          <header className="h-16 bg-white border-b border-slate-200/90 px-6 sm:px-8 flex items-center justify-between shrink-0 z-10 shadow-2xs">
            <div className="flex items-center gap-3">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight capitalize">
                {activeTab === 'overview' && 'Store Operations & Intelligence'}
                {activeTab === 'cards' && 'Card Management (Master Grid)'}
                {activeTab === 'hero-cards' && 'Hero 3D Spatial Carousel & Site Cards'}
                {activeTab === 'all-products' && 'All Products Directory'}
                {activeTab.startsWith('category-') && `${CATEGORY_DEFINITIONS.find(c => `category-${c.id}` === activeTab)?.name || 'Category'} Workspace`}
                {activeTab === 'categories' && 'Category Taxonomy Management'}
                {activeTab === 'navbar' && 'Navbar & Logo Configuration'}
                {activeTab === 'homepage' && 'Homepage Content & Sections'}
                {activeTab === 'footer' && 'Footer Details & Contacts'}
                {activeTab === 'card-appearance' && 'Card Appearance System'}
                {activeTab === 'orders' && 'Customer Orders Management'}
                {activeTab === 'inventory' && 'Inventory & Stock Monitor'}
                {activeTab === 'media-library' && 'Media & Asset Library'}
                {activeTab === 'users' && 'Registered Users Directory'}
                {activeTab === 'settings' && 'Store & Security Settings'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {productsLoading && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Syncing...</span>
                </div>
              )}

              <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>MongoDB Atlas Synced</span>
              </div>

              <button
                type="button"
                onClick={() => handleOpenAddProduct()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            </div>
          </header>

          {/* Inner View Scroll Container */}
          <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50/70">
            <div className="max-w-7xl mx-auto space-y-6">
              
              {/* VIEW 1: OVERVIEW / DASHBOARD */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
                      <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                        <span>Total Store Revenue</span>
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                          <DollarSign className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-slate-900 tracking-tight">
                        ৳{Number(stats.totalRevenue).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                        From {stats.deliveredOrders} delivered order(s)
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
                      <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                        <span>Total Customer Orders</span>
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-slate-900 tracking-tight">
                        {stats.totalOrders}
                      </div>
                      <div className="text-[11px] text-amber-600 font-semibold mt-1">
                        {stats.pendingOrders} pending verification
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
                      <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                        <span>Live Catalog Products</span>
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                          <Package className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-slate-900 tracking-tight">
                        {products.length}
                      </div>
                      <div className="text-[11px] text-indigo-600 font-semibold mt-1">
                        Across 11 distinct categories
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
                      <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                        <span>Low / Out of Stock</span>
                        <div className="p-2 rounded-xl bg-red-50 text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-slate-900 tracking-tight">
                        {products.filter(p => Number(p.stockCount ?? p.stock ?? 0) <= 5).length}
                      </div>
                      <div className="text-[11px] text-red-600 font-semibold mt-1">
                        Needs attention in Stock Monitor
                      </div>
                    </div>
                  </div>

                  {/* Hero 3D Spatial Carousel Quick Management Card */}
                  <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden border border-blue-800/40">
                    <div className="relative z-10 max-w-xl">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 text-amber-300 text-xs font-bold mb-3 border border-blue-400/30">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Homepage Hero 3D Spatial Carousel</span>
                      </div>
                      <h3 className="text-xl font-black text-white tracking-tight mb-1">
                        Manage 10 Rotating 3D PC Hardware Cards
                      </h3>
                      <p className="text-xs text-blue-200/90 leading-relaxed">
                        Directly upload hardware photos from your computer, change titles, badges, specs, and price tags for the rotating 3D carousel on the homepage. Changes save directly to MongoDB Atlas and appear live instantly.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('hero-cards')}
                      className="relative z-10 px-5 py-3 rounded-2xl bg-white hover:bg-blue-50 text-slate-900 font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Manage Hero 3D Images</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
                  </div>

                  {/* 11 Categories Visual Jump Grid */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-black text-slate-900">11 Category Workspaces</h3>
                        <p className="text-xs text-slate-500">One-click jump into dedicated category card management</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {CATEGORY_DEFINITIONS.map(cat => {
                        const Icon = cat.icon;
                        const count = products.filter(p => {
                          const pCat = String(p.category || '').toLowerCase();
                          return pCat.includes(cat.id);
                        }).length;

                        return (
                          <div
                            key={cat.id}
                            onClick={() => setActiveTab(`category-${cat.id}`)}
                            className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 transition-all cursor-pointer flex items-center gap-3 group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-600 text-slate-700 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600">
                                {cat.name}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {count} products
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Orders Preview */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-black text-slate-900">Recent Customer Orders</h3>
                        <p className="text-xs text-slate-500">Latest orders placed on public storefront</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>View All Orders</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {orders.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-y border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <tr>
                              <th className="py-2.5 px-3">Order ID</th>
                              <th className="py-2.5 px-3">Customer</th>
                              <th className="py-2.5 px-3">Payment</th>
                              <th className="py-2.5 px-3 text-right">Total</th>
                              <th className="py-2.5 px-3 text-center">Status</th>
                              <th className="py-2.5 px-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {orders.slice(0, 5).map(o => (
                              <tr key={o.orderId} className="hover:bg-slate-50/60">
                                <td className="py-3 px-3 font-mono font-bold text-blue-600">{o.orderId}</td>
                                <td className="py-3 px-3">
                                  <div className="font-bold text-slate-900">{o.customer.name}</div>
                                  <div className="text-[10px] text-slate-500">{o.customer.phone}</div>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="font-medium text-slate-700">{o.paymentMethod}</span>
                                </td>
                                <td className="py-3 px-3 text-right font-black font-mono">
                                  ৳{Number(o.grandTotal).toLocaleString()}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                    {o.orderStatus}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <button
                                    onClick={() => setSelectedOrder(o)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                                  >
                                    Details
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-500">
                        No orders recorded yet. Real customer checkouts will appear here.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VIEW 2: MASTER CARD MANAGEMENT GRID */}
              {activeTab === 'cards' && (
                <div className="space-y-6">
                  {/* Quick Switcher Banner to Hero 3D Spatial Carousel Cards */}
                  <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md border border-blue-800/40">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 rounded-2xl bg-blue-500/20 text-amber-300 border border-blue-400/30 shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-white flex items-center gap-2">
                          <span>Homepage Hero 3D Spatial Carousel Cards</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-900 font-extrabold uppercase">
                            10 3D Cards
                          </span>
                        </div>
                        <div className="text-xs text-blue-200/90 mt-0.5">
                          Looking to change images, specs, or prices for the 10 rotating 3D PC hardware cards on the homepage?
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('hero-cards')}
                      className="px-4 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Manage Hero 3D Images</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>

                  {/* Filter and Search Bar */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={cardSearch}
                          onChange={e => setCardSearch(e.target.value)}
                          placeholder="Search product cards by title, brand, SKU..."
                          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
                        />
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Category filter */}
                        <select
                          value={cardCategoryFilter}
                          onChange={e => setCardCategoryFilter(e.target.value)}
                          className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden cursor-pointer"
                        >
                          <option value="all">All Categories</option>
                          {CATEGORY_DEFINITIONS.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>

                        {/* Stock filter */}
                        <select
                          value={cardStockFilter}
                          onChange={e => setCardStockFilter(e.target.value)}
                          className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden cursor-pointer"
                        >
                          <option value="all">All Stock Status</option>
                          <option value="in-stock">In Stock Only</option>
                          <option value="out-of-stock">Out of Stock</option>
                        </select>

                        {/* Visibility filter */}
                        <select
                          value={cardVisibilityFilter}
                          onChange={e => setCardVisibilityFilter(e.target.value)}
                          className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden cursor-pointer"
                        >
                          <option value="all">All Visibility</option>
                          <option value="visible">Published Only</option>
                          <option value="hidden">Hidden Only</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span>Showing <strong>{filteredCards.length}</strong> of <strong>{products.length}</strong> product cards</span>
                      <button
                        type="button"
                        onClick={() => handleOpenAddProduct()}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New Card</span>
                      </button>
                    </div>
                  </div>

                  {/* Cards Grid */}
                  {filteredCards.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                      {filteredCards.map(prod => (
                        <ProductCardItem
                          key={prod._id || prod.id || prod.productId}
                          product={prod}
                          token={token}
                          onEdit={handleOpenEditProduct}
                          onDuplicate={handleDuplicateProduct}
                          onDelete={setDeleteTargetProduct}
                          onPreview={handleOpenPreviewProduct}
                          onUpdateSuccess={fetchProducts}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
                      <p className="text-xs text-slate-500">No product cards match your filters.</p>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 3: ALL PRODUCTS TABLE */}
              {activeTab === 'all-products' && (
                <div className="space-y-6">
                  {/* Table Controls */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={tableSearch}
                        onChange={e => {
                          setTableSearch(e.target.value);
                          setTablePage(1);
                        }}
                        placeholder="Search product table by name, SKU, brand..."
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={tableCategoryFilter}
                        onChange={e => {
                          setTableCategoryFilter(e.target.value);
                          setTablePage(1);
                        }}
                        className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 cursor-pointer"
                      >
                        <option value="all">All Categories</option>
                        {CATEGORY_DEFINITIONS.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>

                      <select
                        value={tableStockFilter}
                        onChange={e => {
                          setTableStockFilter(e.target.value);
                          setTablePage(1);
                        }}
                        className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 cursor-pointer"
                      >
                        <option value="all">All Stock Status</option>
                        <option value="in-stock">In Stock Only</option>
                        <option value="out-of-stock">Out of Stock Only</option>
                      </select>

                      <select
                        value={`${tableSortBy}-${tableSortOrder}`}
                        onChange={e => {
                          const [by, order] = e.target.value.split('-') as ['name' | 'price' | 'stock', 'asc' | 'desc'];
                          setTableSortBy(by);
                          setTableSortOrder(order);
                        }}
                        className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 cursor-pointer"
                      >
                        <option value="name-asc">Sort: Name (A-Z)</option>
                        <option value="name-desc">Sort: Name (Z-A)</option>
                        <option value="price-asc">Sort: Price (Low to High)</option>
                        <option value="price-desc">Sort: Price (High to Low)</option>
                        <option value="stock-desc">Sort: Stock (Highest)</option>
                        <option value="stock-asc">Sort: Stock (Lowest)</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleOpenAddProduct()}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Product</span>
                      </button>
                    </div>
                  </div>

                  {/* Data Table */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <tr>
                            <th className="py-3 px-4">Item</th>
                            <th className="py-3 px-3">SKU</th>
                            <th className="py-3 px-3">Category</th>
                            <th className="py-3 px-3 text-center">Stock</th>
                            <th className="py-3 px-3 text-right">Selling Price</th>
                            <th className="py-3 px-3 text-center">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paginatedTableProducts.map(p => {
                            const pId = p._id || p.id || p.productId;
                            const img = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.image || '/images/placeholder.webp');
                            const price = p.discountPrice || p.regularPrice || p.price || 0;
                            const stock = p.stockCount ?? p.stock ?? 10;
                            const isAvailable = (p.stockStatus || p.availability || 'In Stock') === 'In Stock';

                            return (
                              <tr key={pId} className="hover:bg-slate-50/70">
                                <td className="py-3 px-4 flex items-center gap-3">
                                  <img
                                    src={img}
                                    alt={p.name}
                                    className="w-10 h-10 object-contain rounded-lg border border-slate-100 p-0.5 bg-slate-50 shrink-0"
                                  />
                                  <div className="max-w-xs truncate">
                                    <div className="font-bold text-slate-900 truncate" title={p.name}>
                                      {p.name}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-medium">
                                      Brand: {p.brand || 'Other'}
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                                  {p.sku || p.productId || 'MC-SKU'}
                                </td>

                                <td className="py-3 px-3">
                                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200/60">
                                    {p.category || 'General'}
                                  </span>
                                </td>

                                <td className="py-3 px-3 text-center font-bold font-mono">
                                  {stock}
                                </td>

                                <td className="py-3 px-3 text-right font-black font-mono text-slate-900">
                                  ৳{Number(price).toLocaleString()}
                                </td>

                                <td className="py-3 px-3 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isAvailable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                                  }`}>
                                    {isAvailable ? 'In Stock' : 'Out of Stock'}
                                  </span>
                                </td>

                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenPreviewProduct(p)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                      title="Preview storefront card"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditProduct(p)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                      title="Edit product"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDuplicateProduct(p)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                      title="Duplicate product"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteTargetProduct(p)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                      title="Delete product"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Table Pagination */}
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>
                        Page <strong>{tablePage}</strong> of <strong>{totalTablePages}</strong> ({tableProducts.length} items)
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={tablePage <= 1}
                          onClick={() => setTablePage(p => Math.max(1, p - 1))}
                          className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={tablePage >= totalTablePages}
                          onClick={() => setTablePage(p => Math.min(totalTablePages, p + 1))}
                          className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 4: CATEGORY WORKSPACES (11 Dedicated Workspaces) */}
              {activeTab.startsWith('category-') && (() => {
                const catId = activeTab.replace('category-', '');
                const catDef = CATEGORY_DEFINITIONS.find(c => c.id === catId);
                if (!catDef) return <div>Category not found</div>;

                return (
                  <CategoryWorkspace
                    categoryId={catDef.id}
                    categoryName={catDef.name}
                    categoryNameBn={catDef.nameBn}
                    iconName={catDef.iconName}
                    products={products}
                    token={token}
                    onAddProduct={handleOpenAddProduct}
                    onEditProduct={handleOpenEditProduct}
                    onDuplicateProduct={handleDuplicateProduct}
                    onDeleteProduct={setDeleteTargetProduct}
                    onPreviewProduct={handleOpenPreviewProduct}
                    onRefresh={fetchProducts}
                  />
                );
              })()}

              {/* VIEW 5: CATEGORY TAXONOMY MANAGEMENT */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        Public Category Taxonomy
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        11 active public categories with official icon bindings
                      </p>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200/60 flex items-center gap-1.5">
                      {categoriesLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{categoriesList.length || 11} Categories In Database</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {CATEGORY_DEFINITIONS.map(cat => {
                      const Icon = cat.icon;
                      const catProducts = products.filter(p => {
                        const pCat = String(p.category || '').toLowerCase();
                        return pCat.includes(cat.id);
                      });

                      return (
                        <div
                          key={cat.id}
                          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-start justify-between gap-4"
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                              <Icon className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
                              <div className="text-xs text-slate-500 font-medium">{cat.nameBn}</div>
                              <div className="text-[11px] text-blue-600 font-bold mt-2 font-mono">
                                {catProducts.length} Live Items
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setActiveTab(`category-${cat.id}`)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Workspace
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW 6: NAVBAR & LOGO MANAGEMENT */}
              {activeTab === 'navbar' && (
                <WebsiteContentManager initialSubTab="navbar" token={token} />
              )}

              {/* VIEW 7: HOMEPAGE SECTIONS */}
              {activeTab === 'homepage' && (
                <WebsiteContentManager initialSubTab="homepage" token={token} />
              )}

              {/* VIEW 8: FOOTER DETAILS */}
              {activeTab === 'footer' && (
                <WebsiteContentManager initialSubTab="footer" token={token} />
              )}

              {/* VIEW 9: CARD APPEARANCE */}
              {activeTab === 'card-appearance' && (
                <WebsiteContentManager initialSubTab="card-appearance" token={token} />
              )}

              {/* VIEW: HERO 3D CARDS & SITE CARDS */}
              {activeTab === 'hero-cards' && (
                <CardManager token={token} />
              )}

              {/* VIEW 10: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  {/* Orders Filter Bar */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={e => setOrderSearch(e.target.value)}
                        placeholder="Search by Order ID, customer phone, TrxID..."
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto no-scrollbar">
                      {(['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setOrderStatusFilter(st)}
                          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                            orderStatusFilter === st
                              ? 'bg-white text-slate-900 shadow-xs font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
                    {ordersLoading ? (
                      <div className="py-20 text-center text-xs text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                        <span>Loading orders from database...</span>
                      </div>
                    ) : orders.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <tr>
                              <th className="py-3 px-4">Order ID & Date</th>
                              <th className="py-3 px-3">Customer Details</th>
                              <th className="py-3 px-3">Payment Info</th>
                              <th className="py-3 px-3 text-right">Grand Total</th>
                              <th className="py-3 px-3 text-center">Status</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {orders.map(o => (
                              <tr key={o.orderId} className="hover:bg-slate-50/60">
                                <td className="py-3 px-4">
                                  <div className="font-mono font-bold text-blue-600">{o.orderId}</div>
                                  <div className="text-[10px] text-slate-500">
                                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-GB') : 'Recent'}
                                  </div>
                                </td>

                                <td className="py-3 px-3">
                                  <div className="font-bold text-slate-900">{o.customer.name}</div>
                                  <div className="text-[11px] text-slate-600 font-mono">{o.customer.phone}</div>
                                  <div className="text-[10px] text-slate-500 truncate max-w-xs">{o.delivery.address}</div>
                                </td>

                                <td className="py-3 px-3">
                                  <div className="font-bold text-slate-800">{o.paymentMethod}</div>
                                  {o.trxId && (
                                    <div className="text-[10px] font-mono text-blue-600">TrxID: {o.trxId}</div>
                                  )}
                                </td>

                                <td className="py-3 px-3 text-right font-black font-mono text-slate-900">
                                  ৳{Number(o.grandTotal).toLocaleString()}
                                </td>

                                <td className="py-3 px-3 text-center">
                                  <select
                                    value={o.orderStatus}
                                    onChange={e => handleUpdateOrderStatus(o.orderId, e.target.value as any)}
                                    className="px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden cursor-pointer"
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </td>

                                <td className="py-3 px-4 text-right">
                                  <button
                                    onClick={() => setSelectedOrder(o)}
                                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                                  >
                                    View Receipt
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-16 text-center text-xs text-slate-500">
                        No orders recorded matching the current filter.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VIEW 11: INVENTORY & STOCK MONITOR */}
              {activeTab === 'inventory' && (
                <div className="space-y-6">
                  {/* Top Bar */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={inventorySearch}
                        onChange={e => setInventorySearch(e.target.value)}
                        placeholder="Search stock monitor by product name, SKU..."
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setInventoryTab('all')}
                        className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                          inventoryTab === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                        }`}
                      >
                        All ({products.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setInventoryTab('low-stock')}
                        className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                          inventoryTab === 'low-stock' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-slate-600'
                        }`}
                      >
                        Low Stock (≤5)
                      </button>
                      <button
                        type="button"
                        onClick={() => setInventoryTab('out-of-stock')}
                        className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                          inventoryTab === 'out-of-stock' ? 'bg-white text-red-700 shadow-xs font-bold' : 'text-slate-600'
                        }`}
                      >
                        Out of Stock (0)
                      </button>
                    </div>
                  </div>

                  {/* Stock Monitor Table */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <tr>
                            <th className="py-3 px-4">Product Details</th>
                            <th className="py-3 px-3">SKU</th>
                            <th className="py-3 px-3">Category</th>
                            <th className="py-3 px-3 text-center">Current Stock</th>
                            <th className="py-3 px-3 text-center">Status</th>
                            <th className="py-3 px-4 text-right">Quick Restock Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {inventoryProducts.map(p => {
                            const pId = p._id || p.id || p.productId;
                            const stock = Number(p.stockCount ?? p.stock ?? 0);
                            const img = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.image || '/images/placeholder.webp');

                            return (
                              <tr key={pId} className="hover:bg-slate-50/60">
                                <td className="py-3 px-4 flex items-center gap-3">
                                  <img src={img} alt={p.name} className="w-9 h-9 object-contain rounded-lg border border-slate-100 bg-slate-50" />
                                  <div className="max-w-xs truncate font-bold text-slate-900" title={p.name}>
                                    {p.name}
                                  </div>
                                </td>

                                <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                                  {p.sku || p.productId || 'MC-SKU'}
                                </td>

                                <td className="py-3 px-3">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                                    {p.category}
                                  </span>
                                </td>

                                <td className="py-3 px-3 text-center font-black font-mono text-sm">
                                  {stock}
                                </td>

                                <td className="py-3 px-3 text-center">
                                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    stock > 5 ? 'bg-emerald-50 text-emerald-700' : stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                                  }`}>
                                    {stock > 5 ? 'Healthy' : stock > 0 ? 'Low Stock' : 'Out of Stock'}
                                  </span>
                                </td>

                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleInlineRestock(pId, 10)}
                                      className="px-2 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-bold text-[11px] transition-colors cursor-pointer"
                                    >
                                      +10 Units
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleInlineRestock(pId, 25)}
                                      className="px-2 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-bold text-[11px] transition-colors cursor-pointer"
                                    >
                                      +25 Units
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleInlineRestock(pId, 50)}
                                      className="px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-[11px] transition-colors cursor-pointer"
                                    >
                                      +50 Units
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 12: MEDIA LIBRARY */}
              {activeTab === 'media-library' && (
                <MediaLibraryManager token={token} />
              )}

              {/* VIEW 13: REGISTERED USERS */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span>Registered User Accounts</span>
                        {usersLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Manage customers, staff accounts, and role permissions
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={userSearch}
                          onChange={e => setUserSearch(e.target.value)}
                          placeholder="Search users..."
                          className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50/50 w-44"
                        />
                      </div>
                      <div className="text-xs font-bold text-slate-500 shrink-0">
                        Total Registered: <strong className="text-slate-900">{users.length}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <tr>
                            <th className="py-3 px-4">User</th>
                            <th className="py-3 px-3">Email Address</th>
                            <th className="py-3 px-3">Phone</th>
                            <th className="py-3 px-3 text-center">Role</th>
                            <th className="py-3 px-4 text-right">Joined Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {users
                            .filter(u => {
                              if (!userSearch.trim()) return true;
                              const q = userSearch.toLowerCase();
                              return (
                                u.name?.toLowerCase().includes(q) ||
                                u.email?.toLowerCase().includes(q) ||
                                (u.phone && u.phone.toLowerCase().includes(q))
                              );
                            })
                            .map(u => (
                            <tr key={u._id} className="hover:bg-slate-50/60">
                              <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                              <td className="py-3 px-3 font-mono text-slate-600">{u.email}</td>
                              <td className="py-3 px-3 font-mono text-slate-500">{u.phone || '—'}</td>
                              <td className="py-3 px-3 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  u.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {u.role || 'customer'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB') : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 14: STORE SETTINGS & DB SYNC */}
              {activeTab === 'settings' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Admin Credentials */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        <Key className="w-4 h-4 text-blue-600" />
                        <span>Administrator Security & Password</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Update administrator credentials safely using bcrypt password hashing
                      </p>
                    </div>

                    {settingsMessage && (
                      <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
                        settingsMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {settingsMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
                        <span>{settingsMessage.text}</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveSettings} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Admin Display Name</label>
                        <input
                          type="text"
                          value={settingsForm.name}
                          onChange={e => setSettingsForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Admin Email</label>
                        <input
                          type="email"
                          value={settingsForm.email}
                          onChange={e => setSettingsForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                        />
                      </div>

                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Change Password
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                          <input
                            type="password"
                            value={settingsForm.currentPassword}
                            onChange={e => setSettingsForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            placeholder="Required to set new password"
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                          <input
                            type="password"
                            value={settingsForm.newPassword}
                            onChange={e => setSettingsForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            placeholder="At least 6 characters"
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                          <input
                            type="password"
                            value={settingsForm.confirmPassword}
                            onChange={e => setSettingsForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={settingsSaving}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                      >
                        {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        <span>Update Security Credentials</span>
                      </button>
                    </form>
                  </div>

                  {/* Database Resync & Diagnostics */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 flex flex-col justify-between">
                    <div>
                      <div className="border-b border-slate-100 pb-4 mb-4">
                        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                          <Database className="w-4 h-4 text-emerald-600" />
                          <span>Database Architecture & Persistence</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Dual-store synchronization between MongoDB Atlas and local JSON data
                        </p>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                          <span className="font-bold text-slate-700">Cluster Status:</span>
                          <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>MongoDB Atlas Active</span>
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                          <span className="font-bold text-slate-700">Total Live Products:</span>
                          <span className="font-mono font-bold text-slate-900">{products.length} Items</span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                          <span className="font-bold text-slate-700">Categories Synced:</span>
                          <span className="font-mono font-bold text-slate-900">11 Categories</span>
                        </div>
                      </div>

                      <div className="mt-6 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900">
                        <div className="font-bold flex items-center gap-1.5 mb-1">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Real-time Live Synchronization</span>
                        </div>
                        <p className="text-[11px] text-emerald-800 leading-relaxed">
                          Every product edit, image upload, price adjustment, and stock toggle made in this Admin Panel automatically updates both MongoDB Atlas and server persistent storage, appearing instantly on the live website.
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleResyncDatabase}
                        disabled={seeding}
                        className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                      >
                        {seeding ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <RefreshCw className="w-4 h-4 text-blue-600" />}
                        <span>{seeding ? 'Synchronizing Cluster...' : 'Resync Database & Products'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </main>

        </div>

      </div>

    </div>
  );
};
