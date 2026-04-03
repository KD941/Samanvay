import { Schema, model, InferSchemaType } from 'mongoose';

const tenderSchema = new Schema(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    category: { type: String, required: true, index: true },
    quantity: { type: Number, default: 1 },
    budget: { type: Number },
    currency: { type: String, default: 'INR' },
    deadlineAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed', 'awarded', 'cancelled'],
      default: 'published',
      index: true
    },
    requirements: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

tenderSchema.index({ category: 1, status: 1, deadlineAt: 1 });

export type TenderDoc = InferSchemaType<typeof tenderSchema>;
export const Tender = model('Tender', tenderSchema);
