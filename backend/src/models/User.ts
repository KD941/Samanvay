import { Schema, model, InferSchemaType } from 'mongoose';
import { Role } from '../types/auth';

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String },
    phone: { type: String },
    role: { type: String, required: true, enum: ['admin', 'buyer', 'vendor', 'maintenance', 'analyst'] satisfies Role[] },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema>;
export const User = model('User', userSchema);
