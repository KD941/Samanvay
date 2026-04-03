import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { vendorService } from '../../services/vendorService';
import { Product } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { ProductForm } from '../../components/products/ProductForm';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';

export default function ProductsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['products', searchQuery, category],
    queryFn: () =>
      searchQuery
        ? vendorService.searchProducts({ q: searchQuery, category, limit: 100 })
        : vendorService.listProducts({ category, limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const vendorId = user?.role === 'vendor' ? user.vendorId : data.vendorId;
      if (!vendorId) throw new Error('Missing vendorId');
      return vendorService.createProduct(vendorId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsCreateModalOpen(false);
      toast.success('Product created successfully');
    },
    onError: () => {
      toast.error('Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, vendorId, data }: any) =>
      vendorService.updateProduct(vendorId, productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingProduct(null);
      toast.success('Product updated successfully');
    },
    onError: () => {
      toast.error('Failed to update product');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ productId, vendorId }: { productId: string; vendorId: string }) =>
      vendorService.deleteProduct(vendorId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete product');
    },
  });

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => (
        <div className="font-medium text-[var(--text)]">{row.original.name}</div>
      ),
    },
    { accessorKey: 'category', header: 'Category' },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => (
        <span className="text-[var(--muted)]">
          {(row.original.currency ?? 'INR')} {typeof row.original.price === 'number' ? row.original.price.toLocaleString() : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={
            'px-2 py-1 text-xs font-medium rounded-full ' +
            (row.original.isActive
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'bg-red-500/10 text-red-300 border border-red-500/30')
          }
        >
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <button
            onClick={() => setEditingProduct(row.original)}
            className="text-[var(--a3)] hover:brightness-110"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this product?')) {
                deleteMutation.mutate({
                  productId: row.original._id,
                  vendorId: row.original.vendorId
                });
              }
            }}
            disabled={deleteMutation.isPending}
            className="text-red-500 hover:text-red-400 disabled:opacity-50"
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
          <h1 className="text-4xl font-extrabold text-neon mb-2">Products</h1>
          <p className="text-lg text-[var(--muted)]">Manage your product catalog</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary flex items-center space-x-2 relative z-10 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="card">
        <div className="flex space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input w-48"
          >
            <option value="">All Categories</option>
            <option value="CNC Machines">CNC Machines</option>
            <option value="VMC">VMC</option>
            <option value="3D Printers">3D Printers</option>
            <option value="Automation">Automation</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <DataTable
            data={data?.items || []}
            columns={columns}
            searchable={false}
          />
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Product"
        size="lg"
      >
        <ProductForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      <Modal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title="Edit Product"
        size="lg"
      >
        {editingProduct && (
          <ProductForm
            product={editingProduct}
            onSubmit={(data) =>
              updateMutation.mutate({
                productId: editingProduct._id,
                vendorId: editingProduct.vendorId,
                data,
              })
            }
            onCancel={() => setEditingProduct(null)}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
