import { Schema, model, InferSchemaType } from 'mongoose';

const vendorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      country: String,
      pincode: String
    },
    gstin: { type: String },
    industryTags: { type: [String], default: [] },
    rating: { type: Number, min: 0, max: 5 }
  },
  { timestamps: true }
);

export type VendorDoc = InferSchemaType<typeof vendorSchema>;
export const Vendor = model('Vendor', vendorSchema);
