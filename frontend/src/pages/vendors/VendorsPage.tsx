import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Building2, Trash2 } from 'lucide-react';
import { vendorService } from '../../services/vendorService';
import { Vendor } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { VendorForm } from '../../components/vendors/VendorForm';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';

export default function VendorsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorService.listVendors({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Vendor>) => vendorService.registerVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setIsCreateModalOpen(false);
      toast.success('Vendor created successfully');
    },
    onError: () => {
      toast.error('Failed to create vendor');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ vendorId, data }: { vendorId: string; data: Partial<Vendor> }) =>
      vendorService.updateVendor(vendorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setEditingVendor(null);
      toast.success('Vendor updated successfully');
    },
    onError: () => {
      toast.error('Failed to update vendor');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (vendorId: string) => vendorService.deleteVendor(vendorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete vendor');
    },
  });

  const columns: ColumnDef<Vendor>[] = [
    {
      accessorKey: 'name',
      header: 'Vendor',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-[var(--muted)]" />
          <span className="font-medium text-[var(--text)]">{row.original.name}</span>
        </div>
      ),
    },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phone', header: 'Phone' },
    {
      id: 'location',
      header: 'Location',
      cell: ({ row }) => (
        <span className="text-[var(--muted)]">
          {row.original.address?.city || '—'}{row.original.address?.country ? `, ${row.original.address.country}` : ''}
        </span>
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => (
        <span className="text-[var(--muted)]">
          {typeof row.original.rating === 'number' ? row.original.rating.toFixed(1) : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setEditingVendor(row.original)}
            className="text-[var(--a3)] hover:brightness-110"
            aria-label="Edit vendor"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this vendor? This will also delete all their products.')) {
                deleteMutation.mutate(row.original._id);
              }
            }}
            className="text-red-500 hover:text-red-400 disabled:opacity-50"
            disabled={deleteMutation.isPending}
            aria-label="Delete vendor"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="card !flex-row items-center justify-between !mb-8 relative overflow-hidden">
        <div className="relative">
          <h1 className="text-4xl font-extrabold text-neon mb-2">Vendors</h1>
          <p className="text-lg text-[var(--muted)]">Manage vendor profiles and partnerships</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary flex items-center space-x-2 relative z-10 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Vendor</span>
        </button>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading vendors...</p>
          </div>
        ) : (
          <DataTable
            data={data?.items || []}
            columns={columns}
            searchable={true}
            searchPlaceholder="Search vendors..."
          />
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Register Vendor"
        size="lg"
      >
        <VendorForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      <Modal
        isOpen={!!editingVendor}
        onClose={() => setEditingVendor(null)}
        title="Edit Vendor"
        size="lg"
      >
        {editingVendor && (
          <VendorForm
            vendor={editingVendor}
            onSubmit={(data) =>
              updateMutation.mutate({
                vendorId: editingVendor._id,
                data,
              })
            }
            onCancel={() => setEditingVendor(null)}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
