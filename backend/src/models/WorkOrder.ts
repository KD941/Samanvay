import { Schema, model, InferSchemaType } from 'mongoose';

const workOrderSchema = new Schema(
  {
    scheduleId: { type: Schema.Types.ObjectId, ref: 'MaintenanceSchedule' },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['open', 'in_progress', 'blocked', 'done', 'cancelled'], default: 'open', index: true },
    resolutionNotes: { type: String }
  },
  { timestamps: true }
);

export type WorkOrderDoc = InferSchemaType<typeof workOrderSchema>;
export const WorkOrder = model('WorkOrder', workOrderSchema);
