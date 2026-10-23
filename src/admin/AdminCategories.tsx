import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertTriangle, FolderTree } from 'lucide-react';
import { FloatingSaveButton } from './FloatingSaveButton';
import { Category } from '../types';
import { safeFetchJson } from '../lib/safeFetch';

interface AdminCategoriesProps {
  token: string;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({ token }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  // Delete reassign state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>('');
  const [deleteError, setDeleteError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchCategories = () => {
    setLoading(true);
    safeFetchJson<{ categories: Category[] }>('/api/categories')
      .then((data) => setCategories(data.categories || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setDisplayOrder(categories.length + 1);
    setIsActive(true);
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setDisplayOrder(cat.display_order);
    setIsActive(cat.is_active);
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    setErrorMessage('');

    const url = editingCategory
      ? `/api/admin/categories/${editingCategory.id}`
      : '/api/admin/categories';
    const method = editingCategory ? 'PUT' : 'POST';

    try {
      const data = await safeFetchJson<any>(
        url,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            slug,
            description,
            display_order: Number(displayOrder),
            is_active: isActive,
          }),
        },
        null
      );

      if (!data || data.error) {
        setErrorMessage(data?.error || 'Failed to save category.');
        return;
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      setErrorMessage('Server error while saving category.');
    }
  };


  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const query = reassignTargetId ? `?reassignToId=${reassignTargetId}` : '';
      const data = await safeFetchJson<any>(
        `/api/admin/categories/${deleteTarget.id}${query}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
        null
      );

      if (!data || data.error) {
        setDeleteError(data?.error || 'Failed to delete category.');
        return;
      }

      setDeleteTarget(null);
      setReassignTargetId('');
      fetchCategories();
    } catch (err) {
      setDeleteError('Server error while deleting category.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-theme-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-theme-muted">Loading category taxonomy...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-theme-primary">Artwork Categories</h2>
          <p className="text-xs text-theme-muted">
            Manage collections, display ordering, and descriptions shown across the customer catalog.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-theme-accent hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl border border-theme-glass craft-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-theme-page text-theme-muted uppercase tracking-wider font-semibold border-b border-theme-glass">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Category Name</th>
                <th className="px-5 py-3">Slug / URL</th>
                <th className="px-5 py-3">Products Assigned</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-glass">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-theme-accent/5 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-theme-accent">
                    #{cat.display_order}
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-serif font-bold text-sm text-theme-primary block">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-theme-muted line-clamp-1 max-w-sm">
                      {cat.description}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-theme-primary">
                    {cat.slug}
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-theme-accent/15 text-theme-accent font-semibold text-[11px] border border-theme-glass">
                      {cat.product_count ?? 0} artworks
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {cat.is_active ? (
                      <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-300 text-[10px] font-semibold border border-green-500/20">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-600 dark:text-gray-400 text-[10px] font-semibold border border-gray-500/20">
                        Hidden
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded-lg text-theme-primary hover:bg-theme-accent/15 cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget(cat);
                        setDeleteError('');
                        setReassignTargetId('');
                      }}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/20 cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="max-w-lg w-full glass-panel rounded-3xl border border-theme-glass craft-shadow p-6 sm:p-8 space-y-4 text-theme-primary">
            <div className="flex items-center justify-between border-b border-theme-glass pb-3">
              <h3 className="font-serif text-xl font-bold text-theme-primary">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-theme-muted hover:text-theme-primary cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-theme-primary mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-theme-primary mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass font-mono text-xs focus:outline-none focus:border-theme-accent text-theme-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-theme-primary mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-theme-primary mb-1">Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-theme-accent cursor-pointer"
                  />
                  <label htmlFor="isActiveCheck" className="font-semibold text-theme-primary cursor-pointer">
                    Active on Live Website
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-theme-glass">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl glass-button text-theme-primary cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
            <FloatingSaveButton onSave={handleSave} />
          </div>
        </div>
      )}

      {/* Delete Confirmation & Product Reassignment Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="max-w-md w-full glass-panel rounded-3xl border border-theme-glass craft-shadow p-6 space-y-4 text-xs text-theme-primary">
            <div className="flex items-center gap-3 text-red-500 font-serif text-lg font-bold">
              <AlertTriangle className="w-6 h-6" />
              <span>Delete Category "{deleteTarget.name}"?</span>
            </div>

            {deleteError && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300">
                {deleteError}
              </div>
            )}

            {(deleteTarget.product_count || 0) > 0 ? (
              <div className="space-y-3">
                <p className="text-theme-muted">
                  This category contains <strong>{deleteTarget.product_count || 0}</strong> assigned product(s). To protect your catalog integrity, please select a replacement category to receive these products:
                </p>
                <select
                  value={reassignTargetId}
                  onChange={(e) => setReassignTargetId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass font-semibold text-theme-primary"
                >
                  <option value="">-- Select Replacement Category --</option>
                  {categories
                    .filter((c) => c.id !== deleteTarget.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <p className="text-theme-muted">
                Are you sure you want to delete this category? There are no products currently assigned to it.
              </p>
            )}

            <div className="pt-3 flex justify-end gap-3 border-t border-theme-glass">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl glass-button text-theme-primary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={(deleteTarget.product_count || 0) > 0 && !reassignTargetId}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-50 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
