import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Copy,
  Eye,
  CheckCircle,
  EyeOff,
  Upload,
  X,
  Star,
  Image as ImageIcon,
  AlertTriangle,
  MoveUp,
  MoveDown,
  Flame,
  Clock,
  Tag,
  Check,
} from 'lucide-react';
import { Product, Category, ProductVariant, ProductImage } from '../types';
import { ArtworkPlaceholder } from '../components/ArtworkPlaceholder';
import { SafeProductImage } from '../components/SafeProductImage';
import { AvailableBadge } from '../components/AvailableBadge';
import { safeFetchJson, safeResponseJson } from '../lib/safeFetch';

interface AdminProductsProps {
  token: string;
  onPreviewProduct: (sku: string) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ token, onPreviewProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [missingImagesOnly, setMissingImagesOnly] = useState(false);

  // Edit / Create Modal State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState<number>(2400);
  const [baseSize, setBaseSize] = useState('12 inches');
  const [material, setMaterial] = useState('Moisture-resistant MDF board, Artist Acrylics, Varnish');
  const [framing, setFraming] = useState('');
  const [customizable, setCustomizable] = useState(true);
  const [creationTime, setCreationTime] = useState('5–7 working days');
  const [shippingInfo, setShippingInfo] = useState('All over the world (Bubble wrap and corrugated box)');
  const [specialInfo, setSpecialInfo] = useState('Clean gently with a soft dry microfiber cloth.');
  const [featured, setFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [availableBadgeText, setAvailableBadgeText] = useState('Available');
  const [unavailableBadgeText, setUnavailableBadgeText] = useState('Made to Order');
  const [showAvailableBadge, setShowAvailableBadge] = useState(true);
  const [isHighDemand, setIsHighDemand] = useState(false);
  const [extraDeliveryDays, setExtraDeliveryDays] = useState<number>(5);
  const [highDemandMessage, setHighDemandMessage] = useState(
    '✨ Loved by collectors! Due to high artisan demand and intricate mirror curing, please allow 5 additional days for our master artist to craft and perfect your sacred piece.'
  );

  // Images & Variants
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Image Uploading & Drag-and-Drop State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        safeFetchJson<{ products: Product[] }>('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } }, { products: [] }),
        safeFetchJson<Category[]>('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } }, []),
      ]);

      setProducts(prodRes?.products || []);
      setCategories(Array.isArray(catRes) ? catRes : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, [token]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName('');
    setSku(`DNA-${Math.floor(100 + Math.random() * 900)}`);
    setCategoryId(categories[0]?.id || 'cat-mandala');
    setShortDesc('');
    setDescription('');
    setBasePrice(2500);
    setBaseSize('12 inches');
    setMaterial('Moisture-resistant MDF board, Heavy Artist Acrylics, Clear Varnish');
    setFraming('');
    setCustomizable(true);
    setCreationTime('5–7 working days');
    setShippingInfo('All over the world (Bubble wrap and corrugated box)');
    setSpecialInfo('Wipe with dry microfiber cloth.');
    setFeatured(false);
    setIsPublished(true);
    setIsAvailable(true);
    setAvailableBadgeText('Available');
    setUnavailableBadgeText('Made to Order');
    setShowAvailableBadge(true);
    const initialCategory = categories[0];
    const isLippanDefault = initialCategory?.slug === 'lippan-wall-hangings';
    setIsHighDemand(isLippanDefault);
    setExtraDeliveryDays(5);
    setHighDemandMessage(
      '✨ Loved by collectors! Due to high artisan demand and intricate mirror curing, please allow 5 additional days for our master artist to craft and perfect your sacred piece.'
    );
    setImages([]);
    setVariants([
      { id: `v-${Date.now()}-1`, product_id: '', size: '12 inches diameter', price: 2500, is_available: true, display_order: 1 },
    ]);
    setErrorMessage('');
    setDrawerOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name || '');
    setSku(p.sku || '');
    setCategoryId(p.category_id || '');
    setShortDesc(p.short_description || '');
    setDescription(p.description || '');
    setBasePrice(p.base_price || 0);
    setBaseSize(p.base_size || '');
    setMaterial(p.material || '');
    setFraming(p.framing || '');
    setCustomizable(p.customizable !== false);
    setCreationTime(p.creation_time || '');
    setShippingInfo(p.shipping_info || '');
    setSpecialInfo(p.special_information || '');
    setFeatured(Boolean(p.featured));
    setIsPublished(Boolean(p.is_published));
    setIsAvailable(p.is_available !== false);
    setAvailableBadgeText(p.available_badge_text || 'Available');
    setUnavailableBadgeText(p.unavailable_badge_text || 'Made to Order');
    setShowAvailableBadge(p.show_available_badge !== false);
    const isLippanArt =
      p.category_slug === 'lippan-wall-hangings' ||
      (p.name || '').toLowerCase().includes('lippan') ||
      (p.sku || '').startsWith('DA-LP');
    setIsHighDemand(p.is_high_demand !== undefined ? p.is_high_demand : isLippanArt);
    setExtraDeliveryDays(p.extra_delivery_days !== undefined ? p.extra_delivery_days : 5);
    setHighDemandMessage(
      p.high_demand_message ||
        '✨ Loved by collectors! Due to high artisan demand and intricate mirror curing, please allow 5 additional days for our master artist to craft and perfect your sacred piece.'
    );
    setImages(p.images ? [...p.images] : []);
    setVariants(p.variants ? [...p.variants] : []);
    setErrorMessage('');
    setDrawerOpen(true);
  };

