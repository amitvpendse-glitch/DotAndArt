import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Image as ImageIcon, Video, Copy, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import { MediaAsset } from '../types';
import { safeFetchJson, safeResponseJson } from '../lib/safeFetch';
import { db } from '../lib/firebase';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';

interface AdminMediaLibraryProps {
  token: string;
}

export const AdminMediaLibrary: React.FC<AdminMediaLibraryProps> = ({ token }) => {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [syncingFolder, setSyncingFolder] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [deletingFirebase, setDeletingFirebase] = useState(false);

  const handleSyncFolder = async () => {
    setSyncingFolder(true);
    setErrorMsg('');
    setSyncSuccessMsg('');
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
        setSyncSuccessMsg(data.message || `Successfully synced ${data.media_count || 0} images with products.`);
        fetchMedia();
        setTimeout(() => setSyncSuccessMsg(''), 5000);
      } else {
        setErrorMsg(data.error || 'Failed to sync images with database.');
      }
    } catch (err: any) {
      setErrorMsg(`Sync request error: ${err.message}`);
    } finally {
      setSyncingFolder(false);
    }
  };

  const handleDeleteFirebaseImages = async () => {
    if (!window.confirm("Are you sure you want to delete all image assets from Firebase Firestore?")) return;
    setDeletingFirebase(true);
    setErrorMsg('');
    try {
      const querySnapshot = await getDocs(collection(db, 'media_assets'));
      const deletePromises = querySnapshot.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      setErrorMsg('');
      alert('Successfully deleted all image assets from Firebase!');
      fetchMedia();
    } catch (err: any) {
      setErrorMsg(`Failed to delete images from Firebase: ${err.message}`);
    } finally {
      setDeletingFirebase(false);
    }
  };

  const fetchMedia = () => {
    setLoading(true);
    safeFetchJson<MediaAsset[]>('/api/admin/media', {
      headers: { Authorization: `Bearer ${token}` },
    }, [])
      .then((data) => setMedia(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMedia();
  }, [token]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMsg('');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt_text', file.name);

      try {
        const res = await fetch('/api/uploads', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await safeResponseJson(res, {});
        if (!res.ok) {
          setErrorMsg(data?.error || 'Upload error');
        }
      } catch {
        setErrorMsg('Network error while uploading');
      }
    }

    setUploading(false);
    fetchMedia();
  };

  const handleCopyPath = (path: string, id: string) => {
    navigator.clipboard.writeText(path);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (force = false) => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`/api/admin/media/${deleteTarget.id}${force ? '?force=true' : ''}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await safeResponseJson(res, {});
      if (!res.ok) {
        setErrorMsg(data?.error || 'Failed to delete file');
        return;
      }

      setDeleteTarget(null);
      fetchMedia();
    } catch {
      setErrorMsg('Network error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#2C2724]">Media & Artwork Assets</h2>
          <p className="text-xs text-[#7D6B5D]">
            Central media library for high-resolution artwork photography, gallery photos, and videos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSyncFolder}
            disabled={syncingFolder}
            title="Automatically sync all images in public/static/assets/images with database products and media assets"
            className="px-4 py-2.5 rounded-xl bg-[#2C2724] hover:bg-[#433B37] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncingFolder ? 'animate-spin' : ''}`} />
            <span>{syncingFolder ? 'Syncing Folder...' : 'Smart Sync Folder'}</span>
          </button>

          <button
            onClick={handleDeleteFirebaseImages}
            disabled={deletingFirebase}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{deletingFirebase ? 'Deleting from Firebase...' : 'Delete Images from Firebase'}</span>
          </button>

          <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#A03E1B] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload Media Files'}</span>
            <input
              type="file"
              multiple
              accept="image/*,video/mp4"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-xs text-[#7D6B5D]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium text-[#2C2724]">Smart Auto-Sync Active:</span>
          <span>Files added or modified in <code className="px-1.5 py-0.5 rounded bg-white border border-[#E5D7C7] text-[#C85A32] font-mono text-[11px]">public/static/assets/images</code> are instantly synced to the database.</span>
        </div>
      </div>

      {syncSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-xs text-[#7D6B5D]">Loading media library...</div>
      ) : media.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#E5D7C7] craft-shadow space-y-3">
          <ImageIcon className="w-10 h-10 text-[#8C7667] mx-auto" />
          <h4 className="font-serif text-lg font-semibold text-[#2C2724]">No media files in library</h4>
          <p className="text-xs text-[#7D6B5D] max-w-sm mx-auto">
            Upload genuine studio photographs of your mandalas and Lippan artworks to display across the site.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((asset) => (
            <div
              key={asset.id}
              className="group relative rounded-2xl overflow-hidden bg-white border border-[#E5D7C7] craft-shadow flex flex-col"
            >
              <div className="relative aspect-square bg-[#FAF7F2] overflow-hidden">
                {asset.media_type === 'video' ? (
                  <video src={asset.storage_path} className="w-full h-full object-cover" />
                ) : (
                  <img
                    src={asset.storage_path}
                    alt={asset.alt_text}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Reference Pill */}
                <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono">
                  {asset.referenced_count ?? 0} uses
                </span>
              </div>

              <div className="p-2.5 text-[11px] space-y-1">
                <p className="font-semibold text-[#2C2724] truncate" title={asset.filename}>
                  {asset.filename}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-[#F2EAE0]">
                  <button
                    onClick={() => handleCopyPath(asset.storage_path, asset.id)}
                    className="text-[#5B331A] hover:text-[#C85A32] flex items-center gap-1 text-[10px]"
                    title="Copy storage URL"
                  >
                    {copiedId === asset.id ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === asset.id ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => setDeleteTarget(asset)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete media"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#E3D4C4] craft-shadow p-6 space-y-4 text-xs">
            <h3 className="font-serif text-lg font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Delete Media Asset?</span>
            </h3>
            <p className="text-[#66574D]">
              Are you sure you want to delete <strong>{deleteTarget.filename}</strong>?
            </p>
            {deleteTarget.referenced_count && deleteTarget.referenced_count > 0 && (
              <p className="text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                Warning: This file is currently linked to {deleteTarget.referenced_count} product(s). Deleting it will remove the photo from those products.
              </p>
            )}
            <div className="pt-4 flex justify-end gap-3 border-t border-[#F0E5D8]">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-[#D4A373] text-[#5B331A]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(true)}
                className="px-5 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700"
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
