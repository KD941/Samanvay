import { Schema, model, InferSchemaType } from 'mongoose';

const productSchema = new Schema(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    description: { type: String },
    specs: { type: Schema.Types.Mixed },
    price: { type: Number },
    currency: { type: String, default: 'INR' },
    leadTimeDays: { type: Number },
    images: { type: [String], default: [] },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

productSchema.index({ vendorId: 1, category: 1 });
productSchema.index({ name: 'text', description: 'text' });

export type ProductDoc = InferSchemaType<typeof productSchema>;
export const Product = model('Product', productSchema);
