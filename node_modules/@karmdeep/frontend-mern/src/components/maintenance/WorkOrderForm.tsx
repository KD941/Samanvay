import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WorkOrder } from '../../services/maintenanceService';

const workOrderSchema = z.object({
  machineId: z.string().min(1, 'Machine ID is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  description: z.string().min(1, 'Description is required'),
  assignedEngineerId: z.string().optional(),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  notes: z.string().optional(),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

interface WorkOrderFormProps {
  workOrder?: WorkOrder;
  onSubmit: (data: Partial<WorkOrder>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function WorkOrderForm({ workOrder, onSubmit, onCancel, isLoading }: WorkOrderFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: workOrder || {
      priority: 'MEDIUM',
      status: 'PENDING',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Machine ID *</label>
          <input {...register('machineId')} className="input" disabled={!!workOrder} />
          {errors.machineId && (
            <p className="text-sm text-red-600 mt-1">{errors.machineId.message}</p>
          )}
        </div>

        <div>
          <label className="label">Priority *</label>
          <select {...register('priority')} className="input">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div>
          <label className="label">Status *</label>
          <select {...register('status')} className="input">
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="label">Scheduled Date *</label>
          <input type="date" {...register('scheduledDate')} className="input" />
          {errors.scheduledDate && (
            <p className="text-sm text-red-600 mt-1">{errors.scheduledDate.message}</p>
          )}
        </div>

        <div className="col-span-2">
          <label className="label">Assigned Engineer ID</label>
          <input {...register('assignedEngineerId')} className="input" placeholder="Optional" />
        </div>

        <div className="col-span-2">
          <label className="label">Description *</label>
          <textarea {...register('description')} className="input" rows={4} />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="col-span-2">
          <label className="label">Notes</label>
          <textarea {...register('notes')} className="input" rows={3} placeholder="Optional" />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="btn btn-primary">
          {isLoading ? 'Saving...' : workOrder ? 'Update Work Order' : 'Create Work Order'}
        </button>
      </div>
    </form>
  );
}
