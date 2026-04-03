import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Wrench, AlertCircle, Trash2 } from 'lucide-react';
import { maintenanceService, WorkOrder } from '../../services/maintenanceService';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { WorkOrderForm } from '../../components/maintenance/WorkOrderForm';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

export default function MaintenancePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['work-orders', statusFilter],
    queryFn: () => maintenanceService.listWorkOrders({ status: statusFilter || undefined, limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<WorkOrder>) => maintenanceService.createWorkOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      setIsCreateModalOpen(false);
      toast.success('Work order created successfully');
    },
    onError: () => {
      toast.error('Failed to create work order');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ workOrderId, data }: { workOrderId: string; data: Partial<WorkOrder> }) =>
      maintenanceService.updateWorkOrder(workOrderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      setEditingWorkOrder(null);
      toast.success('Work order updated successfully');
    },
    onError: () => {
      toast.error('Failed to update work order');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (workOrderId: string) => maintenanceService.deleteWorkOrder(workOrderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast.success('Work order deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete work order');
    },
  });

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns: ColumnDef<WorkOrder>[] = [
    {
      accessorKey: 'workOrderId',
      header: 'Work Order',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Wrench className="w-4 h-4 text-gray-400" />
          <span className="font-mono text-sm">{row.original.workOrderId.slice(0, 8)}</span>
        </div>
      ),
    },
    {
      accessorKey: 'machineId',
      header: 'Machine',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.machineId.slice(0, 8)}</span>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          {row.original.priority === 'CRITICAL' && <AlertCircle className="w-4 h-4 text-red-600" />}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(row.original.priority)}`}>
            {row.original.priority}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(row.original.status)}`}>
          {row.original.status.replace('_', ' ')}
        </span>
      ),
    },
    {
      accessorKey: 'scheduledDate',
      header: 'Scheduled',
      cell: ({ row }) => format(new Date(row.original.scheduledDate), 'MMM dd, yyyy'),
    },
    {
      accessorKey: 'assignedEngineerId',
      header: 'Engineer',
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.assignedEngineerId ? row.original.assignedEngineerId.slice(0, 8) : '-'}
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
            onClick={() => setEditingWorkOrder(row.original)}
            className="text-[var(--a3)] hover:brightness-110"
            aria-label="Edit work order"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this work order?')) {
                deleteMutation.mutate(row.original.workOrderId);
              }
            }}
            className="text-red-500 hover:text-red-400 disabled:opacity-50"
            disabled={deleteMutation.isPending}
            aria-label="Delete work order"
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
          <h1 className="text-4xl font-extrabold text-neon mb-2">Maintenance</h1>
          <p className="text-lg text-[var(--muted)]">Manage maintenance schedules and work orders</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary flex items-center space-x-2 relative z-10 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Create Work Order</span>
        </button>
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
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading work orders...</p>
          </div>
        ) : (
          <DataTable
            data={data?.items || []}
            columns={columns}
            searchable={true}
            searchPlaceholder="Search work orders..."
          />
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Work Order"
        size="lg"
      >
        <WorkOrderForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      <Modal
        isOpen={!!editingWorkOrder}
        onClose={() => setEditingWorkOrder(null)}
        title="Edit Work Order"
        size="lg"
      >
        {editingWorkOrder && (
          <WorkOrderForm
            workOrder={editingWorkOrder}
            onSubmit={(data) =>
              updateMutation.mutate({
                workOrderId: editingWorkOrder.workOrderId,
                data,
              })
            }
            onCancel={() => setEditingWorkOrder(null)}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
