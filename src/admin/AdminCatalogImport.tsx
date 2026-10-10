import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, RefreshCw, Sparkles, Database } from 'lucide-react';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../data/initialCatalog';
import { ImportReport } from '../types';
import { safeResponseJson } from '../lib/safeFetch';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface AdminCatalogImportProps {
  token: string;
}

export const AdminCatalogImport: React.FC<AdminCatalogImportProps> = ({ token }) => {
  const [importing, setImporting] = useState(false);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [csvContent, setCsvContent] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // 1. Run Idempotent Sync of the initial workbook products
  const handleSyncOriginalCatalog = async () => {
    setImporting(true);
    setStatusMsg('Running idempotent catalog synchronization for all catalog products...');

    try {
      const res = await fetch('/api/admin/import-catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: INITIAL_PRODUCTS }),
      });

      const data = await safeResponseJson(res, {});
      if (res.ok) {
        setReport(data);
        setStatusMsg('Catalog products processed successfully.');
      } else {
        setStatusMsg(data?.error || 'Sync failed.');
      }
    } catch {
      setStatusMsg('Network error while running catalog sync.');
    } finally {
      setImporting(false);
    }
  };

  // 2. Upload catalog and images to Firebase Firestore
  const handleFirebaseUpload = async () => {
    setImporting(true);
    setStatusMsg('Uploading all products, categories, and image assets to Firebase Firestore with proper table structure...');

    try {
      // Upload categories
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }

      // Upload products & media assets
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
        for (const img of prod.images) {
          await setDoc(doc(db, 'media_assets', img.id), {
            id: img.id,
            storage_path: img.storage_path,
            media_type: 'image',
            filename: img.storage_path.split('/').pop() || '',
            title: img.alt_text,
            created_at: new Date().toISOString(),
          });
        }
      }

      setStatusMsg(`Successfully uploaded ${INITIAL_CATEGORIES.length} categories, ${INITIAL_PRODUCTS.length} products, and all image assets to Firebase Firestore tables!`);
    } catch (err: any) {
      setStatusMsg(`Firebase upload error: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  // 2B. Sync local images folder with database & products
  const handleSyncImagesDB = async () => {
    setImporting(true);
    setStatusMsg('Synchronizing public/static/assets/images folder with database products and media assets...');

    try {
      const res = await fetch('/api/admin/sync-images-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await safeResponseJson(res, {});
      if (res.ok) {
        setStatusMsg(data?.message || 'Images folder and database synchronized successfully.');
      } else {
        setStatusMsg(data?.error || 'Image synchronization failed.');
      }
    } catch (err: any) {
      setStatusMsg(`Network error during image sync: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  // 2. Parse and import custom CSV input
  const handleImportCSV = async () => {
    if (!csvContent.trim()) {
      setStatusMsg('Please paste CSV rows or select a file first.');
      return;
    }

    setImporting(true);
    setStatusMsg('Parsing CSV and importing items idempotently...');

    try {
      const lines = csvContent.trim().split('\n');
      if (lines.length < 2) {
        setStatusMsg('CSV must contain a header row and at least one data row.');
        setImporting(false);
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
      const items: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const vals = line.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
        const row: Record<string, any> = {};
        headers.forEach((h, idx) => {
          row[h] = vals[idx] || '';
        });
        items.push(row);
      }

      const res = await fetch('/api/admin/import-catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items }),
      });

      const data = await safeResponseJson(res, {});
      if (res.ok) {
        setReport(data);
        setStatusMsg(`Import completed: ${items.length} records processed.`);
      } else {
        setStatusMsg(data?.error || 'Import failed.');
      }
    } catch (err: any) {
      setStatusMsg(`Parsing error: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      setStatusMsg(`Loaded ${file.name} (${text.split('\n').length} lines). Click "Import Pasted CSV" to proceed.`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#2C2724]">
          Product Catalog Importer & Synchronizer
        </h2>
        <p className="text-xs text-[#7D6B5D]">
          Idempotent data import preserving original unique product codes (SKUs), sizes, and prices. Re-running will update existing items without duplicating.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-[#FAF0E6] border border-[#E0D2C2] text-xs text-[#5B331A] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C85A32]" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Option 1: Re-Sync Original Catalog Items */}
      <div className="p-6 rounded-3xl bg-white border border-[#E3D4C4] craft-shadow space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF0E6] text-[#C85A32] flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#2C2724]">
              Workbook Catalog Quick Sync
            </h3>
            <p className="text-xs text-[#7D6B5D]">
              Synchronize the catalog from the Excel workbook (Mandala & Lippan Wall Hangings) with accurate sizes and INR pricing.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            disabled={importing}
            onClick={handleSyncOriginalCatalog}
            className="px-6 py-3 rounded-full bg-[#C85A32] hover:bg-[#A03E1B] text-white text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${importing ? 'animate-spin' : ''}`} />
            <span>{importing ? 'Synchronizing...' : 'Run Idempotent Product Sync'}</span>
          </button>
        </div>
      </div>

      {/* Option 1B: Upload to Firebase Firestore */}
      <div className="p-6 rounded-3xl bg-white border border-[#E3D4C4] craft-shadow space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF0E6] text-[#C85A32] flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#2C2724]">
              Upload Catalog & Images to Firebase Firestore
            </h3>
            <p className="text-xs text-[#7D6B5D]">
              Upload all products, categories, and image assets to Firebase Firestore tables (<code className="bg-[#FAF7F2] px-1 py-0.5 rounded">categories</code>, <code className="bg-[#FAF7F2] px-1 py-0.5 rounded">products</code>, <code className="bg-[#FAF7F2] px-1 py-0.5 rounded">media_assets</code>).
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            disabled={importing}
            onClick={handleFirebaseUpload}
            className="px-6 py-3 rounded-full bg-[#2C2724] hover:bg-[#4A3E36] text-white text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center gap-2"
          >
            <Database className={`w-4 h-4 ${importing ? 'animate-spin' : ''}`} />
            <span>{importing ? 'Uploading to Firebase...' : 'Upload Catalog & Images to Firebase'}</span>
          </button>
        </div>
      </div>

      {/* Option 1C: Sync Images Folder with Database & Firebase */}
      <div className="p-6 rounded-3xl bg-white border border-[#E3D4C4] craft-shadow space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF0E6] text-[#C85A32] flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#2C2724]">
              Sync Local Images Folder with Database & Products
            </h3>
            <p className="text-xs text-[#7D6B5D]">
              Scan <code className="bg-[#FAF7F2] px-1 py-0.5 rounded">public/static/assets/images</code> folder and synchronize image assets with all product catalog records so correct images load from database.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            disabled={importing}
            onClick={handleSyncImagesDB}
            className="px-6 py-3 rounded-full bg-[#C85A32] hover:bg-[#A03E1B] text-white text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${importing ? 'animate-spin' : ''}`} />
            <span>{importing ? 'Synchronizing Images...' : 'Sync Local Images Folder & Database'}</span>
          </button>
        </div>
      </div>

      {/* Option 2: Upload or Paste CSV */}
      <div className="p-6 rounded-3xl bg-white border border-[#E3D4C4] craft-shadow space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF0E6] text-[#C85A32] flex items-center justify-center shrink-0">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#2C2724]">
              Upload CSV or Excel Export
            </h3>
            <p className="text-xs text-[#7D6B5D]">
              Headers supported: <code className="bg-[#FAF7F2] px-1 py-0.5 rounded">Product Code, Product Name, Price, Sizes, Material, Framing, Creation Time, Shipping, Description</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="cursor-pointer px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F3ECE2] border border-[#D8C7B5] text-xs font-semibold text-[#5B331A]">
            Choose CSV File
            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <div>
          <textarea
            rows={5}
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            placeholder={`Product Code,Product Name,Price,Sizes,Material,Description\nDNA-MAN-001,Surya Mandala Wall Hanging,2400,12 inches,MDF Wood,Radiant solar mandala...`}
            className="w-full text-xs font-mono p-3 rounded-xl bg-[#FAF7F2] border border-[#D8C7B5] text-[#2C2724] focus:outline-none"
          />
        </div>

        <button
          type="button"
          disabled={importing || !csvContent.trim()}
          onClick={handleImportCSV}
          className="px-6 py-2.5 rounded-full bg-[#2C2724] hover:bg-[#4A3E36] text-white text-xs font-semibold shadow-xs disabled:opacity-50"
        >
          Import Pasted CSV
        </button>
      </div>

      {/* Import Audit Report */}
      {report && (
        <div className="p-6 rounded-3xl bg-white border border-[#E3D4C4] craft-shadow space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-[#F0E5D8] pb-3">
            <h3 className="font-serif text-lg font-bold text-[#2C2724]">
              Idempotent Import Report
            </h3>
            <span className="text-[#8C7667]">
              Total Processed: <strong>{report.total_processed}</strong>
            </span>
          </div>

          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-xl bg-green-50 border border-green-200">
              <span className="text-xl font-bold text-green-700 block">{report.inserted}</span>
              <span className="text-green-800 text-[11px]">Inserted</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-xl font-bold text-blue-700 block">{report.updated}</span>
              <span className="text-blue-800 text-[11px]">Updated</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-xl font-bold text-gray-700 block">{report.skipped}</span>
              <span className="text-gray-800 text-[11px]">Skipped</span>
            </div>
            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
              <span className="text-xl font-bold text-red-700 block">{report.failed}</span>
              <span className="text-red-800 text-[11px]">Failed</span>
            </div>
          </div>

          {report.details && report.details.length > 0 && (
            <div className="max-h-60 overflow-y-auto divide-y divide-[#F2EAE0] border border-[#E8DFD5] rounded-xl p-2 font-mono text-[11px]">
              {report.details.map((d, i) => (
                <div key={i} className="py-1.5 px-2 flex items-center justify-between">
                  <span>
                    <strong>{d.sku}</strong> — {d.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      d.status === 'inserted'
                        ? 'bg-green-100 text-green-800'
                        : d.status === 'updated'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {d.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
