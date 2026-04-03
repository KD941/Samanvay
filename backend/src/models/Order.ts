import { Schema, model, InferSchemaType } from 'mongoose';

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number }
  },
  { _id: false }
);

const milestoneSchema = new Schema(
  {
    name: { type: String, required: true },
    status: { type: String, enum: ['pending', 'done'], default: 'pending' },
    dueAt: { type: Date }
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    tenderId: { type: Schema.Types.ObjectId, ref: 'Tender' },
    bidId: { type: Schema.Types.ObjectId, ref: 'Bid' },
    items: { type: [orderItemSchema], default: [] },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['created', 'confirmed', 'shipped', 'delivered', 'installed', 'cancelled'],
      default: 'created'
    },
    milestones: { type: [milestoneSchema], default: [] }
  },
  { timestamps: true }
);

export type OrderDoc = InferSchemaType<typeof orderSchema>;
export const Order = model('Order', orderSchema);
