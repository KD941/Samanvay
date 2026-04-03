import { Schema, model, InferSchemaType } from 'mongoose';

const analyticsEventSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    anonymousId: { type: String },
    eventType: { type: String, required: true, index: true },
    properties: { type: Schema.Types.Mixed },
    occurredAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

analyticsEventSchema.index({ eventType: 1, occurredAt: -1 });

export type AnalyticsEventDoc = InferSchemaType<typeof analyticsEventSchema>;
export const AnalyticsEvent = model('AnalyticsEvent', analyticsEventSchema);
