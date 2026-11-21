import mongoose, { Schema, Document } from 'mongoose';

export interface ISubCategory {
  id: string;
  name: string;
  nameBn?: string;
  popular?: boolean;
  hasChildren?: boolean;
  isShowAll?: boolean;
  children?: Array<{ id: string; name: string; nameBn?: string; brand?: string }>;
}

export interface ICategory extends Document {
  id: string; // slug-like id: e.g. 'camera', 'networking'
  name: string;
  nameBn: string;
  icon: string;
  image: string;
  itemCount: number;
  order: number;
  popular: boolean;
  isVisible: boolean;
  subCategories: ISubCategory[];
  createdAt: Date;
  updatedAt: Date;
}

const subCategoryChildSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    nameBn: { type: String, default: '' },
    brand: { type: String },
  },
  { _id: false }
);

const subCategorySchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    nameBn: { type: String, default: '' },
    popular: { type: Boolean, default: false },
    hasChildren: { type: Boolean, default: false },
    isShowAll: { type: Boolean, default: false },
    children: [subCategoryChildSchema],
  },
  { _id: false }
);

const categorySchema = new Schema<ICategory>(
  {
    id: { type: String, required: true, unique: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    nameBn: { type: String, default: '', trim: true },
    icon: { type: String, default: 'Package', trim: true },
    image: { type: String, default: '', trim: true },
    itemCount: { type: Number, default: 0 },
    order: { type: Number, default: 0, index: true },
    popular: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: true, index: true },
    subCategories: [subCategorySchema],
  },
  {
    timestamps: true,
  }
);

export const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);
