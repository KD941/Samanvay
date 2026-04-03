import { Schema, model, InferSchemaType } from 'mongoose';

const maintenanceScheduleSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    machineSerial: { type: String },
    intervalDays: { type: Number, required: true },
    nextDueAt: { type: Date, required: true, index: true },
    notes: { type: String }
  },
  { timestamps: true }
);

export type MaintenanceScheduleDoc = InferSchemaType<typeof maintenanceScheduleSchema>;
export const MaintenanceSchedule = model('MaintenanceSchedule', maintenanceScheduleSchema);
