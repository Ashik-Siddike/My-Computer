import mongoose, { Schema, Document } from 'mongoose';

export type CardSection = 
  | 'homepage-hero' 
  | 'category-card' 
  | 'product-card' 
  | 'promo-banner' 
  | 'value-proposition' 
  | 'store-location' 
  | 'custom';

export type CardStatus = 'published' | 'draft';
export type CardDevice = 'all' | 'desktop' | 'mobile';

export interface ISiteCard extends Document {
  id: string; // unique slug/identifier (e.g. 'hero-slide-1')
  name: string; // Internal admin identifier (e.g. 'Hero Slide 1 - Wi-Fi 6 Routers')
  section: CardSection;
  
  // Content & Text
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  tagline?: string;
  price?: number;
  discountPrice?: number;
  currency?: string;
  
  // Media
  image?: string;
  images?: string[];
  icon?: string;
  
  // Buttons & Links
  buttonText?: string;
  buttonLink?: string;
  buttonTarget?: '_self' | '_blank';
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  secondaryButtonTarget?: '_self' | '_blank';
  
  // Styling
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  shadow?: string;
  padding?: string;
  cardHeight?: string;
  
  // Typography
  titleSize?: string;
  titleWeight?: string;
  
  // Layout & Order
  displayOrder: number;
  columnsSpan?: number;
  
  // Visibility & State
  isVisible: boolean;
  status: CardStatus;
  targetDevice?: CardDevice;
  
  // Advanced & Linkage
  targetEntityId?: string; // Optional product or category ID
  customClasses?: string;
  metadata?: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

const siteCardSchema = new Schema<ISiteCard>(
  {
    id: { type: String, required: true, unique: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    section: { 
      type: String, 
      required: true, 
      enum: ['homepage-hero', 'category-card', 'product-card', 'promo-banner', 'value-proposition', 'store-location', 'custom'],
      index: true 
    },
    
    // Content
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    badge: { type: String, default: '', trim: true },
    tagline: { type: String, default: '', trim: true },
    price: { type: Number },
    discountPrice: { type: Number },
    currency: { type: String, default: '৳' },
    
    // Media
    image: { type: String, default: '', trim: true },
    images: [{ type: String }],
    icon: { type: String, default: '', trim: true },
    
    // Buttons
    buttonText: { type: String, default: '', trim: true },
    buttonLink: { type: String, default: '', trim: true },
    buttonTarget: { type: String, enum: ['_self', '_blank'], default: '_self' },
    secondaryButtonText: { type: String, default: '', trim: true },
    secondaryButtonLink: { type: String, default: '', trim: true },
    secondaryButtonTarget: { type: String, enum: ['_self', '_blank'], default: '_self' },
    
    // Styling
    backgroundColor: { type: String, default: '#ffffff' },
    textColor: { type: String, default: '#0f172a' },
    accentColor: { type: String, default: '#2563eb' },
    borderColor: { type: String, default: '#e2e8f0' },
    borderWidth: { type: String, default: '1px' },
    borderRadius: { type: String, default: '16px' },
    shadow: { type: String, default: 'md' },
    padding: { type: String, default: '24px' },
    cardHeight: { type: String, default: 'auto' },
    
    // Typography
    titleSize: { type: String, default: '20px' },
    titleWeight: { type: String, default: '700' },
    
    // Layout
    displayOrder: { type: Number, default: 0, index: true },
    columnsSpan: { type: Number, default: 1 },
    
    // Visibility
    isVisible: { type: Boolean, default: true, index: true },
    status: { type: String, enum: ['published', 'draft'], default: 'published', index: true },
    targetDevice: { type: String, enum: ['all', 'desktop', 'mobile'], default: 'all' },
    
    // Advanced
    targetEntityId: { type: String, default: '' },
    customClasses: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

siteCardSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export const SiteCard = mongoose.models.SiteCard || mongoose.model<ISiteCard>('SiteCard', siteCardSchema);
