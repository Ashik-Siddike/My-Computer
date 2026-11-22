import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../../context/StoreContext';
import { resolveImageUrl } from '../../lib/api';
import type { SiteCard, CardSection, CardStatus, CardDevice } from '../../types';
import {
  LayoutGrid,
  Layers,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Edit2,
  Copy,
  Trash2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Sliders,
  Palette,
  Type,
  Link as LinkIcon,
  Image as ImageIcon,
  Settings,
  X,
  ShieldCheck,
  Wifi,
  HardDrive,
  Gamepad2,
  Camera,
  Truck,
  CreditCard,
  RotateCcw,
  Zap,
  Terminal,
  Watch,
  Keyboard,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  Loader2,
  Maximize2,
  Upload
} from 'lucide-react';

interface CardManagerProps {
  token: string | null;
}

const AVAILABLE_ICONS = [
  'Camera',
  'Wifi',
  'HardDrive',
  'Gamepad2',
  'ShieldCheck',
  'Truck',
  'CreditCard',
  'RotateCcw',
  'Zap',
  'Terminal',
  'Watch',
  'Keyboard',
  'Sparkles',
  'Layers',
  'Package',
  'Laptop',
  'Monitor',
];

const PRESET_COLORS = [
  { label: 'Blue', bg: '#eff6ff', text: '#0f172a', accent: '#2563eb', border: '#bfdbfe' },
  { label: 'Emerald', bg: '#ecfdf5', text: '#064e3b', accent: '#059669', border: '#a7f3d0' },
  { label: 'Purple', bg: '#f5f3ff', text: '#4c1d95', accent: '#7c3aed', border: '#ddd6fe' },
  { label: 'Red', bg: '#fef2f2', text: '#7f1d1d', accent: '#dc2626', border: '#fecaca' },
  { label: 'Amber', bg: '#fffbeb', text: '#78350f', accent: '#d97706', border: '#fde68a' },
  { label: 'Slate Dark', bg: '#0f172a', text: '#ffffff', accent: '#38bdf8', border: '#334155' },
  { label: 'Clean White', bg: '#ffffff', text: '#0f172a', accent: '#2563eb', border: '#e2e8f0' },
];

const DEFAULT_CARD_STATE: SiteCard = {
  id: '',
  name: 'New Custom Card',
  section: 'promo-banner',
  title: 'Exciting New Promo Headline',
  subtitle: 'Exclusive Tech Collection',
  description: 'Discover the latest verified hardware and devices with official warranty in Bangladesh.',
  badge: 'Special Offer',
  tagline: 'Official 1-Year BD Warranty',
  price: 5000,
  discountPrice: 4200,
  currency: '৳',
  image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800&auto=format&fit=crop',
  images: [],
  icon: 'Sparkles',
  buttonText: 'Shop Now',
  buttonLink: '/shop',
  buttonTarget: '_self',
  secondaryButtonText: 'Learn More',
  secondaryButtonLink: '/shop',
  secondaryButtonTarget: '_self',
  backgroundColor: '#ffffff',
  textColor: '#0f172a',
  accentColor: '#2563eb',
  borderColor: '#e2e8f0',
  borderWidth: '1px',
  borderRadius: '16px',
  shadow: 'md',
  padding: '24px',
  cardHeight: 'auto',
  titleSize: '22px',
  titleWeight: '700',
  displayOrder: 1,
  columnsSpan: 1,
  isVisible: true,
  status: 'published',
  targetDevice: 'all',
  targetEntityId: '',
  customClasses: '',
};

