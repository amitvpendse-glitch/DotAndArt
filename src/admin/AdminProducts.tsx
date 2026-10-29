import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
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
  Truck,
  Sliders,
  Info,
  Download,
  FileSpreadsheet,
  FileDown,
  Loader2,
  Save,
} from 'lucide-react';
import { Product, Category, ProductVariant, ProductImage, WebsiteSettings } from '../types';
import { ArtworkPlaceholder } from '../components/ArtworkPlaceholder';
import { SafeProductImage } from '../components/SafeProductImage';
import { AvailableBadge } from '../components/AvailableBadge';
import { safeFetchJson, safeResponseJson } from '../lib/safeFetch';
import { handleClientFallbackApi } from '../lib/clientFallbackApi';
import { generateProfessionalCatalogPDF } from '../utils/pdfCatalogGenerator';
import { deleteFirestoreProducts, updateFirestoreProducts, saveFirestoreProduct, getFirestoreDeletedIds, syncLocalCustomProductsToFirestore } from '../lib/firestoreCatalog';
import { isAwaitingPhoto } from '../utils/productUtils';
import { compressImageFile } from '../utils/imageCompressor';
import { saveLocalArtworkImage, saveLocalCustomProduct, exportLocalCatalogBackup, importLocalCatalogBackup } from '../utils/localImageCache';

interface AdminProductsProps {
  token: string;
  onPreviewProduct: (sku: string) => void;
  initialFilterMissingImages?: boolean;
  initialFilterStatus?: string;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  token,
  onPreviewProduct,
  initialFilterMissingImages = false,
  initialFilterStatus = 'all',
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(initialFilterStatus);
  const [missingImagesOnly, setMissingImagesOnly] = useState(initialFilterMissingImages);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  useEffect(() => {
    if (initialFilterMissingImages !== undefined) {
      setMissingImagesOnly(initialFilterMissingImages);
    }
  }, [initialFilterMissingImages]);