  // Upload multiple files (supports file input and drag-and-drop)
  const processFiles = async (filesList: FileList | File[]) => {
    if (!filesList || filesList.length === 0) return;

    setUploadingImage(true);
    setErrorMessage('');

    const filesArray = Array.from(filesList).filter((f) => f.type.startsWith('image/'));
    if (filesArray.length === 0) {
      setErrorMessage('Please provide image files (JPG, PNG, WebP).');
      setUploadingImage(false);
      return;
    }

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt_text', `${name || 'Artwork'} photo`);

      try {
        const res = await fetch('/api/uploads', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await safeResponseJson(res, {});
        if (res.ok && data?.file_path) {
          setImages((prev) => {
            const isFirst = prev.length === 0;
            const newImg: ProductImage = {
              id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              product_id: editingProduct?.id || '',
              storage_path: data.file_path,
              alt_text: file.name,
              display_order: prev.length + 1,
              is_primary: isFirst,
            };
            return [...prev, newImg];
          });
        } else {
          setErrorMessage(data?.error || 'Upload failed');
        }
      } catch {
        setErrorMessage('Failed to upload file.');
      }
    }

    setUploadingImage(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer && e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index,
      }))
    );
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  const handleAddVariant = () => {
    const newV: ProductVariant = {
      id: `v-${Date.now()}`,
      product_id: editingProduct?.id || '',
      size: '18 inches',
      price: basePrice + 1000,
      is_available: true,
      display_order: variants.length + 1,
    };
    setVariants((prev) => [...prev, newV]);
  };

  const handleRemoveVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const safeTrim = (str?: string | null) => (str ? str.trim() : '');

    const nameVal = safeTrim(name);
    const skuVal = safeTrim(sku);

    if (!nameVal || !skuVal) {
      setErrorMessage('Product name and unique SKU are required.');
      return;
    }

    const payload = {
      sku: skuVal.toUpperCase(),
      name: nameVal,
      short_description: safeTrim(shortDesc),
      description: safeTrim(description),
      category_id: categoryId,
      base_price: Number(basePrice) || 0,
      base_size: safeTrim(baseSize),
      material: safeTrim(material),
      framing: safeTrim(framing),
      customizable,
      creation_time: safeTrim(creationTime),
      shipping_info: safeTrim(shippingInfo),
      special_information: safeTrim(specialInfo),
      featured,
      is_published: isPublished,
      is_available: isAvailable,
      available_badge_text: safeTrim(availableBadgeText) || 'Available',
      unavailable_badge_text: safeTrim(unavailableBadgeText) || 'Made to Order',
      show_available_badge: showAvailableBadge,
      is_high_demand: isHighDemand,
      extra_delivery_days: Number(extraDeliveryDays) || 0,
      high_demand_message: safeTrim(highDemandMessage),
      images,
      variants,
    };

    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const data = await safeFetchJson<any>(
        url,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
        null
      );

      if (!data || data.error) {
        setErrorMessage(data?.error || 'Failed to save product');
        return;
      }

      setDrawerOpen(false);
      fetchProductsAndCategories();
    } catch {
      setErrorMessage('Network error while saving product.');
    }
  };

  const handleDuplicate = async (p: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${p.id}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchProductsAndCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/admin/products/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDeleteConfirm(null);
        fetchProductsAndCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickToggleAvailability = async (p: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextVal = !(p.is_available !== false);
    // Optimistic update
    setProducts((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, is_available: nextVal } : item))
    );

    try {
      await fetch(`/api/admin/products/${p.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_available: nextVal }),
      });
    } catch (err) {
      console.error('Failed to toggle availability', err);
      fetchProductsAndCategories();
    }
  };

  // Filter products list
  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'all' && p.category_id !== categoryFilter && p.category_slug !== categoryFilter) {
      return false;
    }
    if (statusFilter === 'published' && !p.is_published) return false;
    if (statusFilter === 'draft' && p.is_published) return false;
    if (missingImagesOnly && p.images && p.images.length > 0) return false;
    if (search && search.trim()) {
      const q = search.toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchSku = (p.sku || '').toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#2C2724]">
            Product Catalog Management
          </h2>
          <p className="text-xs text-[#7D6B5D]">
            Manage catalog items, size variants, uploaded photos, and publication states.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#A03E1B] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Artwork</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5D7C7] craft-shadow flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#8C7667] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C7B5] focus:outline-none focus:border-[#C85A32] text-[#2C2724]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C7B5] text-[#2C2724]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C7B5] text-[#2C2724]"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft / Hidden</option>
          </select>

          {/* Missing photos checkbox */}
          <label className="flex items-center gap-1.5 text-[#5B331A] cursor-pointer">
            <input
              type="checkbox"
              checked={missingImagesOnly}
              onChange={(e) => setMissingImagesOnly(e.target.checked)}
              className="rounded text-[#C85A32]"
            />
            <span>Missing photos only</span>
          </label>
        </div>

        <span className="text-[#8C7667] text-[11px]">
          Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> artworks
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#E5D7C7] craft-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[#8C7667] uppercase tracking-wider font-semibold border-b border-[#E5D7C7]">
              <tr>
                <th className="px-4 py-3">Photo</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Artwork Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Availability & Demand</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EAE0]">
              {filteredProducts.map((p) => {
                const isLippan =
                  p.category_slug === 'lippan-wall-hangings' ||
                  (p.name || '').toLowerCase().includes('lippan') ||
                  (p.sku || '').startsWith('DA-LP');
                const isDemandHigh = p.is_high_demand !== undefined ? p.is_high_demand : isLippan;
                const primaryImg = p.images?.find((img) => img.is_primary) || p.images?.[0];

                return (
                  <tr key={p.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    {/* Thumbnail */}
                    <td className="px-4 py-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#E0D2C2] bg-[#FAF7F2]">
                        <SafeProductImage
                          src={primaryImg?.storage_path}
                          alt={p.name}
                          name={p.name}
                          sku={p.sku}
                          category_slug={p.category_slug}
                          size="sm"
                          className="w-full h-full"
                        />
                        <div className="absolute bottom-0.5 left-0.5 z-10 pointer-events-none scale-75 origin-bottom-left">
                          <AvailableBadge
                            isAvailable={p.is_available !== false}
                            badgeText={p.available_badge_text}
                            unavailableText={p.unavailable_badge_text}
                            size="xs"
                          />
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="px-4 py-3 font-mono font-semibold text-[#8C4A28]">
                      {p.sku}
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3">
                      <span className="font-serif font-semibold text-sm text-[#2C2724] block line-clamp-1">
                        {p.name}
                      </span>
                      {(!p.images || p.images.length === 0) && (
                        <span className="text-[10px] text-orange-600 font-medium">
                          ⚠ Needs studio photo upload
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-[#5B331A]">
                      {p.category_name}
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 font-semibold text-[#A03E1B]">
                      ₹{p.base_price.toLocaleString('en-IN')}
                    </td>

                    {/* Size */}
                    <td className="px-4 py-3 text-[#7D6B5D]">
                      {p.base_size}
                    </td>

                    {/* Availability & Demand */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5 items-start">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleQuickToggleAvailability(p, e)}
                            className="transition-transform hover:scale-105 active:scale-95 cursor-pointer text-left"
                            title="Click to toggle Available / Unavailable instantly"
                          >
                            <AvailableBadge
                              isAvailable={p.is_available !== false}
                              badgeText={p.available_badge_text}
                              unavailableText={p.unavailable_badge_text}
                              size="xs"
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="p-1 rounded text-[#8C7667] hover:text-[#C85A32] hover:bg-[#FAF0E6] cursor-pointer"
                            title="Edit Available badge text & settings"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                        {isDemandHigh && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold"
                            style={{
                              backgroundColor: 'var(--high-demand-pill-bg)',
                              color: 'var(--high-demand-pill-text)',
                              borderColor: 'var(--high-demand-border)',
                            }}
                          >
                            <Flame className="w-3 h-3 text-orange-600 shrink-0" />
                            <span>High Demand (+{p.extra_delivery_days ?? 5}d)</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {p.is_published ? (
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-semibold">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 text-[10px] font-semibold">
                          Draft
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => onPreviewProduct(p.sku)}
                        className="p-1.5 rounded-lg text-[#5B331A] hover:bg-[#FAF0E6]"
                        title="Preview Public Page"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg text-[#5B331A] hover:bg-[#FAF0E6]"
                        title="Edit Artwork"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(p)}
                        className="p-1.5 rounded-lg text-[#5B331A] hover:bg-[#FAF0E6]"
                        title="Duplicate Product"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(p)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Drawer / Modal */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0E5D8] pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#2C2724]">
                  {editingProduct ? `Edit ${editingProduct.sku}` : 'Add New Artwork'}
                </h3>
                <p className="text-xs text-[#7D6B5D]">
                  Update descriptions, dimensions, photos, and materials.
                </p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-full text-[#7D6B5D] hover:bg-[#FAF7F2]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
              {/* Basic Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-[#8C4A28] uppercase tracking-wider">
                  1. Title, SKU & Category
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#4A3E36] mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Surya Solar Mandala Wall Hanging"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] text-[#2C2724] border border-[#D8C7B5] focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#4A3E36] mb-1">Unique SKU / Code *</label>
                    <input
                      type="text"
                      required
                      value={sku}
                      onChange={(e) => setSku(e.target.value.toUpperCase())}
                      placeholder="e.g. DNA-MAN-001"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] text-[#2C2724] border border-[#D8C7B5] font-mono focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#4A3E36] mb-1">Category *</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] text-[#2C2724] border border-[#D8C7B5]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#4A3E36] mb-1">Base Price (INR) *</label>
                    <input
                      type="number"
                      required
                      value={basePrice}
                      onChange={(e) => setBasePrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] text-[#2C2724] border border-[#D8C7B5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3E36] mb-1">
                    Standard Size / Dimensions (e.g. 48 inches X 24 inches or 18 inches) *
                  </label>
                  <input
                    type="text"
                    required
                    value={baseSize}
                    onChange={(e) => setBaseSize(e.target.value)}
                    placeholder="e.g. 48 inches X 24 inches, 18 inches, 12 inches X 10 inches..."
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] text-[#2C2724] border border-[#D8C7B5] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3E36] mb-1">Full Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe inspiration, symbolism, craftsmanship..."
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] text-[#2C2724] border border-[#D8C7B5] resize-none"
                  />
                </div>
              </div>

              {/* Photos & Media Upload with Drag and Drop */}
              <div className="space-y-4 pt-4 border-t border-[#F0E5D8]">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-[#8C4A28] uppercase tracking-wider">
                    2. Artwork Images
                  </h4>
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-[#FAF0E6] text-[#A03E1B] font-semibold hover:bg-[#F3ECE2] flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Browse Files</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadingImage && (
                  <p className="text-xs text-[#C85A32] animate-pulse font-medium">Uploading photo to server storage...</p>
                )}

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center space-y-2 cursor-pointer ${
                    isDraggingOver
                      ? 'border-[#C85A32] bg-[#FAF0E6] scale-[1.01]'
                      : 'border-[#D8C7B5] bg-[#FAF7F2] hover:border-[#C85A32]/70 hover:bg-[#FAF2E8]'
                  }`}
                  onClick={() => {
                    const input = document.getElementById('artwork-drag-drop-input') as HTMLInputElement;
                    if (input) input.click();
                  }}
                >
                  <input
                    id="artwork-drag-drop-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="w-10 h-10 mx-auto rounded-full bg-[#FAF0E6] text-[#A03E1B] flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#2C2724]">
                      {isDraggingOver ? 'Drop images here now!' : 'Drag & drop artwork images here'}
                    </p>
                    <p className="text-xs text-[#8C7667] mt-0.5">
                      or click to select JPG, PNG, or WebP photos from your device
                    </p>
                  </div>
                </div>

                {images.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E0D2C2] text-center">
                    <p className="text-[11px] text-[#8C7667]">
                      A graceful handcrafted SVG placeholder will be shown until real photos are uploaded.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-[#8C4A28] flex items-center justify-between">
                      <span>Uploaded Artwork Photos ({images.length})</span>
                      <span className="text-[11px] text-[#8C7667] font-normal">Click ★ on any photo to set as Cover</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 group ${
                          img.is_primary ? 'border-[#C85A32] shadow-xs' : 'border-[#E0D2C2]'
                        }`}
                      >
                        <SafeProductImage
                          src={img.storage_path}
                          alt={img.alt_text || name}
                          name={name}
                          sku={sku}
                          category_slug={categories.find(c => c.id === categoryId)?.slug}
                          size="sm"
                          className="w-full h-full"
                        />
                        {img.is_primary && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#C85A32] text-white text-[9px] font-bold">
                            Cover
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {!img.is_primary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="p-1 rounded bg-white text-xs font-semibold text-[#2C2724]"
                              title="Set as Cover"
                            >
                              ★
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1 rounded bg-red-600 text-white cursor-pointer"
                            title="Remove Image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Size Variants */}
              <div className="space-y-3 pt-4 border-t border-[#F0E5D8]">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-[#8C4A28] uppercase tracking-wider">
                    3. Dimensions & Variant Pricing
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-2.5 py-1 rounded bg-[#FAF0E6] text-[#A03E1B] font-semibold"
                  >
                    + Add Size Variant
                  </button>
                </div>

                  <div className="space-y-2">
                  {variants.map((v, i) => (
                    <div key={v.id || i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={v.size}
                        onChange={(e) => {
                          const copy = [...variants];
                          copy[i].size = e.target.value;
                          setVariants(copy);
                        }}
                        placeholder="e.g. 48 inches X 24 inches"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C7B5] text-xs text-[#2C2724] focus:outline-none focus:border-[#C85A32]"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={v.price}
                        onChange={(e) => {
                          const copy = [...variants];
                          copy[i].price = Number(e.target.value);
                          setVariants(copy);
                        }}
                        className="w-24 px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C7B5]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(i)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                        title="Remove Variant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Material, Creation Time, Shipping */}
              <div className="space-y-4 pt-4 border-t border-[#F0E5D8]">
                <h4 className="font-semibold text-sm text-[#8C4A28] uppercase tracking-wider">
                  4. Craft Materials & Logistics
                </h4>

                <div>
                  <label className="block font-semibold text-[#4A3E36] mb-1">Materials Used</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] text-[#2C2724] border border-[#D8C7B5]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#4A3E36] mb-1">Estimated Creation Time</label>
                    <input
                      type="text"
                      value={creationTime}
                      onChange={(e) => setCreationTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] text-[#2C2724] border border-[#D8C7B5]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#4A3E36] mb-1">Shipping Details</label>
                    <input
                      type="text"
                      value={shippingInfo}
                      onChange={(e) => setShippingInfo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] text-[#2C2724] border border-[#D8C7B5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3E36] mb-1">Care & Special Instructions</label>
                  <input
                    type="text"
                    value={specialInfo}
                    onChange={(e) => setSpecialInfo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] text-[#2C2724] border border-[#D8C7B5]"
                  />
                </div>
              </div>

              {/* 5. Availability & High Demand Delivery Settings */}
              <div className="space-y-4 pt-4 border-t border-[#F0E5D8]">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-[#8C4A28] uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>5. Available Badge & Demand Settings</span>
                  </h4>
                  <span className="text-[10px] font-mono text-[#8C7667] bg-[#FAF0E6] px-2 py-0.5 rounded border border-[#E0D2C2]">
                    Image Badges & Lead Time
                  </span>
                </div>

                {/* Available Badge Editor Card */}
                <div className="p-5 rounded-2xl bg-[#F6FAF6] border-2 border-emerald-500/30 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="font-semibold text-sm text-emerald-950">
                        Artwork Image "Available" Badge Configuration
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Editable in CMS
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Toggles & Inputs */}
                    <div className="space-y-3.5">
                      {/* Show Badge Toggle */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showAvailableBadge}
                          onChange={(e) => setShowAvailableBadge(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-semibold text-xs text-[#2C2724]">
                          Display Available Badge on artwork image
                        </span>
                      </label>

                      {/* Item Available Status Toggle */}
                      <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-1.5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAvailable}
                            onChange={(e) => setIsAvailable(e.target.checked)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-bold text-xs text-emerald-950">
                            Artwork is Available to Order (Active)
                          </span>
                        </label>
                        <p className="text-[11px] text-[#7D6B5D] pl-6">
                          Uncheck if this original piece has been claimed or requires custom commission.
                        </p>
                      </div>

                      {/* Available Badge Label */}
                      <div>
                        <label className="block font-semibold text-[#4A3E36] text-xs mb-1">
                          Available Badge Label Text
                        </label>
                        <input
                          type="text"
                          value={availableBadgeText}
                          onChange={(e) => setAvailableBadgeText(e.target.value)}
                          placeholder="e.g. Available, Available to Order, In Stock"
                          className="w-full px-3 py-2 rounded-xl bg-white text-[#2C2724] border border-[#D8C7B5] focus:outline-none focus:border-emerald-600 text-xs font-semibold"
                        />
                        {/* Quick Presets */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {['Available', 'Available to Order', 'Ready to Ship', 'In Stock', 'Original Piece'].map((txt) => (
                            <button
                              key={txt}
                              type="button"
                              onClick={() => setAvailableBadgeText(txt)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                                availableBadgeText === txt
                                  ? 'bg-emerald-700 text-white border-emerald-800'
                                  : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200'
                              }`}
                            >
                              {txt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Unavailable Badge Label (shown when not available) */}
                      <div>
                        <label className="block font-semibold text-[#4A3E36] text-xs mb-1">
                          Unavailable Badge Label (when not in stock)
                        </label>
                        <input
                          type="text"
                          value={unavailableBadgeText}
                          onChange={(e) => setUnavailableBadgeText(e.target.value)}
                          placeholder="e.g. Made to Order, Unavailable, Sold Out"
                          className="w-full px-3 py-2 rounded-xl bg-white text-[#2C2724] border border-[#D8C7B5] focus:outline-none focus:border-stone-600 text-xs font-semibold"
                        />
                        {/* Quick Presets */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {['Made to Order', 'Unavailable', 'Sold Out', 'Commission Only'].map((txt) => (
                            <button
                              key={txt}
                              type="button"
                              onClick={() => setUnavailableBadgeText(txt)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                                unavailableBadgeText === txt
                                  ? 'bg-stone-700 text-white border-stone-800'
                                  : 'bg-white hover:bg-stone-50 text-stone-900 border-stone-300'
                              }`}
                            >
                              {txt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Live Visual Badge Preview */}
                    <div className="p-4 rounded-xl bg-white border border-emerald-200 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-xs text-[#2C2724]">
                            Live Preview on Artwork Image
                          </span>
                          <span className="text-[10px] text-emerald-700 font-mono">
                            Catalog & Gallery View
                          </span>
                        </div>
                        <p className="text-[11px] text-[#7D6B5D] mb-3">
                          This is how the badge appears floating on this artwork photo on the public website:
                        </p>

                        <div className="relative aspect-square max-w-[200px] mx-auto rounded-xl overflow-hidden border-2 border-[#E0D2C2] bg-[#FAF7F2] p-2 flex items-center justify-center shadow-xs">
                          <SafeProductImage
                            src={images[0]?.storage_path}
                            alt={name || 'Preview'}
                            name={name || 'Preview'}
                            sku={sku || 'DNA-PREVIEW'}
                            category_slug={categories.find((c) => c.id === categoryId)?.slug}
                            size="sm"
                            className="w-full h-full"
                          />
                          {/* Live Badge Overlay */}
                          {showAvailableBadge && (
                            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-mono text-white/90 border border-white/20">
                                {sku || 'SKU'}
                              </span>
                              <AvailableBadge
                                isAvailable={isAvailable}
                                badgeText={availableBadgeText}
                                unavailableText={unavailableBadgeText}
                                size="xs"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-center pt-2 border-t border-[#F0E5D8]">
                        <span className="text-[11px] font-semibold text-emerald-800">
                          Status: {isAvailable ? `Available ("${availableBadgeText || 'Available'}")` : `Unavailable ("${unavailableBadgeText || 'Made to Order'}")`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* High Demand Toggle & Lead Time */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isHighDemand}
                        onChange={(e) => setIsHighDemand(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-semibold text-sm text-amber-950 flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
                        <span>Show as High Demand (Lippan Art / Popular)</span>
                      </span>
                    </label>
                    <p className="text-[11px] text-amber-800/80 pl-6">
                      Highlights this item with a &quot;High Demand&quot; badge and displays the positive crafting lead time message.
                    </p>
                  </div>
                </div>

                {/* Extra Delivery Days & Free Text Box (Shown when High Demand is active) */}
                {isHighDemand && (
                  <div className="p-4 rounded-2xl bg-[#FFFBF5] border-2 border-amber-300/80 space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-amber-200/70 pb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className="font-semibold text-xs text-[#5B331A]">
                          High Demand Delivery Notice Configuration
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-medium bg-emerald-100/60 px-2 py-0.5 rounded">
                        Positive phrasing (no negative delays)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-semibold text-[#4A3E36] mb-1">
                          Extra Days Needed to Deliver *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min={1}
                            max={60}
                            value={extraDeliveryDays}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setExtraDeliveryDays(val);
                              if (highDemandMessage.includes('additional days') || highDemandMessage.includes('more days')) {
                                setHighDemandMessage((prev) =>
                                  prev.replace(/\d+ (additional|more) days/g, `${val} $1 days`)
                                );
                              }
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-white text-[#2C2724] border border-amber-300 focus:outline-none focus:border-[#C85A32] font-semibold"
                          />
                          <span className="absolute right-3 top-2 text-xs text-[#8C7667]">days</span>
                        </div>
                        <p className="text-[10px] text-[#8C7667] mt-1">
                          Default is 5 extra days for intricate mirror work &amp; curing.
                        </p>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-[#4A3E36] mb-1 flex items-center justify-between">
                          <span>Customer Notice Message (Free Text Box) *</span>
                          <span className="text-[10px] text-[#8C7667] font-normal">
                            Fully customizable text
                          </span>
                        </label>
                        <textarea
                          rows={3}
                          value={highDemandMessage}
                          onChange={(e) => setHighDemandMessage(e.target.value)}
                          placeholder="e.g. ✨ Loved by collectors! Due to high artisan demand and intricate mirror curing, please allow 5 additional days for our master artist to craft and perfect your sacred piece."
                          className="w-full px-3 py-2 rounded-xl bg-white text-[#2C2724] border border-amber-300 focus:outline-none focus:border-[#C85A32] text-xs resize-none"
                        />
                        <p className="text-[10px] text-[#8C7667] mt-1">
                          This free text message will be prominently shown to customers on the catalog and product details page.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="pt-4 border-t border-[#F0E5D8] flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded text-[#C85A32]"
                  />
                  <span className="font-semibold text-[#2C2724]">Publish on live website</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded text-[#C85A32]"
                  />
                  <span className="font-semibold text-[#2C2724]">Featured on homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customizable}
                    onChange={(e) => setCustomizable(e.target.checked)}
                    className="rounded text-[#C85A32]"
                  />
                  <span className="font-semibold text-[#2C2724]">Customizable upon request</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-6 border-t border-[#F0E5D8] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#D4A373] text-[#5B331A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#A03E1B] text-white font-semibold"
                >
                  Save Artwork
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#E3D4C4] craft-shadow p-6 space-y-4 text-xs">
            <h3 className="font-serif text-lg font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Delete Artwork "{deleteConfirm.name}"?</span>
            </h3>
            <p className="text-[#66574D]">
              This will remove SKU <strong>{deleteConfirm.sku}</strong> from your catalog. This action cannot be reversed.
            </p>
            <div className="pt-4 flex justify-end gap-3 border-t border-[#F0E5D8]">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl border border-[#D4A373] text-[#5B331A]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
