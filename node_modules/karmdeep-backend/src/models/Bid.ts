import { Schema, model, InferSchemaType } from 'mongoose';

const bidSchema = new Schema(
  {
    tenderId: { type: Schema.Types.ObjectId, ref: 'Tender', required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    leadTimeDays: { type: Number },
    notes: { type: String },
    status: { type: String, enum: ['submitted', 'shortlisted', 'rejected', 'accepted'], default: 'submitted' }
  },
  { timestamps: true }
);

bidSchema.index({ tenderId: 1, vendorId: 1 }, { unique: true });

export type BidDoc = InferSchemaType<typeof bidSchema>;
export const Bid = model('Bid', bidSchema);
