import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Product } from '../../types';
import { FileUpload } from '../ui/FileUpload';
import { useState } from 'react';

const optionalNumber = z.preprocess((v) => (v === '' || Number.isNaN(Number(v)) ? undefined : Number(v)), z.number().optional());

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional().or(z.literal('')),
  price: optionalNumber,
  currency: z.string().optional(),
  leadTimeDays: optionalNumber,
  specsJson: z
    .string()
    .optional()
    .transform((v) => {
      const raw = (v ?? '').trim();
      if (!raw) return undefined;
      try {
        return JSON.parse(raw);
      } catch {
        // leave as string to trigger validation error below
        return raw as any;
      }
    }),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: Partial<Product>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProductForm({ product, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          category: product.category,
          description: product.description ?? '',
          price: product.price,
          currency: product.currency ?? 'INR',
          leadTimeDays: product.leadTimeDays,
          specsJson: product.specs ? JSON.stringify(product.specs, null, 2) : '',
        }
      : {
          name: '',
          category: '',
          description: '',
          price: undefined,
          currency: 'INR',
          leadTimeDays: undefined,
          specsJson: '',
        },
  });

  const submit = (data: ProductFormData) => {
    // validate specsJson parse
    if (typeof (data as any).specsJson === 'string') {
      setError('specsJson', { message: 'Specs must be valid JSON' });
      return;
    }

    onSubmit({
      name: data.name,
      category: data.category,
      description: data.description || undefined,
      price: data.price,
      currency: data.currency ?? 'INR',
      leadTimeDays: data.leadTimeDays,
      specs: (data as any).specsJson,
      images: [
        ...(product?.images ?? []),
        // NOTE: placeholder URLs for now; real implementation should upload to storage.
        ...files.map((f) => URL.createObjectURL(f)),
      ],
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Product Name *</label>
          <input {...register('name')} className="input" />
          {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label">Category *</label>
          <input {...register('category')} className="input" placeholder="e.g. CNC/VMC/3D Printer" />
          {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>}
        </div>

        <div>
          <label className="label">Lead Time (days)</label>
          <input type="number" {...register('leadTimeDays', { valueAsNumber: true })} className="input" />
        </div>

        <div>
          <label className="label">Price</label>
          <input type="number" {...register('price', { valueAsNumber: true })} className="input" />
        </div>

        <div>
          <label className="label">Currency</label>
          <select {...register('currency')} className="input">
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="label">Description</label>
          <textarea {...register('description')} className="input" rows={3} />
        </div>

        <div className="col-span-2">
          <label className="label">Specs (JSON)</label>
          <textarea
            {...register('specsJson')}
            className="input font-mono text-xs"
            rows={6}
            placeholder='{"spindle": "12k rpm", "axis": 3}'
          />
          {errors.specsJson && <p className="text-sm text-red-600 mt-1"> {errors.specsJson.message} </p>}
          <p className="text-xs text-[var(--muted)] mt-1">Optional. Must be valid JSON.</p>
        </div>

        <div className="col-span-2">
          <label className="label">Images</label>
          <FileUpload
            onFilesSelected={(newFiles) => setFiles([...files, ...newFiles])}
            files={files}
            onRemove={(index) => setFiles(files.filter((_, i) => i !== index))}
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
            maxFiles={5}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-[var(--border)]">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="btn btn-primary">
          {isLoading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