export const CardManager: React.FC<CardManagerProps> = ({ token }) => {
  const { addToast, refreshCards: refreshStoreCards } = useStore();

  // Cards State
  const [cards, setCards] = useState<SiteCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isNewCard, setIsNewCard] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'general' | 'content' | 'media' | 'styling' | 'buttons' | 'layout' | 'visibility' | 'advanced'
  >('general');
  const [editingCard, setEditingCard] = useState<SiteCard>(DEFAULT_CARD_STATE);
  const [saving, setSaving] = useState(false);

  // Image Upload state for card
  const cardFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCardImage, setUploadingCardImage] = useState(false);

  const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = (file.type && file.type.startsWith('image/')) || /\.(jpe?g|png|webp|gif|svg|avif|jfif|bmp)$/i.test(file.name);
    if (!isImage) {
      addToast('Invalid File', 'Please select a valid image file (PNG, JPG, WEBP, SVG, etc.).', 'warning');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      addToast('File Too Large', 'Maximum image size is 15MB.', 'warning');
      return;
    }

    setUploadingCardImage(true);

    // Read local data URL immediately for instant UI feedback
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUri = ev.target?.result as string;
      if (dataUri) {
        setEditingCard(prev => ({ ...prev, image: dataUri }));
      }
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('image', file);
      const authToken = token || sessionStorage.getItem('mc_admin_token') || localStorage.getItem('mc_admin_token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken || ''}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const finalUrl = data.url || data.dataUri || data.fileUrl;
        setEditingCard(prev => ({ ...prev, image: finalUrl }));
        addToast('Image Uploaded', 'New card image uploaded successfully.', 'success');
      } else {
        addToast('Upload Notice', data.error || 'Server upload failed, using local image.', 'warning');
      }
    } catch (err: any) {
      addToast('Upload Notice', 'Using local image preview. Click Save to persist.', 'info');
    } finally {
      setUploadingCardImage(false);
      if (cardFileInputRef.current) {
        cardFileInputRef.current.value = '';
      }
    }
  };

  // Live Preview Viewport
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<SiteCard | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (isEditorOpen || deleteTarget) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isEditorOpen, deleteTarget]);

  // Auth token resolver with session fallback
  const getAuthToken = useCallback(() => {
    return token || sessionStorage.getItem('mc_admin_token') || localStorage.getItem('mc_admin_token') || '';
  }, [token]);

  // Fetch all cards for admin
  const fetchAdminCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const authToken = getAuthToken();
      const res = await fetch('/api/cards/all', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCards(data.data);
      } else {
        setError(data.error || 'Failed to load card list');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching cards');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAdminCards();
  }, [fetchAdminCards]);

  // Section Counts
  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = { all: cards.length };
    cards.forEach(c => {
      counts[c.section] = (counts[c.section] || 0) + 1;
    });
    return counts;
  }, [cards]);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return cards
      .filter(card => {
        if (selectedSection !== 'all' && card.section !== selectedSection) return false;
        if (selectedStatus === 'published' && (card.status !== 'published' || !card.isVisible)) return false;
        if (selectedStatus === 'draft' && card.status !== 'draft') return false;
        if (selectedStatus === 'hidden' && card.isVisible !== false) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          return (
            card.name?.toLowerCase().includes(q) ||
            card.id?.toLowerCase().includes(q) ||
            card.title?.toLowerCase().includes(q) ||
            card.subtitle?.toLowerCase().includes(q) ||
            card.badge?.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [cards, selectedSection, selectedStatus, searchQuery]);

  // 1-Click Visibility Toggle
  const handleToggleVisibility = async (card: SiteCard) => {
    const nextState = !card.isVisible;
    // Optimistic local state update
    setCards(prev => prev.map(c => (c.id === card.id ? { ...c, isVisible: nextState } : c)));

    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ isVisible: nextState }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error);
      }
      addToast('Card Updated', `"${card.name}" is now ${nextState ? 'visible' : 'hidden'}.`, 'success');
      refreshStoreCards();
    } catch (err: any) {
      // Revert optimistic update
      setCards(prev => prev.map(c => (c.id === card.id ? { ...c, isVisible: !nextState } : c)));
      addToast('Update Failed', err.message || 'Could not update visibility.', 'warning');
    }
  };

  // Quick Reorder (Up / Down)
  const handleQuickReorder = async (card: SiteCard, direction: 'up' | 'down') => {
    const currentOrder = card.displayOrder || 1;
    const newOrder = direction === 'up' ? Math.max(1, currentOrder - 1) : currentOrder + 1;
    if (newOrder === currentOrder) return;

    // Optimistic update
    setCards(prev =>
      prev
        .map(c => (c.id === card.id ? { ...c, displayOrder: newOrder } : c))
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    );

    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ displayOrder: newOrder }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      refreshStoreCards();
    } catch {
      fetchAdminCards();
    }
  };

  // Duplicate Card
  const handleDuplicateCard = async (card: SiteCard) => {
    try {
      const clonedId = `${card.id}-copy-${Date.now().toString().slice(-4)}`;
      const clonedName = `${card.name} (Copy)`;
      const clonedCard: Partial<SiteCard> = {
        ...card,
        id: clonedId,
        name: clonedName,
        status: 'draft', // Created as draft initially
        displayOrder: (card.displayOrder || 0) + 1,
      };
      delete (clonedCard as any)._id;
      delete (clonedCard as any).createdAt;
      delete (clonedCard as any).updatedAt;

      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(clonedCard),
      });
      const data = await res.json();
      if (data.success) {
        addToast('Card Duplicated', `Created "${clonedName}". Opening in editor...`, 'success');
        await fetchAdminCards();
        refreshStoreCards();
        // Open the newly duplicated card in editor
        setEditingCard(data.data);
        setIsNewCard(false);
        setActiveTab('general');
        setIsEditorOpen(true);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      addToast('Duplicate Failed', err.message || 'Could not duplicate card', 'warning');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (card: SiteCard) => {
    setEditingCard({ ...card });
    setIsNewCard(false);
    setActiveTab('general');
    setIsEditorOpen(true);
  };

  // Open Create New Card Modal
  const handleOpenCreate = () => {
    const newId = `card-${Date.now().toString().slice(-6)}`;
    setEditingCard({
      ...DEFAULT_CARD_STATE,
      id: newId,
      name: 'New Custom Promo Card',
      displayOrder: cards.length + 1,
    });
    setIsNewCard(true);
    setActiveTab('general');
    setIsEditorOpen(true);
  };

  // Save Card (Draft or Published)
  const handleSaveCard = async (statusOverride?: CardStatus) => {
    if (!editingCard.name.trim() || !editingCard.title.trim()) {
      addToast('Validation Error', 'Card Name and Title are required.', 'warning');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...editingCard,
        status: statusOverride || editingCard.status || 'published',
        isVisible: statusOverride === 'published' ? true : editingCard.isVisible,
      };

      const url = isNewCard ? '/api/cards' : `/api/cards/${editingCard.id}`;
      const method = isNewCard ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        addToast(
          'Card Saved',
          `Card "${payload.name}" has been ${statusOverride === 'draft' ? 'saved as Draft' : 'published live'}.`,
          'success'
        );
        setIsEditorOpen(false);
        await fetchAdminCards();
        refreshStoreCards();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      addToast('Save Failed', err.message || 'Error saving card details', 'warning');
    } finally {
      setSaving(false);
    }
  };

  // Delete Card
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/cards/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        addToast('Card Deleted', `Card "${deleteTarget.name}" was permanently removed.`, 'success');
        setDeleteTarget(null);
        await fetchAdminCards();
        refreshStoreCards();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      addToast('Delete Failed', err.message || 'Failed to delete card', 'warning');
    } finally {
      setDeleting(false);
    }
  };

  // Icon Render Helper
  const renderCardIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Camera': return <Camera className="w-5 h-5" />;
      case 'Wifi': return <Wifi className="w-5 h-5" />;
      case 'HardDrive': return <HardDrive className="w-5 h-5" />;
      case 'Gamepad2': return <Gamepad2 className="w-5 h-5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
      case 'Truck': return <Truck className="w-5 h-5" />;
      case 'CreditCard': return <CreditCard className="w-5 h-5" />;
      case 'RotateCcw': return <RotateCcw className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'Terminal': return <Terminal className="w-5 h-5" />;
      case 'Watch': return <Watch className="w-5 h-5" />;
      case 'Keyboard': return <Keyboard className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Card Management System</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                    {cards.length} Total Cards
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full control over homepage hero slides, category cards, promotional banners, and value proposition cards
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={fetchAdminCards}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Card</span>
            </button>
          </div>
        </div>

        {/* Section Filter Pills */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Cards', icon: Layers },
            { id: 'homepage-hero', label: 'Hero 3D Carousel Cards', icon: Sparkles },
            { id: 'category-card', label: 'Category Cards', icon: LayoutGrid },
            { id: 'value-proposition', label: 'Value Propositions', icon: ShieldCheck },
            { id: 'promo-banner', label: 'Promotional Banners', icon: Zap },
            { id: 'custom', label: 'Store Vouchers & Custom', icon: Sliders },
          ].map(sec => {
            const Icon = sec.icon;
            const count = sectionCounts[sec.id] || 0;
            const isActive = selectedSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sec.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-700 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Status Controls */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search cards by name, unique ID, title, subtitle, or badge..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-hidden focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-400 whitespace-nowrap">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All ({cards.length})</option>
              <option value="published">Published &amp; Active</option>
              <option value="draft">Drafts Only</option>
              <option value="hidden">Hidden / Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Cards Grid Listing */}
      {loading && cards.length === 0 ? (
        <div className="p-16 text-center bg-slate-900 border border-slate-800 rounded-3xl">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">Loading cards from database...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-950/40 border border-red-800/60 rounded-3xl text-red-300">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-400" />
          <p className="text-sm font-bold">Failed to load cards: {error}</p>
          <button
            onClick={fetchAdminCards}
            className="mt-4 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="p-16 text-center bg-slate-900 border border-slate-800 rounded-3xl">
          <LayoutGrid className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Cards Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {searchQuery
              ? `No card matched your search query "${searchQuery}". Try a different keyword.`
              : 'No cards are currently available in this section.'}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create a Card Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCards.map((card, index) => {
            const isDraft = card.status === 'draft';
            const isHidden = !card.isVisible;

            return (
              <div
                key={card.id || index}
                className={`group bg-slate-900 border rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-slate-600 flex flex-col ${
                  isHidden ? 'border-dashed border-slate-700/80 opacity-70' : 'border-slate-800'
                }`}
              >
                {/* Visual Card Header & Preview */}
                <div
                  className="relative h-44 w-full overflow-hidden flex flex-col justify-between p-4"
                  style={{
                    backgroundColor: card.backgroundColor || '#ffffff',
                    color: card.textColor || '#0f172a',
                  }}
                >
                  {/* Background Image / Overlay if present */}
                  {card.image && (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: `url(${resolveImageUrl(card.image)})` }}
                    />
                  )}

                  {/* Top Bar inside card visual */}
                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs"
                      style={{
                        backgroundColor: card.accentColor || '#2563eb',
                        color: '#ffffff',
                      }}
                    >
                      {card.badge || card.section}
                    </span>

                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-white text-[11px] font-mono">
                      <span>#{card.displayOrder || index + 1}</span>
                    </div>
                  </div>

                  {/* Center Content Preview */}
                  <div className="relative z-10 space-y-1">
                    <div className="flex items-center gap-2">
                      {card.icon && (
                        <div
                          className="p-1 rounded-md"
                          style={{ color: card.accentColor || '#2563eb' }}
                        >
                          {renderCardIcon(card.icon)}
                        </div>
                      )}
                      <h4
                        className="font-bold line-clamp-1"
                        style={{
                          fontSize: card.titleSize || '18px',
                          fontWeight: card.titleWeight || '700',
                          color: card.textColor || '#0f172a',
                        }}
                      >
                        {card.title}
                      </h4>
                    </div>

                    {card.subtitle && (
                      <p
                        className="text-xs line-clamp-1 font-medium opacity-80"
                        style={{ color: card.textColor || '#0f172a' }}
                      >
                        {card.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Bottom Bar: Action Preview & Price */}
                  <div className="relative z-10 flex items-center justify-between pt-2 border-t border-black/10">
                    {card.price ? (
                      <div className="font-extrabold text-xs">
                        {card.currency || '৳'}
                        {(card.discountPrice || card.price).toLocaleString()}
                      </div>
                    ) : (
                      <span className="text-[11px] font-semibold opacity-75">{card.tagline || 'Standard View'}</span>
                    )}

                    {card.buttonText && (
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs"
                        style={{
                          backgroundColor: card.accentColor || '#2563eb',
                          color: '#ffffff',
                        }}
                      >
                        {card.buttonText}
                      </span>
                    )}
                  </div>

                  {/* Status Overlay Watermark */}
                  {isDraft && (
                    <div className="absolute top-2 right-2 bg-amber-500/90 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider shadow">
                      Draft
                    </div>
                  )}
                  {isHidden && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
                      <div className="bg-slate-900 border border-slate-700 text-slate-300 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg">
                        <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                        <span>Hidden on Website</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Metadata & Administrative Controls */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                          {card.name}
                        </h3>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          ID: <span className="text-slate-300 font-semibold">{card.id}</span>
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                          card.section === 'homepage-hero'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : card.section === 'category-card'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : card.section === 'value-proposition'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {card.section === 'homepage-hero' ? 'Hero 3D Card' : card.section}
                      </span>
                    </div>

                    {card.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                        {card.description}
                      </p>
                    )}
                  </div>

                  {/* Administrative Action Buttons */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    {/* Order Controls & Visibility */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuickReorder(card, 'up')}
                        title="Move Order Up"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleQuickReorder(card, 'down')}
                        title="Move Order Down"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleVisibility(card)}
                        title={card.isVisible ? 'Hide on live website' : 'Make visible on live website'}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          card.isVisible
                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                        }`}
                      >
                        {card.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Duplicate, Edit, Delete Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDuplicateCard(card)}
                        title="Duplicate this card"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(card)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => setDeleteTarget(card)}
                        title="Delete Card"
                        className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 border border-red-800/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. PROFESSIONAL 8-TAB CARD EDITOR MODAL WITH LIVE PREVIEW */}
      {isEditorOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {isNewCard ? 'Create New Website Card' : `Edit: ${editingCard.name}`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configure content, media, colors, buttons, layout, and live interactive preview
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs (8 Organized Tabs) */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 flex items-center gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'general', label: '1. General', icon: Sliders },
                { id: 'content', label: '2. Content & Text', icon: Type },
                { id: 'media', label: '3. Images & Media', icon: ImageIcon },
                { id: 'styling', label: '4. Colors & Styling', icon: Palette },
                { id: 'buttons', label: '5. Buttons & Links', icon: LinkIcon },
                { id: 'layout', label: '6. Layout & Spacing', icon: Maximize2 },
                { id: 'visibility', label: '7. Visibility', icon: Eye },
                { id: 'advanced', label: '8. Advanced', icon: Settings },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-3 text-xs font-bold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                      isActive
                        ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body: Split 2-Column Layout (Form Controls Left, Live Preview Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
              
              {/* Left Column: Form Controls (7 cols) */}
              <div className="lg:col-span-7 p-6 overflow-y-auto max-h-[60vh] lg:max-h-[64vh] space-y-6 border-b lg:border-b-0 lg:border-r border-slate-800">
                
                {/* TAB 1: GENERAL INFORMATION */}
                {activeTab === 'general' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider">General Information</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Card Name (Internal Label) *</label>
                        <input
                          type="text"
                          value={editingCard.name}
                          onChange={e => setEditingCard({ ...editingCard, name: e.target.value })}
                          placeholder="e.g. Hero Slide 1 - Wi-Fi Routers"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Unique Identifier (Slug / ID) *</label>
                        <input
                          type="text"
                          value={editingCard.id}
                          disabled={!isNewCard}
                          onChange={e => setEditingCard({ ...editingCard, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-') })}
                          placeholder="e.g. hero-slide-1"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs disabled:opacity-50 font-mono"
                        />
                        <span className="text-[10px] text-slate-500">Unique alphanumeric key used for system queries</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Website Section *</label>
                        <select
                          value={editingCard.section}
                          onChange={e => setEditingCard({ ...editingCard, section: e.target.value as CardSection })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden cursor-pointer"
                        >
                          <option value="homepage-hero">Hero 3D Carousel Card (homepage-hero)</option>
                          <option value="category-card">Category Card</option>
                          <option value="value-proposition">Value Proposition Banner</option>
                          <option value="promo-banner">Promotional Banner</option>
                          <option value="product-card">Product / Showcase Card</option>
                          <option value="custom">Custom / Store Voucher</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Display Order (Sort Position)</label>
                        <input
                          type="number"
                          value={editingCard.displayOrder}
                          onChange={e => setEditingCard({ ...editingCard, displayOrder: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Target Entity Reference (Optional)</label>
                      <input
                        type="text"
                        value={editingCard.targetEntityId || ''}
                        onChange={e => setEditingCard({ ...editingCard, targetEntityId: e.target.value })}
                        placeholder="e.g. networking, camera, or specific product ID"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden font-mono"
                      />
                      <span className="text-[10px] text-slate-500">Links this card directly to an official category or product.</span>
                    </div>
                  </div>
                )}

                {/* TAB 2: CONTENT & TEXT */}
                {activeTab === 'content' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider">Content &amp; Copywriting</h4>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Primary Title / Headline *</label>
                      <input
                        type="text"
                        value={editingCard.title}
                        onChange={e => setEditingCard({ ...editingCard, title: e.target.value })}
                        placeholder="e.g. Wi-Fi 6 & Mesh Routers"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Subtitle / Highlight</label>
                        <input
                          type="text"
                          value={editingCard.subtitle || ''}
                          onChange={e => setEditingCard({ ...editingCard, subtitle: e.target.value })}
                          placeholder="e.g. Ultra Fast Gigabit"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Badge / Tag Label</label>
                        <input
                          type="text"
                          value={editingCard.badge || ''}
                          onChange={e => setEditingCard({ ...editingCard, badge: e.target.value })}
                          placeholder="e.g. Enterprise Networking, 15% OFF"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Card Description / Details</label>
                      <textarea
                        rows={3}
                        value={editingCard.description || ''}
                        onChange={e => setEditingCard({ ...editingCard, description: e.target.value })}
                        placeholder="Detailed description, bullet features, warranty highlights..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Tagline / Warranty</label>
                        <input
                          type="text"
                          value={editingCard.tagline || ''}
                          onChange={e => setEditingCard({ ...editingCard, tagline: e.target.value })}
                          placeholder="e.g. Official BD Warranty"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Regular Price (Optional)</label>
                        <input
                          type="number"
                          value={editingCard.price || ''}
                          onChange={e => setEditingCard({ ...editingCard, price: e.target.value ? Number(e.target.value) : undefined })}
                          placeholder="8500"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Discount Price (Optional)</label>
                        <input
                          type="number"
                          value={editingCard.discountPrice || ''}
                          onChange={e => setEditingCard({ ...editingCard, discountPrice: e.target.value ? Number(e.target.value) : undefined })}
                          placeholder="7200"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: IMAGES & MEDIA */}
                {activeTab === 'media' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider">Images &amp; Visual Icons</h4>
                      <span className="text-[11px] text-slate-400">Supports PNG, JPG, WebP up to 15MB</span>
                    </div>

                    {/* Image Preview & Upload Container */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-2">Card Image / Photograph</label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        {editingCard.image ? (
                          <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shrink-0 group shadow-md">
                            <img
                              src={resolveImageUrl(editingCard.image)}
                              alt="Card Preview"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800&auto=format&fit=crop';
                              }}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setEditingCard({ ...editingCard, image: '' })}
                              className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-red-600/90 text-white hover:bg-red-500 transition-colors cursor-pointer"
                              title="Remove Image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-28 h-28 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center text-slate-500 shrink-0">
                            <ImageIcon className="w-8 h-8 mb-1 text-slate-600" />
                            <span className="text-[10px]">No Image</span>
                          </div>
                        )}

                        <div className="flex-1 space-y-3 w-full">
                          <input
                            type="file"
                            ref={cardFileInputRef}
                            onChange={handleCardImageUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => cardFileInputRef.current?.click()}
                              disabled={uploadingCardImage}
                              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/30"
                            >
                              {uploadingCardImage ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4" />
                              )}
                              <span>{uploadingCardImage ? 'Uploading Image...' : 'Upload Image from Computer'}</span>
                            </button>
                            {editingCard.image && (
                              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Image Ready
                              </span>
                            )}
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                              Or Paste Direct Image URL:
                            </label>
                            <input
                              type="url"
                              value={editingCard.image || ''}
                              onChange={e => setEditingCard({ ...editingCard, image: e.target.value })}
                              placeholder="https://images.unsplash.com/... or /uploads/..."
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Image Presets */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        High-Quality Component Presets:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { label: 'RTX 4090 GPU', url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=800&auto=format&fit=crop' },
                          { label: 'Intel i9 CPU', url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=800&auto=format&fit=crop' },
                          { label: 'Z790 Motherboard', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop' },
                          { label: 'DDR5 RAM', url: 'https://images.unsplash.com/photo-1562976540-1502c2145186?q=80&w=800&auto=format&fit=crop' },
                          { label: 'Samsung 990 SSD', url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=800&auto=format&fit=crop' },
                          { label: 'Kraken 360 Cooler', url: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=800&auto=format&fit=crop' },
                          { label: 'Lian Li Casing', url: 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?q=80&w=800&auto=format&fit=crop' },
                          { label: 'Seasonic PSU', url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=800&auto=format&fit=crop' },
                          { label: 'OLED Monitor', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop' },
                          { label: 'Custom Keyboard', url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=800&auto=format&fit=crop' },
                        ].map((preset, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setEditingCard({ ...editingCard, image: preset.url })}
                            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-300 hover:text-white transition-all text-left flex items-center gap-1.5 cursor-pointer"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="truncate">{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Icon Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-2">Display Icon (Lucide Icon)</label>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-950 rounded-2xl border border-slate-800">
                        {AVAILABLE_ICONS.map(iconName => (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setEditingCard({ ...editingCard, icon: iconName })}
                            className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all cursor-pointer ${
                              editingCard.icon === iconName
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {renderCardIcon(iconName)}
                            <span className="truncate max-w-[55px]">{iconName}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: COLORS & STYLING */}
                {activeTab === 'styling' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider">Colors &amp; Styling</h4>

                    {/* Quick Color Presets */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">Color Palette Presets:</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {PRESET_COLORS.map((preset, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() =>
                              setEditingCard({
                                ...editingCard,
                                backgroundColor: preset.bg,
                                textColor: preset.text,
                                accentColor: preset.accent,
                                borderColor: preset.border,
                              })
                            }
                            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center gap-2 text-left cursor-pointer transition-all"
                          >
                            <div
                              className="w-5 h-5 rounded-lg border shadow-xs"
                              style={{ backgroundColor: preset.bg, borderColor: preset.border }}
                            />
                            <span className="text-xs font-bold text-slate-300">{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Background Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editingCard.backgroundColor?.startsWith('#') ? editingCard.backgroundColor : '#ffffff'}
                            onChange={e => setEditingCard({ ...editingCard, backgroundColor: e.target.value })}
                            className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingCard.backgroundColor || '#ffffff'}
                            onChange={e => setEditingCard({ ...editingCard, backgroundColor: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Text Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editingCard.textColor?.startsWith('#') ? editingCard.textColor : '#0f172a'}
                            onChange={e => setEditingCard({ ...editingCard, textColor: e.target.value })}
                            className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingCard.textColor || '#0f172a'}
                            onChange={e => setEditingCard({ ...editingCard, textColor: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Accent / Brand Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editingCard.accentColor?.startsWith('#') ? editingCard.accentColor : '#2563eb'}
                            onChange={e => setEditingCard({ ...editingCard, accentColor: e.target.value })}
                            className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingCard.accentColor || '#2563eb'}
                            onChange={e => setEditingCard({ ...editingCard, accentColor: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: BUTTONS & LINKS */}
                {activeTab === 'buttons' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider">Buttons &amp; Call To Actions</h4>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <h5 className="text-xs font-bold text-slate-200">Primary Button</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Button Text</label>
                          <input
                            type="text"
                            value={editingCard.buttonText || ''}
                            onChange={e => setEditingCard({ ...editingCard, buttonText: e.target.value })}
                            placeholder="e.g. Explore Networking"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Destination URL / Path</label>
                          <input
                            type="text"
                            value={editingCard.buttonLink || ''}
                            onChange={e => setEditingCard({ ...editingCard, buttonLink: e.target.value })}
                            placeholder="/shop?category=networking"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <h5 className="text-xs font-bold text-slate-200">Secondary Button (Optional)</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Secondary Button Text</label>
                          <input
                            type="text"
                            value={editingCard.secondaryButtonText || ''}
                            onChange={e => setEditingCard({ ...editingCard, secondaryButtonText: e.target.value })}
                            placeholder="e.g. Compare Models"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Destination URL / Path</label>
                          <input
                            type="text"
                            value={editingCard.secondaryButtonLink || ''}
                            onChange={e => setEditingCard({ ...editingCard, secondaryButtonLink: e.target.value })}
                            placeholder="/shop?category=networking"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 6: LAYOUT & SPACING */}
                {activeTab === 'layout' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider">Layout, Borders &amp; Spacing</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Corner Radius</label>
                        <select
                          value={editingCard.borderRadius || '16px'}
                          onChange={e => setEditingCard({ ...editingCard, borderRadius: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs cursor-pointer"
                        >
                          <option value="0px">Sharp (0px)</option>
                          <option value="8px">Small (8px)</option>
                          <option value="16px">Medium (16px)</option>
                          <option value="24px">Large (24px)</option>
                          <option value="32px">Extra Large (32px)</option>
                          <option value="9999px">Pill / Round (9999px)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Border Width</label>
                        <select
                          value={editingCard.borderWidth || '1px'}
                          onChange={e => setEditingCard({ ...editingCard, borderWidth: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs cursor-pointer"
                        >
                          <option value="0px">No Border (0px)</option>
                          <option value="1px">Thin (1px)</option>
                          <option value="2px">Medium (2px)</option>
                          <option value="4px">Thick (4px)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Padding</label>
                        <select
                          value={editingCard.padding || '24px'}
                          onChange={e => setEditingCard({ ...editingCard, padding: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs cursor-pointer"
                        >
                          <option value="12px">Compact (12px)</option>
                          <option value="20px">Standard (20px)</option>
                          <option value="28px">Spacious (28px)</option>
                          <option value="36px">Extra Spacious (36px)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Elevation / Shadow</label>
                        <select
                          value={editingCard.shadow || 'md'}
                          onChange={e => setEditingCard({ ...editingCard, shadow: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs cursor-pointer"
                        >
                          <option value="none">Flat (None)</option>
                          <option value="sm">Soft (Small)</option>
                          <option value="md">Medium</option>
                          <option value="lg">Large Elevated</option>
                          <option value="xl">Dramatic 3D</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 7: VISIBILITY & DISPLAY */}
                {activeTab === 'visibility' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider">Visibility &amp; Device Targeting</h4>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-xs font-bold text-white">Live on Public Website</h5>
                          <p className="text-[11px] text-slate-400">Toggle whether this card displays to active store visitors</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingCard({ ...editingCard, isVisible: !editingCard.isVisible })}
                          className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                            editingCard.isVisible ? 'bg-emerald-600' : 'bg-slate-700'
                          }`}
                        >
                          <span
                            className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                              editingCard.isVisible ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <div>
                          <h5 className="text-xs font-bold text-white">Publishing State</h5>
                          <p className="text-[11px] text-slate-400">Published cards go live immediately; Drafts remain private</p>
                        </div>
                        <select
                          value={editingCard.status}
                          onChange={e => setEditingCard({ ...editingCard, status: e.target.value as CardStatus })}
                          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white cursor-pointer"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft (Work in Progress)</option>
                        </select>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <div>
                          <h5 className="text-xs font-bold text-white">Device Targeting</h5>
                          <p className="text-[11px] text-slate-400">Limit card to specific screen sizes if desired</p>
                        </div>
                        <select
                          value={editingCard.targetDevice || 'all'}
                          onChange={e => setEditingCard({ ...editingCard, targetDevice: e.target.value as CardDevice })}
                          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white cursor-pointer"
                        >
                          <option value="all">All Devices (Responsive)</option>
                          <option value="desktop">Desktop / Laptop Only</option>
                          <option value="mobile">Mobile Devices Only</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 8: ADVANCED SETTINGS */}
                {activeTab === 'advanced' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider">Advanced Developer Settings</h4>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Custom CSS / Tailwind Classes</label>
                      <input
                        type="text"
                        value={editingCard.customClasses || ''}
                        onChange={e => setEditingCard({ ...editingCard, customClasses: e.target.value })}
                        placeholder="e.g. hover:scale-105 transition-transform"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <h5 className="text-xs font-bold text-slate-300">System Audit Information</h5>
                      <div className="text-[11px] font-mono text-slate-400 space-y-1">
                        <div>Card Slug ID: <span className="text-slate-200">{editingCard.id}</span></div>
                        <div>Database Section: <span className="text-slate-200">{editingCard.section}</span></div>
                        <div>Status: <span className="text-slate-200">{editingCard.status}</span></div>
                        <div>Visibility: <span className="text-slate-200">{editingCard.isVisible ? 'Active' : 'Hidden'}</span></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: REAL-TIME INTERACTIVE LIVE PREVIEW (5 cols) */}
              <div className="lg:col-span-5 bg-slate-950 p-6 flex flex-col justify-between overflow-y-auto max-h-[60vh] lg:max-h-[64vh]">
                <div>
                  {/* Preview Toolbar */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black uppercase text-white tracking-wider">Real-Time Preview</span>
                    </div>

                    {/* Viewport Switcher */}
                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setPreviewViewport('desktop')}
                        title="Desktop View (100%)"
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          previewViewport === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewViewport('tablet')}
                        title="Tablet View (768px)"
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          previewViewport === 'tablet' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Tablet className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewViewport('mobile')}
                        title="Mobile Phone View (375px)"
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          previewViewport === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Viewport Container */}
                  <div className="flex justify-center py-2">
                    <div
                      className={`transition-all duration-300 w-full ${
                        previewViewport === 'mobile'
                          ? 'max-w-[340px] border-4 border-slate-800 rounded-3xl p-3 shadow-2xl bg-slate-900'
                          : previewViewport === 'tablet'
                          ? 'max-w-[480px]'
                          : 'max-w-full'
                      }`}
                    >
                      {/* Rendered Live Card Preview */}
                      <div
                        className="relative overflow-hidden transition-all duration-300 flex flex-col justify-between"
                        style={{
                          backgroundColor: editingCard.backgroundColor || '#ffffff',
                          color: editingCard.textColor || '#0f172a',
                          borderRadius: editingCard.borderRadius || '16px',
                          borderWidth: editingCard.borderWidth || '1px',
                          borderColor: editingCard.borderColor || '#e2e8f0',
                          padding: editingCard.padding || '24px',
                          minHeight: editingCard.cardHeight !== 'auto' ? editingCard.cardHeight : '240px',
                          boxShadow:
                            editingCard.shadow === 'none'
                              ? 'none'
                              : editingCard.shadow === 'sm'
                              ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                              : editingCard.shadow === 'lg'
                              ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                              : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        {/* Background Image / Overlay if present */}
                        {editingCard.image && (
                          <div
                            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-multiply pointer-events-none"
                            style={{ backgroundImage: `url(${resolveImageUrl(editingCard.image)})` }}
                          />
                        )}

                        {/* Top Badges */}
                        <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
                          {editingCard.badge ? (
                            <span
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                              style={{
                                backgroundColor: editingCard.accentColor || '#2563eb',
                                color: '#ffffff',
                              }}
                            >
                              {editingCard.badge}
                            </span>
                          ) : <div />}

                          {editingCard.status === 'draft' && (
                            <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md uppercase">
                              Draft
                            </span>
                          )}
                        </div>

                        {/* Middle Content */}
                        <div className="relative z-10 space-y-1.5 my-auto">
                          <div className="flex items-center gap-2">
                            {editingCard.icon && (
                              <div
                                className="p-1 rounded-md"
                                style={{ color: editingCard.accentColor || '#2563eb' }}
                              >
                                {renderCardIcon(editingCard.icon)}
                              </div>
                            )}
                            <h3
                              className="font-bold leading-tight"
                              style={{
                                fontSize: editingCard.titleSize || '20px',
                                fontWeight: editingCard.titleWeight || '700',
                                color: editingCard.textColor || '#0f172a',
                              }}
                            >
                              {editingCard.title || 'Card Headline'}
                            </h3>
                          </div>

                          {editingCard.subtitle && (
                            <p
                              className="text-xs font-semibold opacity-85"
                              style={{ color: editingCard.textColor || '#0f172a' }}
                            >
                              {editingCard.subtitle}
                            </p>
                          )}

                          {editingCard.description && (
                            <p
                              className="text-[11px] leading-relaxed opacity-75 line-clamp-3"
                              style={{ color: editingCard.textColor || '#0f172a' }}
                            >
                              {editingCard.description}
                            </p>
                          )}
                        </div>

                        {/* Bottom Actions & Price */}
                        <div className="relative z-10 pt-4 mt-3 border-t border-black/10 flex flex-wrap items-center justify-between gap-2">
                          {editingCard.price ? (
                            <div className="font-black text-sm">
                              {editingCard.currency || '৳'}
                              {(editingCard.discountPrice || editingCard.price).toLocaleString()}
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold opacity-75">
                              {editingCard.tagline || 'Special Selection'}
                            </span>
                          )}

                          <div className="flex items-center gap-1.5">
                            {editingCard.buttonText && (
                              <button
                                type="button"
                                className="px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-transform hover:scale-105"
                                style={{
                                  backgroundColor: editingCard.accentColor || '#2563eb',
                                  color: '#ffffff',
                                }}
                              >
                                {editingCard.buttonText}
                              </button>
                            )}
                            {editingCard.secondaryButtonText && (
                              <button
                                type="button"
                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-black/20 opacity-80"
                                style={{ color: editingCard.textColor || '#0f172a' }}
                              >
                                {editingCard.secondaryButtonText}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
                  Live preview renders with exact CSS properties before saving to database.
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                Cancel Changes
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveCard('draft')}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveCard('published')}
                  className="flex-1 sm:flex-initial px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 4. DELETE CONFIRMATION MODAL */}
      {deleteTarget && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-800/60 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Card Confirmation</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete the card <strong className="text-white">"{deleteTarget.name}"</strong> (ID: {deleteTarget.id})? It will be removed from both MongoDB and local storage.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-600/30 cursor-pointer"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
