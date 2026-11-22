import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteSettings extends Document {
  navbar: {
    logoUrl?: string;
    logoHeight?: number;
    brandName?: string;
    tagline?: string;
    hotline?: string;
  };
  cardAppearance: {
    imageRatio?: string;
    borderRadius?: string;
    shadow?: string;
    hoverEffect?: string;
    showSpecs?: boolean;
    showWarrantyBadge?: boolean;
  };
  homepageSections: Array<{
    id: string;
    name: string;
    title?: string;
    subtitle?: string;
    isVisible: boolean;
    order: number;
  }>;
  footer: {
    aboutText?: string;
    hotline?: string;
    email?: string;
    showAcceptedPayments?: boolean;
    tradeLicense?: string;
    copyright?: string;
  };
  updatedAt: Date;
}

const siteSettingsSchema = new Schema<ISiteSettings>(
  {
    navbar: {
      logoUrl: { type: String, default: '' },
      logoHeight: { type: Number, default: 42 },
      brandName: { type: String, default: 'MY COMPUTER' },
      tagline: { type: String, default: 'Leading Tech Retailer' },
      hotline: { type: String, default: '16789' },
    },
    cardAppearance: {
      imageRatio: { type: String, default: '4/3' },
      borderRadius: { type: String, default: 'rounded-2xl' },
      shadow: { type: String, default: 'shadow-xs' },
      hoverEffect: { type: String, default: 'tilt' },
      showSpecs: { type: Boolean, default: true },
      showWarrantyBadge: { type: Boolean, default: true },
    },
    homepageSections: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        title: { type: String, default: '' },
        subtitle: { type: String, default: '' },
        isVisible: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
      },
    ],
    footer: {
      aboutText: {
        type: String,
        default:
          'My Computer is Bangladesh’s premier technology destination. We deliver top-tier Smart Cameras, Enterprise Networking, Licensed Software, Servers, High-Speed Storage, Accessories, Gadgets & Gaming Gear with unmatched official warranty support.',
      },
      hotline: { type: String, default: '16789 / +880 9678-000111' },
      email: { type: String, default: 'support@mycomputer.com.bd' },
      showAcceptedPayments: { type: Boolean, default: false },
      tradeLicense: { type: String, default: 'TRAD/DNCC/024881/2023' },
      copyright: { type: String, default: 'My Computer BD Ltd. All Rights Reserved.' },
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SiteSettings = mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', siteSettingsSchema);
