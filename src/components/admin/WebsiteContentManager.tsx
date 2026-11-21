import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Upload,
  Image as ImageIcon,
  Save,
  Sliders,
  Loader2,
  Eye,
  EyeOff,
  Layers,
  FileText,
  Palette,
  Monitor,
  CheckCircle2
} from 'lucide-react';

interface WebsiteContentManagerProps {
  initialSubTab?: 'navbar' | 'homepage' | 'footer' | 'card-appearance';
  token: string | null;
}

export const WebsiteContentManager: React.FC<WebsiteContentManagerProps> = ({
  initialSubTab = 'navbar',
  token,
}) => {
  const { siteSettings, updateSiteSettings, addToast } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [subTab, setSubTab] = useState<'navbar' | 'homepage' | 'footer' | 'card-appearance'>(initialSubTab);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  // Form states mirrored from siteSettings
  const [navbarForm, setNavbarForm] = useState({
    brandName: siteSettings?.navbar?.brandName || 'MY COMPUTER',
    tagline: siteSettings?.navbar?.tagline || 'Leading Tech Retailer & System Integrator in Bangladesh',
    logoUrl: siteSettings?.navbar?.logoUrl || '/images/logo.png',
    logoHeight: siteSettings?.navbar?.logoHeight || 36,
  });

  const [homepageForm, setHomepageForm] = useState({
    sections: {
      heroSlider: siteSettings?.homepage?.sections?.heroSlider !== false,
      featuredCategories: siteSettings?.homepage?.sections?.featuredCategories !== false,
      featuredProducts: siteSettings?.homepage?.sections?.featuredProducts !== false,
      latestArrivals: siteSettings?.homepage?.sections?.latestArrivals !== false,
      gamingZone: siteSettings?.homepage?.sections?.gamingZone !== false,
      brands: siteSettings?.homepage?.sections?.brands !== false,
    },
    titles: {
      featuredTitle: siteSettings?.homepage?.titles?.featuredTitle || 'Featured Technology Collection',
      featuredSubtitle: siteSettings?.homepage?.titles?.featuredSubtitle || 'Official BD distributor stock with full manufacturer warranty',
      latestTitle: siteSettings?.homepage?.titles?.latestTitle || 'New Tech Arrivals',
      latestSubtitle: siteSettings?.homepage?.titles?.latestSubtitle || 'Explore the newest components and verified hardware',
      categoryTitle: siteSettings?.homepage?.titles?.categoryTitle || 'Browse Hardware Categories',
      categorySubtitle: siteSettings?.homepage?.titles?.categorySubtitle || 'Find the exact components and devices for your setup',
    },
  });

  const [footerForm, setFooterForm] = useState({
    aboutText: siteSettings?.footer?.aboutText || 'MY COMPUTER is Bangladesh’s premier technology retailer providing authentic components, cameras, enterprise servers, high-speed networking, and computing hardware with official manufacturer warranty.',
    storeAddress: siteSettings?.footer?.storeAddress || 'Multiplan Center, Level 4, Shop 420-422, New Elephant Road, Dhaka-1205, Bangladesh',
    hotline: siteSettings?.footer?.hotline || '+880 1711-000000',
    email: siteSettings?.footer?.email || 'support@mycomputer.com.bd',
    tradeLicense: siteSettings?.footer?.tradeLicense || 'TRAD/DSCC/012948/2022',
    copyrightText: siteSettings?.footer?.copyrightText || '© 2026 MY COMPUTER Ltd. All Rights Reserved.',
    socialFacebook: siteSettings?.footer?.socialLinks?.facebook || 'https://facebook.com',
    socialYoutube: siteSettings?.footer?.socialLinks?.youtube || 'https://youtube.com',
  });

  const [appearanceForm, setAppearanceForm] = useState({
    imageAspectRatio: siteSettings?.cardAppearance?.imageAspectRatio || 'square',
    borderRadius: siteSettings?.cardAppearance?.borderRadius || '16px',
    shadowIntensity: siteSettings?.cardAppearance?.shadowIntensity || 'medium',
    hoverEffect: siteSettings?.cardAppearance?.hoverEffect || 'lift',
    showKeySpecs: siteSettings?.cardAppearance?.showKeySpecs !== false,
  });

  useEffect(() => {
    if (siteSettings) {
      if (siteSettings.navbar) {
        setNavbarForm({
          brandName: siteSettings.navbar.brandName || 'MY COMPUTER',
          tagline: siteSettings.navbar.tagline || 'Leading Tech Retailer & System Integrator in Bangladesh',
          logoUrl: siteSettings.navbar.logoUrl || '/images/logo.png',
          logoHeight: siteSettings.navbar.logoHeight || 36,
        });
      }
      if (siteSettings.homepage) {
        setHomepageForm({
          sections: {
            heroSlider: siteSettings.homepage.sections?.heroSlider !== false,
            featuredCategories: siteSettings.homepage.sections?.featuredCategories !== false,
            featuredProducts: siteSettings.homepage.sections?.featuredProducts !== false,
            latestArrivals: siteSettings.homepage.sections?.latestArrivals !== false,
            gamingZone: siteSettings.homepage.sections?.gamingZone !== false,
            brands: siteSettings.homepage.sections?.brands !== false,
          },
          titles: {
            featuredTitle: siteSettings.homepage.titles?.featuredTitle || 'Featured Technology Collection',
            featuredSubtitle: siteSettings.homepage.titles?.featuredSubtitle || 'Official BD distributor stock with full manufacturer warranty',
            latestTitle: siteSettings.homepage.titles?.latestTitle || 'New Tech Arrivals',
            latestSubtitle: siteSettings.homepage.titles?.latestSubtitle || 'Explore the newest components and verified hardware',
            categoryTitle: siteSettings.homepage.titles?.categoryTitle || 'Browse Hardware Categories',
            categorySubtitle: siteSettings.homepage.titles?.categorySubtitle || 'Find the exact components and devices for your setup',
          },
        });
      }
      if (siteSettings.footer) {
        setFooterForm({
          aboutText: siteSettings.footer.aboutText || 'MY COMPUTER is Bangladesh’s premier technology retailer providing authentic components, cameras, enterprise servers, high-speed networking, and computing hardware with official manufacturer warranty.',
          storeAddress: siteSettings.footer.storeAddress || 'Multiplan Center, Level 4, Shop 420-422, New Elephant Road, Dhaka-1205, Bangladesh',
          hotline: siteSettings.footer.hotline || '+880 1711-000000',
          email: siteSettings.footer.email || 'support@mycomputer.com.bd',
          tradeLicense: siteSettings.footer.tradeLicense || 'TRAD/DSCC/012948/2022',
          copyrightText: siteSettings.footer.copyrightText || '© 2026 MY COMPUTER Ltd. All Rights Reserved.',
          socialFacebook: siteSettings.footer.socialLinks?.facebook || 'https://facebook.com',
          socialYoutube: siteSettings.footer.socialLinks?.youtube || 'https://youtube.com',
        });
      }
      if (siteSettings.cardAppearance) {
        setAppearanceForm({
          imageAspectRatio: siteSettings.cardAppearance.imageAspectRatio || 'square',
          borderRadius: siteSettings.cardAppearance.borderRadius || '16px',
          shadowIntensity: siteSettings.cardAppearance.shadowIntensity || 'medium',
          hoverEffect: siteSettings.cardAppearance.hoverEffect || 'lift',
          showKeySpecs: siteSettings.cardAppearance.showKeySpecs !== false,
        });
      }
    }
  }, [siteSettings]);

  // Handle Logo Upload from Computer
  const handleLogoUpload = async (file: File) => {
    if (!token) {
      addToast('Error', 'Admin authentication required', 'warning');
      return;
    }
    setLogoUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setNavbarForm(prev => ({ ...prev, logoUrl: data.url }));
        addToast('Logo Uploaded', 'Custom logo saved to server. Remember to click "Save Navbar Settings".');
      } else {
        throw new Error(data.error || 'Failed to upload logo');
      }
    } catch (err: any) {
      addToast('Upload Failed', err.message, 'warning');
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Save Settings
  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedPayload = {
        navbar: navbarForm,
        homepage: homepageForm,
        footer: {
          aboutText: footerForm.aboutText,
          storeAddress: footerForm.storeAddress,
          hotline: footerForm.hotline,
          email: footerForm.email,
          tradeLicense: footerForm.tradeLicense,
          copyrightText: footerForm.copyrightText,
          socialLinks: {
            facebook: footerForm.socialFacebook,
            youtube: footerForm.socialYoutube,
          },
        },
        cardAppearance: appearanceForm,
      };

      const success = await updateSiteSettings(updatedPayload);
      if (success) {
        addToast('Settings Published!', 'Website content & appearance updated live on storefront.');
      } else {
        addToast('Save Failed', 'Could not persist settings to server', 'warning');
      }
    } catch (err: any) {
      addToast('Error', err.message, 'warning');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Sub-Tabs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 mb-2 uppercase tracking-wider">
            Site Content & Appearance
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Storefront Experience Manager
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Control logos, navigation branding, homepage layout, footer details, and card styling dynamically
          </p>
        </div>

        {/* Global Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Publishing Changes...' : 'Save & Publish Live'}</span>
        </button>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setSubTab('navbar')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'navbar'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Navbar & Logo</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('homepage')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'homepage'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Homepage Sections</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('footer')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'footer'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Footer Details</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('card-appearance')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'card-appearance'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Card Appearance</span>
        </button>
      </div>

      {/* Hidden File Input for Logo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleLogoUpload(file);
        }}
        className="hidden"
      />

      {/* TAB 1: NAVBAR & LOGO */}
      {subTab === 'navbar' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls Column */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Navbar Branding & Dimensions</span>
            </h3>

            {/* Logo Upload Zone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Custom Website Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-16 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 overflow-hidden shrink-0">
                  {navbarForm.logoUrl ? (
                    <img
                      src={navbarForm.logoUrl}
                      alt="Logo preview"
                      style={{ maxHeight: `${navbarForm.logoHeight}px` }}
                      className="object-contain"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={logoUploading}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
                  >
                    {logoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{logoUploading ? 'Uploading...' : 'Upload Logo From Computer'}</span>
                  </button>
                  <p className="text-[11px] text-slate-500">
                    PNG, SVG, or WebP with transparent background recommended.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Logo URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Direct Logo URL or Path
              </label>
              <input
                type="text"
                value={navbarForm.logoUrl}
                onChange={e => setNavbarForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                placeholder="/images/logo.png or https://..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
              />
            </div>

            {/* Logo Height Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Logo Display Height
                </label>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                  {navbarForm.logoHeight}px
                </span>
              </div>
              <input
                type="range"
                min="24"
                max="72"
                step="2"
                value={navbarForm.logoHeight}
                onChange={e => setNavbarForm(prev => ({ ...prev, logoHeight: Number(e.target.value) }))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Compact (24px)</span>
                <span>Standard (36px)</span>
                <span>Large (72px)</span>
              </div>
            </div>

            {/* Store Name & Tagline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={navbarForm.brandName}
                  onChange={e => setNavbarForm(prev => ({ ...prev, brandName: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={navbarForm.tagline}
                  onChange={e => setNavbarForm(prev => ({ ...prev, tagline: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Interactive Navbar Preview Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-blue-600" />
                  <span>Live Storefront Navbar Preview</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  Instant Live Sync
                </span>
              </div>

              {/* Rendered Navbar Mockup */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-inner border border-slate-800">
                <div className="flex items-center justify-between gap-4">
                  {/* Brand & Logo */}
                  <div className="flex items-center gap-3">
                    <img
                      src={navbarForm.logoUrl}
                      alt={navbarForm.brandName}
                      style={{ height: `${navbarForm.logoHeight}px` }}
                      className="object-contain"
                      onError={e => {
                        (e.currentTarget as any).src = 'https://placehold.co/120x40/0f172a/ffffff?text=MY+COMPUTER';
                      }}
                    />
                    <div>
                      <div className="font-black text-sm tracking-tight text-white leading-none">
                        {navbarForm.brandName}
                      </div>
                      <div className="text-[9px] text-blue-400 font-semibold tracking-wider uppercase mt-1">
                        {navbarForm.tagline}
                      </div>
                    </div>
                  </div>

                  {/* Dummy Search bar */}
                  <div className="hidden sm:block flex-1 max-w-xs bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-[11px] text-slate-400">
                    Search 186+ genuine products...
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Dynamic Logo Integration</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  When you upload or adjust the logo, the public header updates immediately across desktop and mobile screens.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Navbar Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HOMEPAGE SECTIONS */}
      {subTab === 'homepage' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Homepage Section Layout</h3>
              <p className="text-xs text-slate-500">Toggle public sections and customize headline copy</p>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              Notice: PC Builder is permanently kept in Navbar only
            </span>
          </div>

          {/* Section Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: 'heroSlider', label: 'Hero Promotional Slider', desc: 'Main rotating banner at top of homepage' },
              { id: 'featuredCategories', label: 'Hardware Categories Grid', desc: 'Visual shortcut cards for 11 tech categories' },
              { id: 'featuredProducts', label: 'Featured Tech Collection', desc: 'Curated verified products with category tabs' },
              { id: 'latestArrivals', label: 'New Tech Arrivals', desc: 'Recently stocked hardware and components' },
              { id: 'gamingZone', label: 'Audio & Gaming Spotlight', desc: 'High-performance audio and gaming peripherals' },
              { id: 'brands', label: 'Official Brand Partners Marquee', desc: 'Asus, Apple, Sony, Dell, TP-Link, Hikvision, etc.' },
            ].map(sec => {
              const isEnabled = (homepageForm.sections as any)[sec.id];
              return (
                <div
                  key={sec.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isEnabled ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200 bg-slate-50/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900">{sec.label}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setHomepageForm(prev => ({
                          ...prev,
                          sections: {
                            ...prev.sections,
                            [sec.id]: !isEnabled,
                          },
                        }))
                      }
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isEnabled
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}
                    >
                      {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">{sec.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Headings & Subtitles Editor */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Section Headline & Subtitle Copy
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Featured Products Section Title
                </label>
                <input
                  type="text"
                  value={homepageForm.titles.featuredTitle}
                  onChange={e =>
                    setHomepageForm(prev => ({
                      ...prev,
                      titles: { ...prev.titles, featuredTitle: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Featured Products Subtitle
                </label>
                <input
                  type="text"
                  value={homepageForm.titles.featuredSubtitle}
                  onChange={e =>
                    setHomepageForm(prev => ({
                      ...prev,
                      titles: { ...prev.titles, featuredSubtitle: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Categories Showcase Title
                </label>
                <input
                  type="text"
                  value={homepageForm.titles.categoryTitle}
                  onChange={e =>
                    setHomepageForm(prev => ({
                      ...prev,
                      titles: { ...prev.titles, categoryTitle: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Categories Showcase Subtitle
                </label>
                <input
                  type="text"
                  value={homepageForm.titles.categorySubtitle}
                  onChange={e =>
                    setHomepageForm(prev => ({
                      ...prev,
                      titles: { ...prev.titles, categorySubtitle: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Homepage Layout</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: FOOTER DETAILS */}
      {subTab === 'footer' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Footer Content & Official Info</h3>
              <p className="text-xs text-slate-500">Physical address, hotline, trade license, and corporate bio</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
              Payment badges line permanently removed from footer
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                About / Company Description
              </label>
              <textarea
                rows={3}
                value={footerForm.aboutText}
                onChange={e => setFooterForm(prev => ({ ...prev, aboutText: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Store Physical Address
                </label>
                <input
                  type="text"
                  value={footerForm.storeAddress}
                  onChange={e => setFooterForm(prev => ({ ...prev, storeAddress: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Hotline / Phone
                </label>
                <input
                  type="text"
                  value={footerForm.hotline}
                  onChange={e => setFooterForm(prev => ({ ...prev, hotline: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Support Email
                </label>
                <input
                  type="email"
                  value={footerForm.email}
                  onChange={e => setFooterForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Government Trade License Number
                </label>
                <input
                  type="text"
                  value={footerForm.tradeLicense}
                  onChange={e => setFooterForm(prev => ({ ...prev, tradeLicense: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Copyright Text
                </label>
                <input
                  type="text"
                  value={footerForm.copyrightText}
                  onChange={e => setFooterForm(prev => ({ ...prev, copyrightText: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Facebook Page Link
                </label>
                <input
                  type="text"
                  value={footerForm.socialFacebook}
                  onChange={e => setFooterForm(prev => ({ ...prev, socialFacebook: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Footer Details</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: CARD APPEARANCE SETTINGS */}
      {subTab === 'card-appearance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-600" />
              <span>Product Card Styling System</span>
            </h3>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Image Display Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'square', label: 'Square (1:1)' },
                  { id: 'standard', label: 'Classic (4:3)' },
                  { id: 'wide', label: 'Wide (16:9)' },
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setAppearanceForm(prev => ({ ...prev, imageAspectRatio: r.id }))}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      appearanceForm.imageAspectRatio === r.id
                        ? 'bg-blue-50 text-blue-700 border-blue-500'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Border Radius */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Card Corner Radius
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { val: '0px', label: 'Sharp 0px' },
                  { val: '8px', label: 'Subtle 8px' },
                  { val: '16px', label: 'Modern 16px' },
                  { val: '24px', label: 'Pill 24px' },
                ].map(b => (
                  <button
                    key={b.val}
                    type="button"
                    onClick={() => setAppearanceForm(prev => ({ ...prev, borderRadius: b.val }))}
                    className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      appearanceForm.borderRadius === b.val
                        ? 'bg-blue-50 text-blue-700 border-blue-500'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shadow Intensity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Card Shadow Intensity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'None' },
                  { id: 'subtle', label: 'Subtle' },
                  { id: 'medium', label: 'Medium' },
                ].map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setAppearanceForm(prev => ({ ...prev, shadowIntensity: s.id }))}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      appearanceForm.shadowIntensity === s.id
                        ? 'bg-blue-50 text-blue-700 border-blue-500'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hover Animation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Hover Animation Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'lift', label: 'Subtle Lift & Elevation' },
                  { id: 'border-glow', label: 'Border Highlight Accent' },
                ].map(h => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setAppearanceForm(prev => ({ ...prev, hoverEffect: h.id }))}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      appearanceForm.hoverEffect === h.id
                        ? 'bg-blue-50 text-blue-700 border-blue-500'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Show Specs Toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Show Key Specifications</div>
                <div className="text-[11px] text-slate-500">Render bullet points on storefront cards</div>
              </div>
              <button
                type="button"
                onClick={() => setAppearanceForm(prev => ({ ...prev, showKeySpecs: !prev.showKeySpecs }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  appearanceForm.showKeySpecs
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {appearanceForm.showKeySpecs ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>

          {/* Real-time Appearance Preview */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
                <Palette className="w-4 h-4 text-blue-600" />
                <span>Live Card Appearance Preview</span>
              </h3>

              <div className="p-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                <div
                  style={{
                    borderRadius: appearanceForm.borderRadius,
                  }}
                  className={`bg-white border border-slate-200 p-5 max-w-xs w-full transition-all duration-300 ${
                    appearanceForm.shadowIntensity === 'medium'
                      ? 'shadow-lg'
                      : appearanceForm.shadowIntensity === 'subtle'
                      ? 'shadow-xs'
                      : 'shadow-none'
                  }`}
                >
                  <div
                    style={{
                      aspectRatio:
                        appearanceForm.imageAspectRatio === 'square'
                          ? '1/1'
                          : appearanceForm.imageAspectRatio === 'wide'
                          ? '16/9'
                          : '4/3',
                    }}
                    className="w-full bg-slate-50 rounded-xl overflow-hidden mb-3 border border-slate-100 flex items-center justify-center p-3"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop"
                      alt="Sample product"
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>

                  <div className="text-[10px] font-bold text-blue-600 uppercase mb-1">
                    Audio & Headphones
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mb-2">
                    Apple AirPods Pro 2nd Gen USB-C
                  </h4>

                  {appearanceForm.showKeySpecs && (
                    <div className="space-y-1 mb-3 text-[11px] text-slate-500">
                      <div>• Active Noise Cancellation with Transparency</div>
                      <div>• Up to 30 Hours Battery with MagSafe Case</div>
                    </div>
                  )}

                  <div className="text-base font-black text-slate-900 tracking-tight pt-2 border-t border-slate-100">
                    ৳31,500
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Card Appearance</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
