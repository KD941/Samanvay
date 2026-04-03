import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Vendor } from '../../types';

const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  gstin: z.string().optional().or(z.literal('')),
  industryTags: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : [])),
  address: z
    .object({
      line1: z.string().optional().or(z.literal('')),
      line2: z.string().optional().or(z.literal('')),
      city: z.string().optional().or(z.literal('')),
      state: z.string().optional().or(z.literal('')),
      country: z.string().optional().or(z.literal('')),
      pincode: z.string().optional().or(z.literal('')),
    })
    .optional(),
});

type VendorFormData = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  vendor?: Vendor;
  onSubmit: (data: Partial<Vendor>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function VendorForm({ vendor, onSubmit, onCancel, isLoading }: VendorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: vendor
      ? {
          name: vendor.name,
          email: vendor.email ?? '',
          phone: vendor.phone ?? '',
          gstin: vendor.gstin ?? '',
          industryTags: (vendor.industryTags ?? []).join(', '),
          address: {
            line1: vendor.address?.line1 ?? '',
            line2: vendor.address?.line2 ?? '',
            city: vendor.address?.city ?? '',
            state: vendor.address?.state ?? '',
            country: vendor.address?.country ?? '',
            pincode: vendor.address?.pincode ?? '',
          },
        }
      : {
          name: '',
          email: '',
          phone: '',
          gstin: '',
          industryTags: '',
          address: { line1: '', line2: '', city: '', state: '', country: '', pincode: '' },
        },
  });

  const submit = (data: VendorFormData) => {
    onSubmit({
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      gstin: data.gstin || undefined,
      industryTags: (data as any).industryTags,
      address: data.address,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Vendor Name *</label>
          <input {...register('name')} className="input" />
          {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label">Email</label>
          <input type="email" {...register('email')} className="input" />
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label">Phone</label>
          <input {...register('phone')} className="input" />
        </div>

        <div>
          <label className="label">GSTIN</label>
          <input {...register('gstin')} className="input" />
        </div>

        <div>
          <label className="label">Industry Tags</label>
          <input
            {...register('industryTags')}
            className="input"
            placeholder="e.g. cnc, automation, tooling"
          />
          <p className="text-xs text-[var(--muted)] mt-1">Comma-separated</p>
        </div>

        <div className="col-span-2">
          <h3 className="text-lg font-medium text-[var(--text)] mb-2">Address</h3>
        </div>

        <div className="col-span-2">
          <label className="label">Line 1</label>
          <input {...register('address.line1')} className="input" />
        </div>

        <div className="col-span-2">
          <label className="label">Line 2</label>
          <input {...register('address.line2')} className="input" />
        </div>

        <div>
          <label className="label">City</label>
          <input {...register('address.city')} className="input" />
        </div>

        <div>
          <label className="label">State</label>
          <input {...register('address.state')} className="input" />
        </div>

        <div>
          <label className="label">Country</label>
          <input {...register('address.country')} className="input" />
        </div>

        <div>
          <label className="label">Pincode</label>
          <input {...register('address.pincode')} className="input" />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-[var(--border)]">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="btn btn-primary">
          {isLoading ? 'Saving...' : vendor ? 'Update Vendor' : 'Create Vendor'}
        </button>
      </div>
    </form>
  );
}
