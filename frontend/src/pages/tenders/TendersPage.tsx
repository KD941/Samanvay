import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, FileText, Calendar, Trash2 } from 'lucide-react';
import { tenderService } from '../../services/tenderService';
import { Tender, TenderStatus } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { TenderForm } from '../../components/tenders/TenderForm';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

export default function TendersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTender, setEditingTender] = useState<Tender | null>(null);
  const [statusFilter, setStatusFilter] = useState<TenderStatus | ''>('');

  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['tenders', statusFilter],
    queryFn: () => tenderService.listTenders({ status: statusFilter || undefined, limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Tender>) => tenderService.createTender(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
      setIsCreateModalOpen(false);
      toast.success('Tender created successfully');
    },
    onError: () => {
      toast.error('Failed to create tender');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ tenderId, data }: { tenderId: string; data: Partial<Tender> }) =>
      tenderService.updateTender(tenderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
      setEditingTender(null);
      toast.success('Tender updated successfully');
    },
    onError: () => {
      toast.error('Failed to update tender');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (tenderId: string) => tenderService.deleteTender(tenderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
      toast.success('Tender deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete tender');
    },
  });

  const columns: ColumnDef<Tender>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">{row.original.title}</span>
        </div>
      ),
    },
    {
      accessorKey: 'budget',
      header: 'Budget',
      cell: ({ row }) => (
        <span className="text-[var(--muted)]">
          {row.original.currency} {typeof row.original.budget === 'number' ? row.original.budget.toLocaleString() : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'deadlineAt',
      header: 'Deadline',
      cell: ({ row }) => (
        <div className="flex items-center space-x-1 text-[var(--muted)]">
          <Calendar className="w-4 h-4 text-[var(--muted)]" />
          <span>{format(new Date(row.original.deadlineAt), 'MMM dd, yyyy')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            row.original.status === 'published'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : row.original.status === 'draft'
              ? 'bg-white/5 text-[var(--muted)] border border-[var(--border)]'
              : row.original.status === 'awarded'
              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
              : 'bg-red-500/10 text-red-300 border border-red-500/30'
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'MMM dd, yyyy'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          {(user?.role === 'buyer' || user?.role === 'admin') && (
            <>
              <button
                type="button"
                onClick={() => setEditingTender(row.original)}
                className="text-[var(--a3)] hover:brightness-110"
                aria-label="Edit tender"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this tender?')) {
                    deleteMutation.mutate(row.original._id);
                  }
                }}
                className="text-red-500 hover:text-red-400 disabled:opacity-50"
                disabled={deleteMutation.isPending}
                aria-label="Delete tender"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="card !flex-row items-center justify-between !mb-8 relative overflow-hidden">
        <div className="relative">
          <h1 className="text-4xl font-extrabold text-neon mb-2">Tenders</h1>
          <p className="text-lg text-[var(--muted)]">Manage tenders and bidding process</p>
        </div>
        {(user?.role === 'buyer' || user?.role === 'admin') && (
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary flex items-center space-x-2 relative z-10 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Create Tender</span>
          </button>
        )}
      </div>

      <div className="card">
        <div className="mb-6">
          <label htmlFor="status-filter" className="label">Filter by Status</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-48"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
            <option value="awarded">Awarded</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading tenders...</p>
          </div>
        ) : (
          <DataTable
            data={data?.items || []}
            columns={columns}
            searchable={true}
            searchPlaceholder="Search tenders..."
          />
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Tender"
        size="lg"
      >
        <TenderForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      <Modal
        isOpen={!!editingTender}
        onClose={() => setEditingTender(null)}
        title="Edit Tender"
        size="lg"
      >
        {editingTender && (
          <TenderForm
            tender={editingTender}
            onSubmit={(data) => {
              updateMutation.mutate({
                tenderId: editingTender._id,
                data,
              });
            }}
            onCancel={() => setEditingTender(null)}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