  useEffect(() => {
    if (initialFilterStatus !== undefined) {
      setStatusFilter(initialFilterStatus);
    }
  }, [initialFilterStatus]);

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
    'Loved by collectors! Due to high artisan demand and intricate mirror curing, please allow 5 additional days for our master artist to craft and perfect your authentic piece.'
  );
  const [badgeTag, setBadgeTag] = useState('');
  const [photosAvailableNote, setPhotosAvailableNote] = useState('');

  // Save button disabled/enabled state tracking (Requirement 4)
  const [isDrawerDirty, setIsDrawerDirty] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // Images & Variants
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Image Uploading & Drag-and-Drop State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const backupFileInputRef = React.useRef<HTMLInputElement>(null);

  // Download Catalog (PDF / CSV) State for Admin Console
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgressText, setPdfProgressText] = useState('');
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings | null>(null);

  const handleDownloadPdfCatalog = async () => {
    if (!products || products.length === 0) return;
    setIsGeneratingPdf(true);
    setPdfProgressText('Initializing PDF Document Engine...');

    try {
      await generateProfessionalCatalogPDF(products, websiteSettings, (current, total, pName) => {
        setPdfProgressText(`Preparing high-res artwork ${current} of ${total} — ${pName}`);
      });
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgressText('');
    }
  };

  const handleExportCsvCatalog = () => {
    if (!products || products.length === 0) return;

    const headers = ['id', 'sku', 'name', 'category_id', 'category_name', 'category_slug', 'base_size', 'base_price', 'customizable', 'is_published', 'is_available', 'description'];
    
    const csvRows = products.map((p) => {
      const escape = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
      const cleanSku = (p.sku || '').trim().toUpperCase();
      const pid = p.id || `prod-${cleanSku.toLowerCase()}`;
      return [
        escape(pid),
        escape(cleanSku),
        escape(p.name),
        escape(p.category_id || 'cat-mandala'),
        escape(p.category_name || 'Mandala Wall Hangings'),
        escape(p.category_slug || 'mandala-wall-hangings'),
        escape(p.base_size),
        p.base_price,
        p.customizable !== false ? 'true' : 'false',
        p.is_published !== false ? 'true' : 'false',
        p.is_available !== false ? 'true' : 'false',
        escape(p.description),
      ].join(',');
    });

    const csvString = [headers.join(','), ...csvRows].join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Dot_And_Art_Product_Catalog.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Bulk CSV / Excel Catalog Import State
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState('');
  const [bulkErrorMsg, setBulkErrorMsg] = useState('');

  // Clear All Catalog Modal State
  const [clearCatalogModalOpen, setClearCatalogModalOpen] = useState(false);
  const [clearingCatalog, setClearingCatalog] = useState(false);

  const handleConfirmClearCatalog = async () => {
    setClearingCatalog(true);
    try {
      await deleteFirestoreProducts(
        products.map((p) => p.id),
        products.map((p) => p.sku).filter(Boolean)
      ).catch(() => {});

      await fetch('/api/admin/products/clear-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.setItem('app_custom_products', JSON.stringify([]));
      localStorage.setItem('app_deleted_product_ids', JSON.stringify([]));
      setProducts([]);
      setSelectedIds([]);
      setClearCatalogModalOpen(false);
      setBulkSuccessMsg('🎉 Successfully cleared all products from catalog!');
      setTimeout(() => setBulkSuccessMsg(''), 5000);
      fetchProductsAndCategories();
      window.dispatchEvent(new Event('app_products_updated'));
    } catch (err) {
      console.error('Error clearing catalog:', err);
    } finally {
      setClearingCatalog(false);
    }
  };

  const handleDownloadSampleCsv = () => {
    const sampleCsvContent = `Product Code,Name,Category,Price,Size,Material,Description,Framing,Creation Time
DA-MD-10-0001,Authentic Mandala Harmony,Mandala Wall Hangings,2800,12 inches,MDF Wood & Acrylics,Hand-painted dot mandala with gold accents,Ready to hang,5-7 days
DA-MND-102,Radiant Solar Chakra,Mandala Wall Hangings,3200,14 inches,MDF Wood & Acrylics,Vibrant chakra color gradient mandala,Ready to hang,5-7 days
DA-MND-103,Lotus Blossom Medallion,Mandala Wall Hangings,2500,10 inches,MDF Wood & Acrylics,Lotus motif authentic geometry artwork,Ready to hang,5-7 days
DA-MND-104,Cosmic Infinity Mandala,Mandala Wall Hangings,4200,18 inches,MDF Wood & Acrylics,Large intricate 18 inch wall art piece,Ready to hang,7-10 days
DA-MND-105,Golden Temple Mandala,Mandala Wall Hangings,3800,16 inches,MDF Wood & Gold Foil,Gold leaf highlighted mandala artwork,Ready to hang,7-10 days
DA-LIP-101,Kutch Peacock Lippan Art,Lippan Wall Hangings,3500,14 inches,Mud Paste & Mirrors,Traditional clay mud work with glass mirrors,Frameless,7-10 days
DA-LIP-102,Royal Floral Lippan Mirror,Lippan Wall Hangings,2900,12 inches,Mud Paste & Mirrors,Floral traditional mud mirror wall decor,Frameless,5-7 days
DA-LIP-103,Shree Ganesha Lippan Art,Lippan Wall Hangings,3200,12 inches,Mud Paste & Mirrors,Auspicious Ganesha motif in mud mirror,Frameless,5-7 days
DA-LIP-104,Desert Sun Lippan Plaque,Lippan Wall Hangings,4500,18 inches,Mud Paste & Mirrors,Large sunburst mud mirror artwork,Frameless,7-10 days
DA-LIP-105,Tree of Life Lippan Art,Lippan Wall Hangings,3900,16 inches,Mud Paste & Mirrors,Authentic tree of life handcrafted mud mirror,Frameless,7-10 days`;

    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_product_catalog.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkErrorMsg('');
    setBulkSuccessMsg('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setBulkErrorMsg('The uploaded CSV or Excel file contains no data rows.');
          setParsedRows([]);
          return;
        }

        const cleaned = rawJson.map((row) => {
          const rowKeys = Object.keys(row);
          const getValByPriorityKeys = (priorityKeys: string[]) => {
            for (const pKey of priorityKeys) {
              const cleanPKey = pKey.toLowerCase().replace(/[^a-z0-9]/g, '');
              for (const rKey of rowKeys) {
                const cleanRKey = rKey.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                if (cleanRKey === cleanPKey) {
                  const val = String(row[rKey] ?? '').trim();
                  if (val) return val;
                }
              }
            }
            return '';
          };

          // 1. Map SKU specifically to Product Code / SKU / Code column (EXACT preservation)
          let skuVal = getValByPriorityKeys([
            'productcode',
            'product_code',
            'product-code',
            'sku',
            'code',
            'itemcode',
            'artcode',
            'designcode',
            'productid',
            'itemid',
            'itemno',
            'productno',
            'artno',
            'skuid',
            'designno',
            'srno',
            'sno',
            'serialno',
            'no',
            'number',
            'article',
            'articleno',
            'articlecode',
            'style',
            'styleno',
            'model',
            'modelno',
            'ref',
            'reference',
            'item',
          ]);

          if (!skuVal && rowKeys.length > 0) {
            skuVal = String(row[rowKeys[0]] ?? '').trim();
          }

          // 2. Map Name specifically to Product Name / Title / Name column (EXACT preservation)
          let nameVal = getValByPriorityKeys([
            'name',
            'productname',
            'product_name',
            'title',
            'artworktitle',
            'itemname',
            'nameofproduct',
            'producttitle',
            'artwork',
            'designname',
          ]);

          if (!nameVal && rowKeys.length > 1) {
            nameVal = String(row[rowKeys[1]] ?? '').trim();
          }
          if (!nameVal) {
            nameVal = skuVal;
          }

          return {
            sku: skuVal || `DA-ART-${Math.floor(1000 + Math.random() * 9000)}`,
            name: nameVal || skuVal || 'Handcrafted Authentic Artwork',
            category_name: getValByPriorityKeys(['category', 'categoryname', 'categoryslug', 'type']),
            base_price: parseFloat(getValByPriorityKeys(['price', 'baseprice', 'cost', 'amount', 'inr'])) || 2400,
            base_size: getValByPriorityKeys(['size', 'basesize', 'dimensions', 'dimension', 'diameter']) || '12 inches',
            material: getValByPriorityKeys(['material', 'materials', 'medium', 'materialsused']) || 'MDF Wood, Artist Acrylics, Varnish',
            description: getValByPriorityKeys(['description', 'shortdescription', 'details', 'story']) || 'Handcrafted authentic artwork.',
            framing: getValByPriorityKeys(['framing', 'frame', 'framingdetails']) || 'Ready to hang (Unframed)',
            creation_time: getValByPriorityKeys(['creationtime', 'leadtime', 'deliverytime', 'craftingtime']) || '5–7 working days',
            shipping_info: getValByPriorityKeys(['shippinginfo', 'shipping', 'shippingdetails']) || 'Worldwide shipping available',
            special_information: getValByPriorityKeys(['specialinformation', 'care', 'careinstructions']) || 'Clean gently with a soft dry microfiber cloth.',
          };
        });

        setParsedRows(cleaned);
      } catch (err) {
        console.error('Failed to parse file:', err);
        setBulkErrorMsg('Failed to parse file. Please upload a valid CSV or Excel (.xlsx / .xls) file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExecuteBulkImport = async () => {
    if (parsedRows.length === 0) return;
    setBulkImporting(true);
    setBulkErrorMsg('');
    setBulkSuccessMsg('');

    try {
      const data = await safeFetchJson<any>(
        '/api/admin/products/bulk',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ products: parsedRows }),
        },
        { success: false }
      );

      if (data && data.success) {
        setBulkSuccessMsg(`🎉 Successfully imported ${data.count || parsedRows.length} catalog item(s)!`);
        setParsedRows([]);
        setCategoryFilter('all');
        setStatusFilter('all');
        setMissingImagesOnly(false);
        fetchProductsAndCategories();
        window.dispatchEvent(new Event('app_products_updated'));
      } else {
        setBulkErrorMsg(data?.error || 'Failed to import catalog products.');
      }
    } catch (err) {
      console.error(err);
      setBulkErrorMsg('Network error while performing bulk catalog import.');
    } finally {
      setBulkImporting(false);
    }
  };

  // Free-text category addition state
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  // Bulk Selection & Operations State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkUpdateModalOpen, setBulkUpdateModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkField, setBulkField] = useState('base_price');
  const [bulkValue, setBulkValue] = useState('');
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkUpdateSuccess, setBulkUpdateSuccess] = useState(false);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectProduct = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExecuteBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setBulkDeleting(true);
    try {
      const selectedProducts = products.filter((p) => selectedIds.includes(p.id) || selectedIds.includes(p.sku));
      const selectedSkus = selectedProducts.map((p) => p.sku).filter(Boolean);

      // Direct Firestore delete for multi-device live sync
      await deleteFirestoreProducts(selectedIds, selectedSkus).catch((err) =>
        console.warn('Firestore direct bulk delete warning', err)
      );

      await safeFetchJson<any>(
        '/api/admin/products/bulk-delete',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: selectedIds, skus: selectedSkus }),
        },
        { success: true }
      );

      const count = selectedIds.length;
      const idsToDelete = new Set(selectedIds);
      const skusToDelete = new Set(selectedSkus);

      setProducts((prev) => prev.filter((p) => !idsToDelete.has(p.id) && !skusToDelete.has(p.sku)));
      setSelectedIds([]);
      setBulkDeleteModalOpen(false);
      setBulkSuccessMsg(`🎉 Successfully deleted ${count} product(s)!`);
      setTimeout(() => setBulkSuccessMsg(''), 5000);
      fetchProductsAndCategories();
      window.dispatchEvent(new Event('app_products_updated'));
    } catch (err) {
      console.error('Bulk delete failed', err);
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleExecuteBulkUpdate = async () => {
    if (selectedIds.length === 0 || !bulkValue.trim()) return;
    setBulkUpdating(true);
    setBulkUpdateSuccess(false);

    let fields: Record<string, any> = {};
    if (bulkField === 'base_price') {
      fields.base_price = parseFloat(bulkValue) || 0;
    } else if (bulkField === 'category_id') {
      fields.category_id = bulkValue;
      fields.category_name = bulkValue;
    } else if (bulkField === 'is_published' || bulkField === 'is_available' || bulkField === 'featured') {
      fields[bulkField] = bulkValue === 'true';
    } else {
      fields[bulkField] = bulkValue;
    }

    try {
      const selectedProducts = products.filter((p) => selectedIds.includes(p.id) || selectedIds.includes(p.sku));
      const selectedSkus = selectedProducts.map((p) => p.sku).filter(Boolean);

      // Direct Firestore update for multi-device live sync
      await updateFirestoreProducts(selectedIds, selectedSkus, fields).catch((err) =>
        console.warn('Firestore direct bulk update warning', err)
      );

      let resData = await safeFetchJson<any>(
        '/api/admin/products/bulk-update',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ids: selectedIds,
            skus: selectedSkus,
            fields,
          }),
        },
        null
      );

      if (!resData || resData.error) {
        resData = handleClientFallbackApi('/api/admin/products/bulk-update', {
          method: 'PUT',
          body: JSON.stringify({
            ids: selectedIds,
            skus: selectedSkus,
            fields,
          }),
        });
      }

      if (resData && (resData.success || resData.count > 0)) {
        const count = resData.count || selectedIds.length;
        setBulkUpdateSuccess(true);
        setBulkSuccessMsg(`🎉 Successfully updated ${count} product(s) with new ${bulkField.replace('_', ' ')}!`);
        setTimeout(() => setBulkSuccessMsg(''), 5000);

        setTimeout(() => {
          setSelectedIds([]);
          setBulkUpdateModalOpen(false);
          setBulkValue('');
          setBulkUpdateSuccess(false);
          setBulkUpdating(false);
          fetchProductsAndCategories();
          window.dispatchEvent(new Event('app_products_updated'));
        }, 1200);
      } else {
        setBulkUpdating(false);
        setBulkUpdateSuccess(false);
        setBulkErrorMsg('Bulk update failed. Please try again.');
      }
    } catch (err) {
      console.error('Bulk update failed', err);
      setBulkUpdating(false);
      setBulkUpdateSuccess(false);
      setBulkErrorMsg('Bulk update failed due to an error.');
    }
  };

  const handleAddNewCategory = async () => {
    if (!newCatName.trim()) return;
    setCreatingCat(true);
    try {
      const res = await safeFetchJson<{ success: boolean; category: Category }>(
        '/api/admin/categories',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newCatName.trim() }),
        },
        null
      );
      if (res && res.category) {
        setCategories((prev) => {
          if (prev.some((c) => c.id === res.category.id)) return prev;
          return [...prev, res.category];
        });
        setCategoryId(res.category.id);
        setIsAddingNewCat(false);
        setNewCatName('');
        window.dispatchEvent(new Event('app_categories_updated'));
      }
    } catch (err) {
      console.error('Failed to create category', err);
    } finally {
      setCreatingCat(false);
    }
  };

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, setRes] = await Promise.all([
        safeFetchJson<{ products: Product[] }>('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } }, { products: [] }),
        safeFetchJson<Category[]>('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } }, []),
        safeFetchJson<WebsiteSettings | null>('/api/settings', undefined, null),
      ]);

      const prods = prodRes?.products || [];
      const seenIds = new Set<string>();
      const seenSkus = new Set<string>();
      const uniqueProds = prods.filter((p) => {
        if (!p) return false;
        const pid = (p.id || '').trim();
        const psku = (p.sku || '').trim().toUpperCase();
        if (pid && seenIds.has(pid)) return false;
        if (psku && seenSkus.has(psku)) return false;
        if (pid) seenIds.add(pid);
        if (psku) seenSkus.add(psku);
        return true;
      });
      setProducts(uniqueProds);
      // Sync local custom products cache with authoritative Supabase products
      if (typeof window !== 'undefined' && window.localStorage && uniqueProds.length > 0) {
        try {
          localStorage.setItem('app_custom_products', JSON.stringify(uniqueProds));
        } catch {}
      }
      const rawCats = Array.isArray(catRes) ? catRes : (catRes as any)?.categories || [];
      const seenCatIds = new Set<string>();
      const seenCatNames = new Set<string>();
      const uniqueCats: Category[] = [];
      for (const c of rawCats) {
        if (!c || !c.name) continue;
        const cid = c.id || c.slug;
        const cnameLower = c.name.toLowerCase().trim();
        if (cid && seenCatIds.has(cid)) continue;
        if (seenCatNames.has(cnameLower)) continue;
        if (cid) seenCatIds.add(cid);
        seenCatNames.add(cnameLower);
        uniqueCats.push(c);
      }
      setCategories(uniqueCats);
      window.dispatchEvent(new Event('app_categories_updated'));
      if (setRes) setWebsiteSettings(setRes);
      // Auto-sync any local custom products to Cloud Firestore so all browsers (Opera, Chrome, etc.) stay updated
      syncLocalCustomProductsToFirestore().catch(() => {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();

    const handleProductsRefresh = () => {
      fetchProductsAndCategories();
    };

    window.addEventListener('app_products_updated', handleProductsRefresh);
    window.addEventListener('app_sync_refresh', handleProductsRefresh);

    return () => {
      window.removeEventListener('app_products_updated', handleProductsRefresh);
      window.removeEventListener('app_sync_refresh', handleProductsRefresh);
    };
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
      'Loved by collectors! Due to high artisan demand and intricate mirror curing, please allow 5 additional days for our master artist to craft and perfect your authentic piece.'
    );
    setImages([]);
    setVariants([
      { id: `v-${Date.now()}-1`, product_id: '', size: '12 inches diameter', price: 2500, is_available: true, display_order: 1 },
    ]);
    setBadgeTag('');
    setPhotosAvailableNote('');
    setIsDrawerDirty(true);
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
    setBadgeTag(p.badge_tag || '');
    setPhotosAvailableNote(p.photos_available_note || '');
    const isLippanArt =
      p.category_slug === 'lippan-wall-hangings' ||
      (p.name || '').toLowerCase().includes('lippan') ||
      (p.sku || '').startsWith('DA-LP');
    setIsHighDemand(p.is_high_demand !== undefined ? p.is_high_demand : isLippanArt);
    setExtraDeliveryDays(p.extra_delivery_days !== undefined ? p.extra_delivery_days : 5);
    setHighDemandMessage(
      p.high_demand_message ||
        'Loved by collectors! Due to high artisan demand and intricate mirror curing, please allow 5 additional days for our master artist to craft and perfect your authentic piece.'
    );
    setImages(p?.images ? [...p?.images] : []);
    setVariants(p.variants ? [...p.variants] : []);
    setIsDrawerDirty(false);
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
      const rawFile = filesArray[i];

      try {
        // 1. Client-side compress before storing (drops 5MB-10MB photo down to ~60KB)
        const compressedFile = await compressImageFile(rawFile, 1200, 1200, 0.8);
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read image file'));
          reader.readAsDataURL(compressedFile);
        });

        const cleanSku = (sku || '').trim().toUpperCase();
        const localImgKey = `${cleanSku || 'artwork'}-${Date.now()}-${i + 1}`;

        // 2. Persist immediately into IndexedDB and Service Worker Cache API
        const localVirtualPath = await saveLocalArtworkImage(localImgKey, dataUrl, cleanSku);
        let finalPath = localVirtualPath;

        // 3. Attempt server/firestore upload in background if available
        try {
          const formData = new FormData();
          formData.append('file', compressedFile);
          formData.append('alt_text', `${name || 'Artwork'} photo`);
          if (cleanSku) {
            formData.append('sku', cleanSku);
            formData.append('product_sku', cleanSku);
          }

          const data = await safeFetchJson<any>(
            '/api/uploads',
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            },
            null
          );

          if (data && (data.success || data.file_path)) {
            finalPath = data.file_path || data.asset?.storage_path || localVirtualPath;
          }
        } catch {
          // Keep localVirtualPath - already safely persisted in local cache!
        }

        setImages((prev) => {
          // If the product only has 1 image that is a placeholder or inherited from another SKU, replace it!
          const cleanProdSku = (sku || '').trim().toUpperCase();
          const isInheritedCopiedImg =
            prev.length === 1 &&
            prev[0].storage_path &&
            cleanProdSku &&
            !prev[0].storage_path.toUpperCase().includes(cleanProdSku);

          const existingRemaining = isInheritedCopiedImg
            ? []
            : prev.map((img) => ({ ...img, is_primary: false }));

          const newImg: ProductImage = {
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            product_id: editingProduct?.id || '',
            storage_path: finalPath,
            alt_text: rawFile.name,
            display_order: 1,
            is_primary: true,
          };
          return [newImg, ...existingRemaining];
        });

        setIsDrawerDirty(true);
      } catch (err) {
        console.error('Failed to process and store image', err);
        setErrorMessage('Failed to process image file.');
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
    setIsDrawerDirty(true);
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
      setErrorMessage('Product name and unique Product Code are required.');
      return;
    }

    const cleanSku = skuVal.toUpperCase();
    const isDuplicate = products.some(
      (p) => p.sku.toUpperCase() === cleanSku && (!editingProduct || p.id !== editingProduct.id)
    );
    if (isDuplicate) {
      setErrorMessage(`Product Code "${cleanSku}" is already in use by another product. Product Code must be unique.`);
      return;
    }

    const selectedCatObj = categories.find((c) => c.id === categoryId);
    const catName = selectedCatObj ? selectedCatObj.name : (categoryId || 'Mandala Wall Hangings');
    const catSlug = selectedCatObj ? selectedCatObj.slug : (categoryId ? categoryId.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'mandala-wall-hangings');

    const payload = {
      sku: skuVal.toUpperCase(),
      name: nameVal,
      short_description: safeTrim(shortDesc),
      description: safeTrim(description),
      category_id: categoryId,
      category_name: catName,
      category_slug: catSlug,
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
      badge_tag: safeTrim(badgeTag),
      photos_available_note: safeTrim(photosAvailableNote),
      images,
      variants,
    };

    setSavingProduct(true);
    setErrorMessage('');

    try {
      const targetId = editingProduct ? editingProduct.id : `prod-${Date.now()}`;
      const now = new Date().toISOString();
      const fullPayload: Product = {
        ...payload,
        id: targetId,
        created_at: editingProduct?.created_at || now,
        updated_at: now,
      };

      // 1. Immediately guarantee persistent local storage in IndexedDB & Cache API (unaffected by Firestore quota)
      await saveLocalCustomProduct(fullPayload).catch((err) =>
        console.warn('Local custom product save notice', err)
      );

      // 2. Direct Firestore save attempt
      await saveFirestoreProduct(fullPayload).catch((err) =>
        console.warn('Direct Firestore save product error', err)
      );

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
          body: JSON.stringify(fullPayload),
        },
        fullPayload
      );

      const resultProduct = data && (data.sku || data.id) ? { ...fullPayload, ...data } : fullPayload;

      setProducts((prev) => {
        const editId = editingProduct?.id;
        const editSku = editingProduct?.sku?.toUpperCase();
        const exists = prev.some(
          (p) =>
            p.id === resultProduct.id ||
            (editId && p.id === editId) ||
            (p.sku && resultProduct.sku && p.sku.toUpperCase() === resultProduct.sku.toUpperCase()) ||
            (editSku && p.sku && p.sku.toUpperCase() === editSku)
        );
        if (exists) {
          return prev.map((p) =>
            p.id === resultProduct.id ||
            (editId && p.id === editId) ||
            (p.sku && resultProduct.sku && p.sku.toUpperCase() === resultProduct.sku.toUpperCase()) ||
            (editSku && p.sku && p.sku.toUpperCase() === editSku)
              ? resultProduct
              : p
          );
        } else {
          return [resultProduct, ...prev];
        }
      });

      setIsDrawerDirty(false);
      setDrawerOpen(false);
      await fetchProductsAndCategories();
      window.dispatchEvent(new Event('app_products_updated'));
    } catch {
      setErrorMessage('Network error while saving product.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDuplicate = async (p: Product) => {
    try {
      let res = await safeFetchJson<Product>(
        `/api/admin/products/${p.id}/duplicate`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        },
        null
      );

      if (!res || !res.sku) {
        // Direct client-side duplicate fallback
        const copySku = `${p.sku || 'DA-ART'}-COPY-${Math.floor(100 + Math.random() * 900)}`;
        const now = new Date().toISOString();
        const newId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

        res = {
          ...JSON.parse(JSON.stringify(p)),
          id: newId,
          sku: copySku,
          name: p.name.includes('(Copy)') ? p.name : `${p.name} (Copy)`,
          is_published: true,
          is_available: true,
          created_at: now,
          updated_at: now,
          images: (p.images || []).map((img, idx) => ({
            ...img,
            id: `img-${newId}-${idx + 1}`,
            product_id: newId,
          })),
          variants: (p.variants || []).map((v, idx) => ({
            ...v,
            id: `v-${newId}-${idx + 1}`,
            product_id: newId,
          })),
        };

        // Post new product to backend API to ensure server db.json is updated
        await safeFetchJson('/api/admin/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(res),
        }, res).catch(() => {});
      }

      if (res && res.sku) {
        setProducts((prev) => [res!, ...prev]);
        await saveLocalCustomProduct(res).catch(() => {});
        await saveFirestoreProduct(res).catch(() => {});
        fetchProductsAndCategories();
        window.dispatchEvent(new Event('app_products_updated'));
      }
    } catch (err) {
      console.error('Duplicate failed:', err);
    }
  };

  const handleExportLocalCache = async () => {
    try {
      const json = await exportLocalCatalogBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dotandart-artworks-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export backup', err);
    }
  };

  const handleImportLocalCache = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const res = await importLocalCatalogBackup(text);
      setBulkSuccessMsg(`🎉 Successfully imported ${res.productsCount} artwork(s) and ${res.imagesCount} image(s) from backup!`);
      setTimeout(() => setBulkSuccessMsg(''), 6000);
      fetchProductsAndCategories();
    } catch (err) {
      console.error('Failed to import backup', err);
      setBulkErrorMsg('Failed to import backup file. Please ensure it is a valid Dot And Art backup JSON.');
      setTimeout(() => setBulkErrorMsg(''), 6000);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const targetId = deleteConfirm.id;
    const targetSku = deleteConfirm.sku;
    setDeleteConfirm(null);

    // Optimistically remove from state immediately
    setProducts((prev) =>
      prev.filter(
        (p) =>
          p.id !== targetId &&
          p.sku !== targetSku &&
          p.sku.toUpperCase() !== targetSku.toUpperCase() &&
          p.id !== `prod-${targetSku.toLowerCase()}`
      )
    );

    try {
      // 1. Direct Firestore deletion (marks deleted_items and deletes docs)
      await deleteFirestoreProducts([targetId], [targetSku]).catch((err) =>
        console.warn('Firestore direct single delete warning', err)
      );

      // 2. Safe API call using POST to /delete endpoint to avoid 405 proxy blocks on DELETE method
      await safeFetchJson<any>(
        `/api/admin/products/${targetId}/delete`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        },
        { success: true }
      );

      fetchProductsAndCategories();
      window.dispatchEvent(new Event('app_products_updated'));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleQuickToggleField = async (
    p: Product,
    field: 'is_available' | 'is_published' | 'featured' | 'customizable' | 'is_high_demand',
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    const currentVal =
      p[field] !== undefined
        ? Boolean(p[field])
        : field === 'is_available' || field === 'is_published';
    const nextVal = !currentVal;

    const updatedProduct = { ...p, [field]: nextVal };

    // Optimistic update
    setProducts((prev) =>
      prev.map((item) =>
        item.id === p.id || item.sku.toUpperCase() === p.sku.toUpperCase() ? updatedProduct : item
      )
    );
    window.dispatchEvent(new Event('app_products_updated'));

    try {
      // Direct Firestore save guarantees persistence on static site
      await saveFirestoreProduct(updatedProduct).catch((err) =>
        console.warn('Firestore direct toggle warning', err)
      );

      await safeFetchJson<any>(
        `/api/admin/products/${p.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ [field]: nextVal }),
        },
        updatedProduct
      );
    } catch (err) {
      console.error(`Failed to toggle ${field}`, err);
      fetchProductsAndCategories();
    }
  };

  const handleQuickToggleAvailability = async (p: Product, e?: React.MouseEvent) => {
    return handleQuickToggleField(p, 'is_available', e);
  };

  // Filter products list
  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'all' && p.category_id !== categoryFilter && p.category_slug !== categoryFilter) {
      return false;
    }
    if (statusFilter === 'published' && !p.is_published) return false;
    if (statusFilter === 'draft' && p.is_published) return false;
    if (missingImagesOnly && !isAwaitingPhoto(p)) return false;
    if (search && search.trim()) {
      const q = search.toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchSku = (p.sku || '').toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
    }
    return true;
  });

  if (sortOrder) {
    filteredProducts.sort((a, b) => {
      const skuA = (a.sku || '').toLowerCase();
      const skuB = (b.sku || '').toLowerCase();
      if (skuA < skuB) return sortOrder === 'asc' ? -1 : 1;
      if (skuA > skuB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl font-bold text-[#2C2724]">
              Product Catalog Management
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0E6] text-[#A03E1B] text-xs font-bold border border-[#E8DACB]">
              {products.length} Active Artworks
            </span>
          </div>
          <p className="text-xs text-[#7D6B5D] mt-0.5">
            Displaying {filteredProducts.length} of {products.length} total catalog items, size variants, uploaded photos, and publication states.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Download PDF Catalog (Admin Console Exclusive) */}
          <button
            type="button"
            onClick={handleDownloadPdfCatalog}
            disabled={isGeneratingPdf || products.length === 0}
            className="px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#FAF0E6] text-[#5B331A] border border-[#D8C7B5] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            title="Download printable high-res PDF artwork catalog with watermark protection"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-4 h-4 text-[#C85A32] animate-spin" />
            ) : (
              <FileDown className="w-4 h-4 text-[#C85A32]" />
            )}
            <span>Download PDF Catalog</span>
          </button>

          {/* Export CSV Catalog */}
          <button
            type="button"
            onClick={handleExportCsvCatalog}
            disabled={products.length === 0}
            className="px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#FAF0E6] text-[#5B331A] border border-[#D8C7B5] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            title="Export catalog data to CSV spreadsheet"
          >
            <Download className="w-4 h-4 text-[#C85A32]" />
            <span>Export CSV</span>
          </button>

          {/* Export Artworks Backup (JSON with embedded local images for cross-browser sync) */}
          <button
            type="button"
            onClick={handleExportLocalCache}
            disabled={products.length === 0}
            className="px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#FAF0E6] text-[#5B331A] border border-[#D8C7B5] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            title="Download complete JSON backup with all artworks, custom details and uploaded photos to transfer across devices/browsers"
          >
            <Download className="w-4 h-4 text-[#166534]" />
            <span>Export Artworks Backup</span>
          </button>

          {/* Import Artworks Backup (Restore from JSON) */}
          <button
            type="button"
            onClick={() => backupFileInputRef.current?.click()}
            className="px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#FAF0E6] text-[#5B331A] border border-[#D8C7B5] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            title="Restore or import artworks and uploaded photos from an exported backup file"
          >
            <Upload className="w-4 h-4 text-[#166534]" />
            <span>Import Artworks Backup</span>
          </button>
          <input
            type="file"
            ref={backupFileInputRef}
            onChange={handleImportLocalCache}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => {
              setParsedRows([]);
              setBulkErrorMsg('');
              setBulkSuccessMsg('');
              setBulkModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#FAF0E6] text-[#5B331A] border border-[#D8C7B5] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#C85A32]" />
            <span>Upload CSV / Excel Catalog</span>
          </button>

          <button
            type="button"
            onClick={() => setClearCatalogModalOpen(true)}
            disabled={products.length === 0}
            className="px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            title="Remove all items and details from database"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
            <span>Clear All Catalog</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#A03E1B] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Artwork</span>
          </button>
        </div>
      </div>

      {/* PDF Generation Progress Modal */}
      {isGeneratingPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center space-y-4 border border-[#E5D7C7] shadow-2xl animate-fade-in text-[#2C2724]">
            <div className="w-12 h-12 rounded-full bg-[#C85A32]/15 text-[#C85A32] flex items-center justify-center mx-auto animate-spin">
              <Loader2 className="w-6 h-6" />
            </div>
            <h3 className="font-sans text-xl font-bold text-[#2C2724]">Generating Admin PDF Catalog</h3>
            <p className="text-xs text-[#7D6B5D] leading-relaxed">{pdfProgressText}</p>
            <div className="w-full bg-[#FAF7F2] border border-[#E5D7C7] rounded-full h-2 overflow-hidden">
              <div className="bg-[#C85A32] h-full animate-pulse w-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5D7C7] craft-shadow flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#8C7667] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or Product Code..."
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

        <span className="text-[#8C7667] text-[11px] font-medium">
          Artwork Catalog Management
        </span>
      </div>

      {/* Success Notification Banner */}
      {bulkSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-emerald-900 shadow-xs animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{bulkSuccessMsg}</span>
        </div>
      )}

      {/* Bulk Actions Bar (Appears when rows are selected) */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs animate-fade-in">
          <div className="flex items-center gap-2 font-semibold text-[#5B331A]">
            <span className="w-6 h-6 rounded-full bg-[#C85A32] text-white flex items-center justify-center font-bold text-xs">
              {selectedIds.length}
            </span>
            <span>artwork item(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBulkUpdateModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50 text-[#5B331A] border border-amber-300 font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <span>Bulk Update Columns</span>
            </button>

            <button
              type="button"
              onClick={() => setBulkDeleteModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bulk Delete Selected</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-2 rounded-xl text-[#7D6B5D] hover:bg-white/60 cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Products Table with Sticky First/Last Columns & Sticky Header */}
      <div className="bg-white rounded-2xl border border-[#E5D7C7] craft-shadow overflow-hidden">
        {/* Helper bar explaining frozen columns and scroll behavior */}
        <div className="px-4 py-2 bg-[#FAF7F2] border-b border-[#E5D7C7] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8C7667]">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>
              <strong>Scroll horizontally</strong> to review and edit all artwork fields. <strong>Photo</strong> (left) and <strong>Actions</strong> (right) stay frozen.
            </span>
          </span>
          <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#E5D7C7] font-medium text-[#5B331A]">
            ⇅ Column headers stay frozen while scrolling vertically
          </span>
        </div>

        {/* Scroll Container with defined max height for vertical scrolling */}
        <div className="overflow-auto max-h-[72vh] relative border-t border-[#E5D7C7]">
          <table className="w-full text-left text-xs border-separate border-spacing-0 min-w-max">
            <thead className="text-[#8C7667] uppercase tracking-wider font-semibold">
              <tr>
                {/* 0. Checkbox */}
                <th className="sticky left-0 top-0 z-50 bg-[#FAF7F2] px-3 py-3.5 border-b border-r border-[#E0D2C2] w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                    onChange={handleSelectAll}
                    className="rounded text-[#C85A32] cursor-pointer"
                  />
                </th>

                {/* 1. Photo (Frozen Left Column: z-40 on header) */}
                <th className="sticky left-12 top-0 z-40 bg-[#FAF7F2] px-3 py-3.5 border-b border-r border-[#E0D2C2] shadow-[2px_0_6px_-2px_rgba(0,0,0,0.08)] min-w-[104px] w-28">
                  Photo
                </th>

                {/* 2. Product Code */}
                <th
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : sortOrder === 'desc' ? null : 'asc')}
                  className="sticky top-0 z-30 bg-[#FAF7F2] px-3.5 py-3.5 border-b border-[#E5D7C7] min-w-[130px] cursor-pointer hover:bg-[#F2EAE0] transition-colors select-none"
                  title="Click to sort by Product Code"
                >
                  <div className="flex items-center gap-1.5 font-bold text-[#4A3E36]">
                    <span>Product Code</span>
                    <span className="text-[#C85A32]">
                      {sortOrder === 'asc' ? '▲' : sortOrder === 'desc' ? '▼' : '↕'}
                    </span>
                  </div>
                </th>

                {/* 3. Artwork Title */}
                <th className="sticky top-0 z-30 bg-[#FAF7F2] px-3.5 py-3.5 border-b border-[#E5D7C7] min-w-[210px]">
                  Artwork Title
                </th>

                {/* 4. Category */}
                <th className="sticky top-0 z-30 bg-[#FAF7F2] px-3.5 py-3.5 border-b border-[#E5D7C7] min-w-[140px]">
                  Category
                </th>

                {/* 5. Base Price */}
                <th className="sticky top-0 z-30 bg-[#FAF7F2] px-3.5 py-3.5 border-b border-[#E5D7C7] min-w-[125px]">
                  Base Price
                </th>

                {/* 6. Dimensions / Size */}
                <th className="sticky top-0 z-30 bg-[#FAF7F2] px-3.5 py-3.5 border-b border-[#E5D7C7] min-w-[140px]">
                  Base Size
                </th>

                {/* 7. Sizes & Variants */}
                <th className="sticky top-0 z-30 bg-[#FAF7F2] px-3.5 py-3.5 border-b border-[#E5D7C7] min-w-[180px]">
                  Sizes &amp; Variants
                </th>

                {/* 8. Framing */}
                <th className="sticky top-0 z-30 bg-[#FAF7F2] px-3.5 py-3.5 border-b border-[#E5D7C7] min-w-[140px]">
                  Framing
                </th>

                {/* 9. Availability & Badge */}
                <th className="sticky top-0 z-30 bg-[#FAF7F2] px-3.5 py-3.5 border-b border-[#E5D7C7] min-w-[205px]">
                  Availability &amp; Badge
                </th>

                {/* 10. Demand & Lead Time */}
                <th className="sticky top-0 z-30 bg-[#FAF7F2] px-3.5 py-3.5 border-b border-[#E5D7C7] min-w-[195px]">
                  Demand &amp; Lead Time
                </th>

                {/* 11. High Demand Notice */}
                <th className="sticky top-0 z-30 bg-[#FAF7F2] px-3.5 py-3.5 border-b border-[#E5D7C7] min-w-[220px]">
                  High Demand Notice
                </th>

                {/* 12. Materials Used */}
                <th className="sticky top-0 z-30 bg-[#FAF7F2] px-3.5 py-3.5 border-b border-[#E5D7C7] min-w-[185px]">
                  Materials Used
                </th>

                {/* 13. Creation Time */}
                <th className="sticky top-0 z-30 bg-[#FAF7F2] px-3.5 py-3.5 border-b border-[#E5D7C7] min-w-[130px]">
                  Creation Time
                </th>

                {/* 14. Shipping Details */}
                <th className="sticky top-0 z-30 bg-[#FAF7F2] px-3.5 py-3.5 border-b border-[#E5D7C7] min-w-[180px]">
                  Shipping Details
                </th>

                {/* 15. Care & Special */}
                <th className="sticky top-0 z-30 bg-[#FAF7F2] px-3.5 py-3.5 border-b border-[#E5D7C7] min-w-[180px]">
                  Care &amp; Special
                </th>

                {/* 16. Short Description */}
                <th className="sticky top-0 z-30 bg-[#FAF7F2] px-3.5 py-3.5 border-b border-[#E5D7C7] min-w-[200px]">
                  Short Description
                </th>

                {/* 17. Story / Full Description */}
                <th className="sticky top-0 z-30 bg-[#FAF7F2] px-3.5 py-3.5 border-b border-[#E5D7C7] min-w-[240px]">
                  Full Description
                </th>

                {/* 18. Customizable */}
                <th className="sticky top-0 z-30 bg-[#FAF7F2] px-3.5 py-3.5 border-b border-[#E5D7C7] min-w-[125px]">
                  Customizable
                </th>

                {/* 19. Featured */}
                <th className="sticky top-0 z-30 bg-[#FAF7F2] px-3.5 py-3.5 border-b border-[#E5D7C7] min-w-[115px]">
                  Featured
                </th>

                {/* 20. Status */}
                <th className="sticky top-0 z-30 bg-[#FAF7F2] px-3.5 py-3.5 border-b border-[#E5D7C7] min-w-[120px]">
                  Status
                </th>

                {/* 21. Actions (Frozen Right Column: z-40 on header) */}
                <th className="sticky right-0 top-0 z-40 bg-[#FAF7F2] px-3 py-3.5 border-b border-l border-[#E0D2C2] shadow-[-2px_0_6px_-2px_rgba(0,0,0,0.08)] min-w-[180px] w-48 text-right font-bold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EAE0]">
              {filteredProducts.map((p, index) => {
                const isLippan =
                  p.category_slug === 'lippan-wall-hangings' ||
                  (p.name || '').toLowerCase().includes('lippan') ||
                  (p.sku || '').startsWith('DA-LP');
                const isDemandHigh = p.is_high_demand !== undefined ? p.is_high_demand : isLippan;
                const primaryImg = p?.images?.find((img) => img.is_primary) || p?.images?.[0];
                const photoCount = p?.images?.length || 0;
                const variantCount = p.variants?.length || 0;

                return (
                  <tr
                    key={p.id ? `${p.id}-${index}` : `${p.sku}-${index}`}
                    className={`group hover:bg-[#FAF7F2]/80 transition-colors ${selectedIds.includes(p.id) ? 'bg-amber-50/60' : ''}`}
                  >
                    {/* 0. Checkbox */}
                    <td className="sticky left-0 z-30 bg-white group-hover:bg-[#FFF9F3] border-b border-r border-[#E0D2C2] px-3 py-3 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={(e) => handleToggleSelectProduct(p.id, e as any)}
                        className="rounded text-[#C85A32] cursor-pointer"
                      />
                    </td>

                    {/* 1. PHOTO (Frozen Column: z-20) */}
                    <td className="sticky left-12 z-20 bg-white group-hover:bg-[#FFF9F3] border-b border-r border-[#E0D2C2] shadow-[2px_0_6px_-2px_rgba(0,0,0,0.08)] px-3 py-3 w-28 min-w-[104px]">
                      <div
                        onClick={() => handleOpenEdit(p)}
                        className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#E0D2C2] bg-[#FAF7F2] group/thumb cursor-pointer shadow-xs hover:border-[#C85A32] transition-all"
                        title="Click to edit artwork photos & details"
                      >
                        <SafeProductImage
                          src={primaryImg?.storage_path || (p as any).image_url || (p as any).image_path || (p.sku ? `/static/assets/images/${p.sku}.jpg` : undefined)}
                          alt={p.name}
                          name={p.name}
                          sku={p.sku}
                          category_slug={p.category_slug}
                          size="sm"
                          className="w-full h-full object-cover"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Edit2 className="w-3.5 h-3.5" />
                        </div>
                        {/* Photo Count Pill */}
                        <div className="absolute top-0.5 right-0.5 z-10">
                          <span className={`px-1 py-0.2 rounded text-[8px] font-mono font-bold leading-none ${photoCount > 0 ? 'bg-black/75 text-white' : 'bg-[#C85A32] text-white'}`}>
                            {photoCount}
                          </span>
                        </div>
                        {/* Small Available Badge indicator */}
                        <div className="absolute bottom-0.5 left-0.5 z-10 pointer-events-none scale-65 origin-bottom-left">
                          <AvailableBadge
                            isAvailable={p.is_available !== false}
                            badgeText={p.available_badge_text}
                            unavailableText={p.unavailable_badge_text}
                            size="xs"
                          />
                        </div>
                      </div>
                    </td>

                    {/* 2. Product Code */}
                    <td className="px-3.5 py-3 border-b border-[#F2EAE0]">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="font-mono font-bold text-xs text-[#8C4A28] hover:text-[#C85A32] hover:underline cursor-pointer flex items-center gap-1 text-left"
                        title="Click to edit Product Code"
                      >
                        <span>{p.sku}</span>
                      </button>
                    </td>

                    {/* 3. ARTWORK TITLE */}
                    <td className="px-3.5 py-3 border-b border-[#F2EAE0]">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="text-left font-serif font-semibold text-xs text-[#2C2724] hover:text-[#C85A32] transition-colors cursor-pointer block line-clamp-1 max-w-[210px]"
                        title={p.name}
                      >
                        {p.name}
                      </button>

                    </td>

                    {/* 4. CATEGORY */}
                    <td className="px-3.5 py-3 border-b border-[#F2EAE0] whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF0E6] text-[#5B331A] text-[11px] font-medium border border-[#E8DACB]">
                        <Tag className="w-3 h-3 text-[#A03E1B]" />
                        <span>{p.category_name || (categories || []).find((c) => c.id === p.category_id)?.name || 'Mandala Art'}</span>
                      </span>
                    </td>

                    {/* 5. BASE PRICE */}
                    <td className="px-3.5 py-3 border-b border-[#F2EAE0] whitespace-nowrap">
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-sm text-[#A03E1B]">
                          ₹{p.base_price?.toLocaleString('en-IN') || 0}
                        </span>
                        {variantCount > 0 && (
                          <span className="text-[10px] text-[#8C7667] font-medium">
                            +{variantCount} size options
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 6. DIMENSIONS / SIZE */}
                    <td className="px-3.5 py-3 border-b border-[#F2EAE0] whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="text-xs text-[#5B331A] font-medium bg-[#FAF7F2] px-2 py-1 rounded-md border border-[#E5D7C7] hover:border-[#C85A32] cursor-pointer text-left"
                        title="Click to edit dimensions"
                      >
                        {p.base_size || 'Standard Size'}
                      </button>
                    </td>

                    {/* 7. SIZES & VARIANTS */}
                    <td className="px-3.5 py-3 border-b border-[#F2EAE0]">
                      <div className="flex flex-wrap items-center gap-1 max-w-[180px]">
                        {variantCount === 0 ? (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="text-[10px] text-[#8C7667] italic hover:text-[#C85A32] cursor-pointer"
                          >
                            + Add custom sizes
                          </button>
                        ) : (
                          p.variants?.slice(0, 2).map((v) => (
                            <span
                              key={v.id}
                              className="px-1.5 py-0.5 rounded bg-[#FAF7F2] text-[#5B331A] text-[10px] font-mono border border-[#E5D7C7]"
                              title={`${v.size} — ₹${v.price.toLocaleString('en-IN')}`}
                            >
                              {v.size.split(' ')[0]}: ₹{v.price}
                            </span>
                          ))
                        )}
                        {variantCount > 2 && (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="text-[10px] text-[#C85A32] font-semibold hover:underline cursor-pointer"
                          >
                            +{variantCount - 2} more
                          </button>
                        )}
                      </div>
                    </td>

                    {/* 8. FRAMING */}
                    <td className="px-3.5 py-3 border-b border-[#F2EAE0]">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="text-left text-xs text-[#5B331A] hover:text-[#C85A32] transition-colors cursor-pointer truncate max-w-[130px] block"
                        title={p.framing || 'Click to edit framing'}
                      >
                        {p.framing || <span className="text-[#8C7667] italic">Frameless / MDF Rim</span>}
                      </button>
                    </td>

                    {/* 9. AVAILABILITY & BADGE */}
                    <td className="px-3.5 py-3 border-b border-[#F2EAE0]">
                      <div className="flex flex-col gap-1 items-start">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleQuickToggleField(p, 'is_available', e)}
                            className="transition-transform hover:scale-105 active:scale-95 cursor-pointer text-left"
                            title="Click to toggle Available / Made to Order instantly"
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
                            title="Edit badge label text & options in drawer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[10px] text-[#8C7667] font-mono truncate max-w-[180px]">
                          Label: &ldquo;{p.is_available !== false ? (p.available_badge_text || 'Available') : (p.unavailable_badge_text || 'Made to Order')}&rdquo;
                        </span>
                      </div>
                    </td>

                    {/* 10. DEMAND & LEAD TIME */}
                    <td className="px-3.5 py-3 border-b border-[#F2EAE0]">
                      <div className="flex flex-col gap-1 items-start">
                        <button
                          type="button"
                          onClick={(e) => handleQuickToggleField(p, 'is_high_demand', e)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 hover:scale-105 ${
                            isDemandHigh
                              ? 'bg-orange-100 text-orange-800 border-orange-300 shadow-2xs'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-orange-50 hover:text-orange-700'
                          }`}
                          title="Click to toggle High Demand status"
                        >
                          <Flame className={`w-3 h-3 ${isDemandHigh ? 'text-orange-600 fill-orange-500' : 'text-slate-400'}`} />
                          <span>{isDemandHigh ? `High Demand (+${p.extra_delivery_days ?? 5}d)` : 'Standard Lead'}</span>
                        </button>
                      </div>
                    </td>

                    {/* 11. HIGH DEMAND NOTICE */}
                    <td className="px-3.5 py-3 border-b border-[#F2EAE0]">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="text-left text-[11px] text-[#7D6B5D] hover:text-[#C85A32] transition-colors cursor-pointer line-clamp-2 max-w-[210px] block"
                        title={p.high_demand_message || 'Click to edit collector notice message'}
                      >
                        {p.high_demand_message || <span className="text-[#8C7667] italic">Default collector notice applied</span>}
                      </button>
                    </td>

                    {/* 12. MATERIALS USED */}
                    <td className="px-3.5 py-3 border-b border-[#F2EAE0]">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="text-left text-xs text-[#5B331A] hover:text-[#C85A32] transition-colors cursor-pointer line-clamp-1 max-w-[170px]"
                        title={p.material || 'Click to set materials'}
                      >
                        {p.material || <span className="text-[#8C7667] italic">Not specified</span>}
                      </button>
                    </td>

                    {/* 13. CREATION TIME */}
                    <td className="px-3.5 py-3 border-b border-[#F2EAE0] whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="inline-flex items-center gap-1 text-xs text-[#5B331A] hover:text-[#C85A32] cursor-pointer"
                        title="Click to edit creation duration"
                      >
                        <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
                        <span>{p.creation_time || '8 Days'}</span>
                      </button>
                    </td>

                    {/* 14. SHIPPING DETAILS */}
                    <td className="px-3.5 py-3 border-b border-[#F2EAE0]">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="text-xs text-[#5B331A] hover:text-[#C85A32] inline-flex items-center gap-1 line-clamp-1 max-w-[170px] text-left cursor-pointer"
                        title={p.shipping_info || 'Click to edit shipping instructions'}
                      >
                        <Truck className="w-3.5 h-3.5 text-[#8C7667] shrink-0" />
                        <span className="truncate">{p.shipping_info || 'Worldwide'}</span>
                      </button>
                    </td>

                    {/* 15. CARE & SPECIAL INSTRUCTIONS */}
                    <td className="px-3.5 py-3 border-b border-[#F2EAE0]">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="text-left text-xs text-[#5B331A] hover:text-[#C85A32] transition-colors cursor-pointer line-clamp-1 max-w-[170px]"
                        title={p.special_information || 'Click to set care instructions'}
                      >
                        {p.special_information || <span className="text-[#8C7667] italic">Standard art care</span>}
                      </button>
                    </td>

                    {/* 16. SHORT DESCRIPTION */}
                    <td className="px-3.5 py-3 border-b border-[#F2EAE0]">
                      <p
                        className="text-xs text-[#7D6B5D] line-clamp-2 max-w-[190px] cursor-pointer hover:text-[#2C2724]"
                        onClick={() => handleOpenEdit(p)}
                        title={p.short_description || 'Click to edit short description'}
                      >
                        {p.short_description || <span className="italic text-[#8C7667]">No short description</span>}
                      </p>
                    </td>

                    {/* 17. STORY / FULL DESCRIPTION */}
                    <td className="px-3.5 py-3 border-b border-[#F2EAE0]">
                      <p
                        className="text-xs text-[#7D6B5D] line-clamp-2 max-w-[230px] cursor-pointer hover:text-[#2C2724]"
                        onClick={() => handleOpenEdit(p)}
                        title={p.description || 'Click to edit narrative description'}
                      >
                        {p.description || <span className="italic text-[#8C7667]">No full description</span>}
                      </p>
                    </td>

                    {/* 18. CUSTOMIZABLE TOGGLE */}
                    <td className="px-3.5 py-3 border-b border-[#F2EAE0] whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => handleQuickToggleField(p, 'customizable', e)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer hover:scale-105 ${
                          p.customizable
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                        title="Click to toggle customizable upon request"
                      >
                        {p.customizable ? 'Yes' : 'Standard'}
                      </button>
                    </td>

                    {/* 19. FEATURED TOGGLE */}
                    <td className="px-3.5 py-3 border-b border-[#F2EAE0] whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => handleQuickToggleField(p, 'featured', e)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer hover:scale-105 flex items-center gap-1 ${
                          p.featured
                            ? 'bg-amber-400 text-black border-amber-500 font-bold shadow-2xs'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                        title="Click to toggle featured on home page"
                      >
                        <Check className="w-3 h-3 text-amber-950" />
                        <span>{p.featured ? 'Featured' : 'Regular'}</span>
                      </button>
                    </td>

                    {/* 20. PUBLISH STATUS TOGGLE */}
                    <td className="px-3.5 py-3 border-b border-[#F2EAE0] whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => handleQuickToggleField(p, 'is_published', e)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer hover:scale-105 ${
                          p.is_published
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-stone-200 text-stone-700 border-stone-300'
                        }`}
                        title="Click to toggle Published / Draft status"
                      >
                        {p.is_published ? '● Published' : '○ Draft'}
                      </button>
                    </td>

                    {/* 21. ACTIONS (Frozen Last Column: z-20) */}
                    <td className="sticky right-0 z-20 bg-white group-hover:bg-[#FFF9F3] border-b border-l border-[#E0D2C2] shadow-[-2px_0_6px_-2px_rgba(0,0,0,0.08)] px-3 py-3 w-48 min-w-[180px] text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => onPreviewProduct(p.sku)}
                        className="p-1.5 rounded-lg text-[#5B331A] hover:bg-[#FAF0E6] cursor-pointer"
                        title="Preview Public Page"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg bg-[#FAF0E6] text-[#A03E1B] hover:bg-[#F3ECE2] font-semibold text-xs inline-flex items-center gap-1 cursor-pointer border border-[#E0D2C2]"
                        title="Edit Artwork in Full Drawer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDuplicate(p)}
                        className="p-1.5 rounded-lg text-[#5B331A] hover:bg-[#FAF0E6] cursor-pointer"
                        title="Duplicate Product"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(p)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
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

            <form onSubmit={handleSaveProduct} onChange={() => setIsDrawerDirty(true)} className="space-y-6 text-xs">
              {/* Basic Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-[#8C4A28] uppercase tracking-wider">
                  1. Title, Product Code & Category
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
                    <label className="block font-semibold text-[#4A3E36] mb-1">Unique Product Code *</label>
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-[#4A3E36]">Category *</label>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                        className="text-xs text-theme-accent hover:underline font-semibold cursor-pointer"
                      >
                        {isAddingNewCat ? 'Choose Existing' : '+ Add New Category'}
                      </button>
                    </div>

                    {!isAddingNewCat ? (
                      <select
                        value={categoryId}
                        onChange={(e) => {
                          if (e.target.value === '__NEW__') {
                            setIsAddingNewCat(true);
                          } else {
                            setCategoryId(e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] text-[#2C2724] border border-[#D8C7B5]"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                        <option value="__NEW__">+ Add New Category (Free Text)...</option>
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type category name (e.g. Coasters, Bookmarks)..."
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] text-[#2C2724] border border-[#D8C7B5] text-xs"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNewCategory();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddNewCategory}
                          disabled={creatingCat || !newCatName.trim()}
                          className="px-3 py-2 rounded-xl bg-theme-accent text-white font-semibold text-xs hover:opacity-90 disabled:opacity-50 cursor-pointer"
                        >
                          {creatingCat ? 'Adding...' : 'Add'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewCat(false);
                            setNewCatName('');
                          }}
                          className="px-2.5 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
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
                          category_slug={(categories || []).find(c => c.id === categoryId)?.slug}
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
                            category_slug={(categories || []).find((c) => c.id === categoryId)?.slug}
                            size="sm"
                            className="w-full h-full"
                          />
                          {/* Live Badge Overlay */}
                          {showAvailableBadge && (
                            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-mono text-white/90 border border-white/20">
                                {sku || 'Product Code'}
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

                  {/* Custom Promotional Badge Tag */}
                  <div className="p-4 rounded-xl bg-white border border-[#E3D4C4] space-y-2">
                    <label className="block font-semibold text-[#4A3E36] text-xs">
                      Promotional Badge Tag (e.g. Featured, Bestseller, New Arrival, Limited Edition)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        value={badgeTag}
                        onChange={(e) => {
                          setBadgeTag(e.target.value);
                          setIsDrawerDirty(true);
                        }}
                        placeholder="e.g. Bestseller, Masterpiece, New Arrival..."
                        className="flex-1 min-w-[180px] px-3 py-2 rounded-xl bg-[#FAF7F2] text-[#2C2724] border border-[#D8C7B5]"
                      />
                      {['Bestseller', 'New Arrival', 'Masterpiece', 'Limited Edition'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setBadgeTag(tag);
                            setIsDrawerDirty(true);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border cursor-pointer ${
                            badgeTag === tag ? 'bg-[#C85A32] text-white border-[#C85A32]' : 'bg-[#FAF0E6] text-[#A03E1B] border-[#E8DACB]'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
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
                          placeholder="e.g. Loved by collectors! Due to high artisan demand and intricate mirror curing, please allow 5 additional days for our master artist to craft and perfect your authentic piece."
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
              <div className="pt-6 border-t border-[#F0E5D8] flex items-center justify-between">
                <span className="text-[11px] text-[#8C7667]">
                  {!editingProduct
                    ? 'Enter artwork details and save to catalog'
                    : (isDrawerDirty ? 'Unsaved edits detected' : 'All changes saved to database')}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-[#D4A373] text-[#5B331A] cursor-pointer hover:bg-[#FAF7F2]"
                  >
                    Close
                  </button>
                  {(() => {
                    const canSave = Boolean(name.trim() && sku.trim()) && !savingProduct;
                    return (
                      <button
                        type="submit"
                        disabled={!canSave}
                        className={`px-6 py-2.5 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-all ${
                          !canSave
                            ? 'bg-stone-500/20 text-stone-400 cursor-not-allowed border border-[#D8C7B5]'
                            : 'bg-[#C85A32] hover:bg-[#A03E1B] text-white cursor-pointer shadow-md transform hover:-translate-y-0.5'
                        }`}
                        title={!canSave ? 'Please enter artwork name and Product Code' : 'Click to save artwork to database'}
                      >
                        {savingProduct ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving to Cloud...</span>
                          </>
                        ) : !canSave && editingProduct && !isDrawerDirty ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>{editingProduct ? 'Save Artwork' : 'Create Artwork'}</span>
                          </>
                        )}
                      </button>
                    );
                  })()}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV / Excel Catalog Import Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="max-w-2xl w-full bg-white rounded-3xl border border-[#E3D4C4] craft-shadow p-6 space-y-5 text-xs my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3D4C4]">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-orange-100 text-[#C85A32]">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#2C2724]">
                    Upload Product Catalog CSV / Excel
                  </h3>
                  <p className="text-[11px] text-[#7D6B5D]">
                    Upload a CSV or Excel spreadsheet to generate product catalog items without images.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="p-1.5 rounded-lg text-[#7D6B5D] hover:bg-[#FAF0E6] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification Messages */}
            {bulkSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium flex items-center gap-2 text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{bulkSuccessMsg}</span>
              </div>
            )}

            {bulkErrorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 font-medium flex items-center gap-2 text-xs">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{bulkErrorMsg}</span>
              </div>
            )}

            {/* Template Download & File Picker */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7]">
                <div>
                  <h4 className="font-bold text-[#5B331A] text-xs">Need a sample template?</h4>
                  <p className="text-[11px] text-[#8C7667]">
                    Download our sample CSV file with standard column headers (Product Code, Name, Category, Price, Size, Material, Description).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF0E6] text-[#A03E1B] border border-[#D8C7B5] font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV</span>
                </button>
              </div>

              {/* Upload Box */}
              <div className="border-2 border-dashed border-[#D4A373] hover:border-[#C85A32] rounded-2xl p-6 bg-[#FFFBF7] text-center space-y-3 transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleBulkFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF0E6] group-hover:bg-[#F5E6D8] flex items-center justify-center text-[#C85A32] transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-[#2C2724] text-xs">
                    Click or drag & drop CSV or Excel file (.csv, .xlsx)
                  </p>
                  <p className="text-[11px] text-[#8C7667] mt-0.5">
                    Supports up to hundreds of rows per import
                  </p>
                </div>
              </div>

              {/* Parsed Preview Table */}
              {parsedRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#5B331A]">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-[#C85A32]" />
                      <span>{parsedRows.length} Product(s) Ready to Import</span>
                    </span>
                    <span className="text-[11px] font-normal text-[#8C7667]">
                      Items will be created without images. You can attach photos for each item after import.
                    </span>
                  </div>

                  <div className="max-h-56 overflow-auto border border-[#E5D7C7] rounded-xl bg-white">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-[#FAF7F2] text-[#8C7667] font-bold sticky top-0 border-b border-[#E5D7C7]">
                        <tr>
                          <th className="px-3 py-2">#</th>
                          <th className="px-3 py-2">Product Code</th>
                          <th className="px-3 py-2">Title / Name</th>
                          <th className="px-3 py-2">Category</th>
                          <th className="px-3 py-2">Price</th>
                          <th className="px-3 py-2">Size</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F2EAE0]">
                        {parsedRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-[#FAF7F2]/60">
                            <td className="px-3 py-2 text-[#8C7667]">{idx + 1}</td>
                            <td className="px-3 py-2 font-mono font-bold text-[#A03E1B]">
                              {row.sku || <span className="text-gray-400 italic">Auto-Generated</span>}
                            </td>
                            <td className="px-3 py-2 font-semibold text-[#2C2724]">{row.name || 'Untitled Artwork'}</td>
                            <td className="px-3 py-2 text-[#5B331A]">{row.category_name || 'Mandala Wall Hangings'}</td>
                            <td className="px-3 py-2 font-bold text-[#C85A32]">₹{row.base_price || 2400}</td>
                            <td className="px-3 py-2 text-[#7D6B5D]">{row.base_size || '12 inches'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-[#F0E5D8] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#D4A373] text-[#5B331A] hover:bg-[#FAF0E6]"
              >
                Close
              </button>

              {parsedRows.length > 0 && (
                <button
                  type="button"
                  disabled={bulkImporting}
                  onClick={handleExecuteBulkImport}
                  className="px-5 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#A03E1B] text-white font-bold flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>
                    {bulkImporting ? 'Importing Products...' : `Import ${parsedRows.length} Product(s) into Catalog`}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Update Columns Modal */}
      {bulkUpdateModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#E3D4C4] craft-shadow p-6 space-y-4 text-xs">
            <h3 className="font-serif text-lg font-bold text-[#2C2724] flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#C85A32]" />
              <span>Bulk Update {selectedIds.length} Selected Artwork(s)</span>
            </h3>
            <p className="text-[#7D6B5D]">
              Choose which column to update and enter the new value to apply across all selected items.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block font-semibold text-[#5B331A] mb-1">Select Field to Update</label>
                <select
                  value={bulkField}
                  onChange={(e) => {
                    setBulkField(e.target.value);
                    setBulkValue('');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8C7B5] text-[#2C2724] font-medium"
                >
                  <option value="base_price">Base Price (₹)</option>
                  <option value="name">Artwork Title</option>
                  <option value="category_id">Category</option>
                  <option value="base_size">Base Size / Dimensions</option>
                  <option value="framing">Framing Details</option>
                  <option value="material">Materials Used</option>
                  <option value="creation_time">Creation Time / Lead Time</option>
                  <option value="shipping_info">Shipping Details</option>
                  <option value="special_information">Care & Special Information</option>
                  <option value="short_description">Short Description</option>
                  <option value="description">Full Description</option>
                  <option value="high_demand_message">High Demand Notice</option>
                  <option value="available_badge_text">Available Badge Text</option>
                  <option value="is_published">Publish Status (Published / Draft)</option>
                  <option value="is_available">Availability Status (Available / Made to Order)</option>
                  <option value="featured">Featured on Homepage</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#5B331A] mb-1">New Value</label>
                {bulkField === 'category_id' ? (
                  <div className="space-y-2">
                    <select
                      value={categories.some((c) => c.id === bulkValue || c.name === bulkValue) ? bulkValue : '__custom__'}
                      onChange={(e) => {
                        if (e.target.value !== '__custom__') {
                          setBulkValue(e.target.value);
                        } else {
                          setBulkValue('');
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8C7B5] text-[#2C2724]"
                    >
                      <option value="">Select Existing Category...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                      <option value="__custom__">+ Type New Category Name...</option>
                    </select>

                    {(!categories.some((c) => c.id === bulkValue || c.name === bulkValue) || bulkValue === '' || categories.every(c => c.name !== bulkValue)) && (
                      <input
                        type="text"
                        placeholder="Enter new category name..."
                        value={bulkValue}
                        onChange={(e) => setBulkValue(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#C85A32] text-[#2C2724] font-medium"
                      />
                    )}
                  </div>
                ) : bulkField === 'is_published' || bulkField === 'is_available' || bulkField === 'featured' ? (
                  <select
                    value={bulkValue}
                    onChange={(e) => setBulkValue(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8C7B5] text-[#2C2724]"
                  >
                    <option value="">Select Option...</option>
                    <option value="true">Yes / True / Published</option>
                    <option value="false">No / False / Draft</option>
                  </select>
                ) : (
                  <input
                    type={bulkField === 'base_price' ? 'number' : 'text'}
                    placeholder={bulkField === 'base_price' ? 'e.g. 2900' : 'Enter new value...'}
                    value={bulkValue}
                    onChange={(e) => setBulkValue(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8C7B5] text-[#2C2724]"
                  />
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-[#F0E5D8]">
              <button
                type="button"
                onClick={() => setBulkUpdateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#D4A373] text-[#5B331A]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={bulkUpdating || bulkUpdateSuccess || !bulkValue.trim()}
                onClick={handleExecuteBulkUpdate}
                className={`px-5 py-2 rounded-xl text-white font-semibold disabled:opacity-50 cursor-pointer transition-colors ${
                  bulkUpdateSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#C85A32] hover:bg-[#A03E1B]'
                }`}
              >
                {bulkUpdating
                  ? 'Updating...'
                  : bulkUpdateSuccess
                  ? 'Updated Successfully! 🎉'
                  : `Update ${selectedIds.length} Item(s)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#E3D4C4] craft-shadow p-6 space-y-4 text-xs">
            <h3 className="font-serif text-lg font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Delete {selectedIds.length} Selected Artwork(s)?</span>
            </h3>
            <p className="text-[#66574D]">
              This will permanently remove <strong>{selectedIds.length}</strong> selected artwork items from your catalog. This action cannot be reversed.
            </p>
            <div className="pt-4 flex justify-end gap-3 border-t border-[#F0E5D8]">
              <button
                type="button"
                onClick={() => setBulkDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#D4A373] text-[#5B331A]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={bulkDeleting}
                onClick={handleExecuteBulkDelete}
                className="px-5 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {bulkDeleting ? 'Deleting...' : `Delete ${selectedIds.length} Item(s)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#E3D4C4] craft-shadow p-6 space-y-4 text-xs">
            <h3 className="font-serif text-lg font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Delete Artwork &quot;{deleteConfirm.name}&quot;?</span>
            </h3>
            <p className="text-[#66574D]">
              This will remove artwork with Product Code <strong>{deleteConfirm.sku}</strong> from your catalog. This action cannot be reversed.
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

      {/* Clear All Catalog Confirmation Dialog Box */}
      {clearCatalogModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="max-w-md w-full bg-white rounded-3xl border border-red-200 craft-shadow p-6 space-y-5 text-xs shadow-2xl">
            <div className="flex items-center gap-3 border-b border-red-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-red-700">
                  Clear Entire Product Catalog?
                </h3>
                <p className="text-[11px] text-[#7D6B5D]">
                  Product Catalog Management Admin Console
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 space-y-2 text-[#5B331A]">
              <p className="font-semibold text-red-900 text-xs">
                ⚠️ Are you sure you want to delete the whole catalog?
              </p>
              <p className="text-[11px] leading-relaxed text-red-800">
                This will permanently delete all <strong>{products.length}</strong> items and artwork details from the database. <strong>The action won&apos;t be reversible once done.</strong>
              </p>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F0E5D8]">
              <button
                type="button"
                onClick={() => setClearCatalogModalOpen(false)}
                disabled={clearingCatalog}
                className="px-5 py-2.5 rounded-xl border border-[#D4A373] text-[#5B331A] font-semibold hover:bg-[#FAF0E6] cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={clearingCatalog}
                onClick={handleConfirmClearCatalog}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {clearingCatalog ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Clearing Catalog...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>OK</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
