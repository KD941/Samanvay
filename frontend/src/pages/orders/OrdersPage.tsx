import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Package, ChevronRight, Trash2 } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { OrderForm } from '../../components/orders/OrderForm';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

export default function OrdersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: () => orderService.listOrders({ status: statusFilter || undefined, limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Order>) => orderService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setIsCreateModalOpen(false);
      toast.success('Order created successfully');
    },
    onError: () => {
      toast.error('Failed to create order');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      orderService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedOrder(null);
      toast.success('Order status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update order status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (orderId: string) => orderService.deleteOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete order');
    },
  });

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      IN_PRODUCTION: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      INSTALLED: 'bg-teal-100 text-teal-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'orderId',
      header: 'Order ID',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="font-mono text-sm">{row.original.orderId.slice(0, 8)}</span>
        </div>
      ),
    },
    {
      accessorKey: 'productId',
      header: 'Product',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.productId.slice(0, 8)}</span>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.currency} {row.original.totalAmount.toLocaleString()}
        </span>
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
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'MMM dd, yyyy'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setSelectedOrder(row.original)}
            className="text-[var(--a3)] hover:brightness-110 flex items-center space-x-1"
            aria-label="Update order status"
          >
            <span className="text-sm">Update Status</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this order?')) {
                deleteMutation.mutate((row.original as any)._id || (row.original as any).orderId);
              }
            }}
            className="text-red-500 hover:text-red-400 disabled:opacity-50 flex items-center"
            disabled={deleteMutation.isPending}
            aria-label="Delete order"
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
          <h1 className="text-4xl font-extrabold text-neon mb-2">Orders</h1>
          <p className="text-lg text-[var(--muted)]">Track and manage orders</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary flex items-center space-x-2 relative z-10 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Create Order</span>
        </button>
      </div>

      <div className="card">
        <div className="mb-6">
          <label htmlFor="status-filter" className="label">Filter by Status</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
            className="input w-48"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PRODUCTION">In Production</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="INSTALLED">Installed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading orders...</p>
          </div>
        ) : (
          <DataTable
            data={data?.items || []}
            columns={columns}
            searchable={true}
            searchPlaceholder="Search orders..."
          />
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Order"
        size="lg"
      >
        <OrderForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Update Order Status"
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-mono text-sm font-medium">{selectedOrder.orderId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Status</p>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                {selectedOrder.status.replace('_', ' ')}
              </span>
            </div>
            <div>
              <label htmlFor="new-status" className="label">New Status *</label>
              <select
                id="new-status"
                className="input"
                defaultValue={selectedOrder.status}
                onChange={(e) => {
                  updateStatusMutation.mutate({
                    orderId: selectedOrder.orderId,
                    status: e.target.value as OrderStatus,
                  });
                }}
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="IN_PRODUCTION">In Production</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="INSTALLED">Installed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button type="button" onClick={() => setSelectedOrder(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
