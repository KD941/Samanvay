import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Tender, TenderStatus } from '../../types';

const optionalNumber = z.preprocess((v) => (v === '' || Number.isNaN(Number(v)) ? undefined : Number(v)), z.number().optional());

const tenderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required'),
  quantity: z.preprocess((v) => (v === '' || Number.isNaN(Number(v)) ? undefined : Number(v)), z.number().int().positive().default(1)),
  budget: optionalNumber,
  currency: z.string().optional(),
  deadlineAt: z.string().min(1, 'Deadline is required'),
  status: z.enum(['draft', 'published', 'closed', 'awarded', 'cancelled'] as const),
  requirementsJson: z
    .string()
    .optional()
    .transform((v) => {
      const raw = (v ?? '').trim();
      if (!raw) return undefined;
      try {
        return JSON.parse(raw);
      } catch {
        return raw as any;
      }
    }),
});

type TenderFormData = z.infer<typeof tenderSchema>;

interface TenderFormProps {
  tender?: Tender;
  onSubmit: (data: Partial<Tender>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TenderForm({ tender, onSubmit, onCancel, isLoading }: TenderFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<TenderFormData>({
    resolver: zodResolver(tenderSchema),
    defaultValues: tender
      ? {
          title: tender.title,
          description: tender.description ?? '',
          category: tender.category,
          quantity: tender.quantity,
          budget: tender.budget,
          currency: tender.currency ?? 'INR',
          deadlineAt: tender.deadlineAt ? tender.deadlineAt.slice(0, 10) : '',
          status: tender.status as TenderStatus,
          requirementsJson: tender.requirements ? JSON.stringify(tender.requirements, null, 2) : '',
        }
      : {
          title: '',
          description: '',
          category: '',
          quantity: 1,
          budget: undefined,
          currency: 'INR',
          deadlineAt: '',
          status: 'draft',
          requirementsJson: '',
        },
  });

  const submit = (data: TenderFormData) => {
    if (typeof (data as any).requirementsJson === 'string') {
      setError('requirementsJson', { message: 'Requirements must be valid JSON' });
      return;
    }

    onSubmit({
      title: data.title,
      description: data.description || undefined,
      category: data.category,
      quantity: data.quantity,
      budget: data.budget,
      currency: data.currency ?? 'INR',
      deadlineAt: new Date(data.deadlineAt).toISOString(),
      status: data.status,
      requirements: (data as any).requirementsJson,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Title *</label>
          <input {...register('title')} className="input" />
          {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
        </div>

        <div className="col-span-2">
          <label className="label">Description</label>
          <textarea {...register('description')} className="input" rows={3} />
        </div>

        <div>
          <label className="label">Category *</label>
          <input {...register('category')} className="input" placeholder="e.g. CNC/VMC" />
          {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>}
        </div>

        <div>
          <label className="label">Quantity</label>
          <input type="number" {...register('quantity', { valueAsNumber: true })} className="input" />
        </div>

        <div>
          <label className="label">Budget</label>
          <input type="number" {...register('budget', { valueAsNumber: true })} className="input" />
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
          <label className="label">Deadline *</label>
          <input type="date" {...register('deadlineAt')} className="input" />
          {errors.deadlineAt && <p className="text-sm text-red-600 mt-1">{errors.deadlineAt.message}</p>}
        </div>

        <div>
          <label className="label">Status</label>
          <select {...register('status')} className="input">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
            <option value="awarded">Awarded</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="label">Requirements (JSON)</label>
          <textarea
            {...register('requirementsJson')}
            className="input font-mono text-xs"
            rows={6}
            placeholder='{"precision": "+/- 10 microns"}'
          />
          {errors.requirementsJson && (
            <p className="text-sm text-red-600 mt-1">{errors.requirementsJson.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-[var(--border)]">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="btn btn-primary">
          {isLoading ? 'Saving...' : tender ? 'Update Tender' : 'Create Tender'}
        </button>
      </div>
    </form>
  );
}
