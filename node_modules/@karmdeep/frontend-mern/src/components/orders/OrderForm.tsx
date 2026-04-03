import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Order, OrderItem } from '../../types';

const orderSchema = z.object({
  buyerId: z.string().min(1, 'Buyer ID is required'),
  vendorId: z.string().min(1, 'Vendor ID is required'),
  totalAmount: z.number().min(0, 'Total must be positive'),
  currency: z.string().optional(),
  tenderId: z.string().optional().or(z.literal('')),
  bidId: z.string().optional().or(z.literal('')),
  itemsJson: z
    .string()
    .optional()
    .transform((v) => {
      const raw = (v ?? '').trim();
      if (!raw) return [] as OrderItem[];
      try {
        return JSON.parse(raw);
      } catch {
        return raw as any;
      }
    }),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormProps {
  order?: Order;
  onSubmit: (data: Partial<Order>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function OrderForm({ order, onSubmit, onCancel, isLoading }: OrderFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: order
      ? {
          buyerId: order.buyerId,
          vendorId: order.vendorId,
          totalAmount: order.totalAmount,
          currency: order.currency,
          tenderId: order.tenderId ?? '',
          bidId: order.bidId ?? '',
          itemsJson: JSON.stringify(order.items ?? [], null, 2),
        }
      : {
          buyerId: '',
          vendorId: '',
          totalAmount: 0,
          currency: 'INR',
          tenderId: '',
          bidId: '',
          itemsJson: JSON.stringify([], null, 2),
        },
  });

  const submit = (data: OrderFormData) => {
    if (typeof (data as any).itemsJson === 'string') {
      setError('itemsJson', { message: 'Items must be valid JSON array' });
      return;
    }

    onSubmit({
      buyerId: data.buyerId,
      vendorId: data.vendorId,
      tenderId: data.tenderId || undefined,
      bidId: data.bidId || undefined,
      items: (data as any).itemsJson,
      totalAmount: data.totalAmount,
      currency: data.currency ?? 'INR',
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Buyer ID *</label>
          <input {...register('buyerId')} className="input" disabled={!!order} />
          {errors.buyerId && <p className="text-sm text-red-600 mt-1">{errors.buyerId.message}</p>}
        </div>

        <div>
          <label className="label">Vendor ID *</label>
          <input {...register('vendorId')} className="input" disabled={!!order} />
          {errors.vendorId && <p className="text-sm text-red-600 mt-1">{errors.vendorId.message}</p>}
        </div>

        <div>
          <label className="label">Total Amount *</label>
          <input type="number" {...register('totalAmount', { valueAsNumber: true })} className="input" />
          {errors.totalAmount && (
            <p className="text-sm text-red-600 mt-1">{errors.totalAmount.message}</p>
          )}
        </div>

        <div>
          <label className="label">Currency</label>
          <select {...register('currency')} className="input">
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        <div>
          <label className="label">Tender ID</label>
          <input {...register('tenderId')} className="input" />
        </div>

        <div>
          <label className="label">Bid ID</label>
          <input {...register('bidId')} className="input" />
        </div>

        <div className="col-span-2">
          <label className="label">Items (JSON array)</label>
          <textarea
            {...register('itemsJson')}
            className="input font-mono text-xs"
            rows={8}
            placeholder='[{"productId":"...","name":"...","quantity":1,"unitPrice":1000}]'
          />
          {errors.itemsJson && <p className="text-sm text-red-600 mt-1">{errors.itemsJson.message}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-[var(--border)]">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="btn btn-primary">
          {isLoading ? 'Saving...' : order ? 'Update Order' : 'Create Order'}
        </button>
      </div>
    </form>
  );
}
