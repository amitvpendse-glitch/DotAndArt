import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Star, Upload, ImageIcon } from 'lucide-react';
import { Testimonial } from '../types';
import { getFirestoreTestimonials, saveFirestoreTestimonial, deleteFirestoreTestimonial, uploadImageToSupabaseStorage } from '../lib/firestoreCatalog';
import { compressImageFile } from '../utils/imageCompressor';

interface AdminTestimonialsProps {
  token: string;
}

export const AdminTestimonials: React.FC<AdminTestimonialsProps> = ({ token }) => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [artwork, setArtwork] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [isPublished, setIsPublished] = useState(true);
  const [imagePath, setImagePath] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getFirestoreTestimonials();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenCreate = () => {
    setEditing(null);
    setName('');
    setLocation('');
    setArtwork('');
    setContent('');
    setRating(5);
    setIsPublished(true);
    setImagePath('');
    setModalOpen(true);
  };

  const handleOpenEdit = (t: Testimonial) => {
    setEditing(t);
    setName(t.customer_name);
    setLocation(t.location || '');
    setArtwork(t.artwork_purchased || '');
    setContent(t.content);
    setRating(t.rating || 5);
    setIsPublished(t.is_published);
    setImagePath(t.image_path || '');
    setModalOpen(true);
  };

  const handleTestimonialImageUpload = async (file: File) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const compressed = await compressImageFile(file, 800, 800, 0.85);
      const res = await uploadImageToSupabaseStorage(compressed, 'collector-review', file.name);
      if (res.success && res.public_url) {
        setImagePath(res.public_url);
      }
    } catch (err) {
      console.warn('Upload error', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const targetId = editing?.id || `test-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const testimonial: Testimonial = {
        ...editing,
        id: targetId,
        customer_name: name,
        location,
        artwork_purchased: artwork,
        content,
        rating,
        image_path: imagePath,
        is_published: isPublished,
        display_order: editing?.display_order || 0,
        created_at: editing?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const isEdit = Boolean(editing);
      const url = isEdit ? `/api/admin/testimonials/${targetId}` : '/api/admin/testimonials';

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(testimonial),
      }).catch(async () => {
        // Fallback PUT in case proxy requires PUT
        await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(testimonial),
        }).catch(() => {});
      });

      await saveFirestoreTestimonial(testimonial).catch(() => {});

      window.dispatchEvent(new Event('app_testimonials_updated'));
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => null);

      if (!res || !res.ok) {
        await fetch(`/api/admin/testimonials/${id}/delete`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {});
      }

      await deleteFirestoreTestimonial(id).catch(() => {});

      window.dispatchEvent(new Event('app_testimonials_updated'));
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-theme-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-theme-muted">Loading testimonials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-theme-primary">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-theme-primary">Collector Testimonials</h2>
          <p className="text-xs text-theme-muted">
            Manage published collector reviews, star ratings, and location credentials.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-theme-accent hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((t) => (
          <div
            key={t.id}
            className="p-5 rounded-2xl glass-card border border-theme-glass craft-shadow flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                {t.is_published ? (
                  <span className="text-[10px] font-bold text-green-700 dark:text-green-300 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                    Published
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 bg-gray-500/10 px-2 py-0.5 rounded-full border border-gray-500/20">
                    Draft
                  </span>
                )}
              </div>

              <p className="text-xs text-theme-primary leading-relaxed italic">"{t.content}"</p>
            </div>

            <div className="pt-3 border-t border-theme-glass flex items-center justify-between">
              <div>
                <h4 className="font-serif font-semibold text-sm text-theme-primary">{t.customer_name}</h4>
                <p className="text-[10px] text-theme-muted">
                  {t.location} {t.artwork_purchased ? `• ${t.artwork_purchased}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(t)}
                  className="p-1.5 rounded text-theme-primary hover:bg-theme-accent/15 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-1.5 rounded text-red-500 hover:bg-red-500/20 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="max-w-md w-full glass-panel rounded-3xl border border-theme-glass craft-shadow p-6 space-y-4 text-xs text-theme-primary">
            <h3 className="font-serif text-lg font-bold text-theme-primary">
              {editing ? 'Edit Testimonial' : 'New Collector Testimonial'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold text-theme-primary mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-theme-primary mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Mumbai, India or London, UK"
                  className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-theme-primary mb-1">Artwork Purchased</label>
                <input
                  type="text"
                  value={artwork}
                  onChange={(e) => setArtwork(e.target.value)}
                  placeholder="e.g. Surya Mandala (15 inches)"
                  className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-theme-primary mb-1">Testimonial Content *</label>
                <textarea
                  rows={3}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-theme-primary mb-1">Collector / Artwork Photo (Optional)</label>
                <div className="flex items-center gap-3">
                  {imagePath ? (
                    <img src={imagePath} alt="Avatar" className="w-12 h-12 rounded-xl object-cover border border-theme-glass shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-theme-page border border-theme-glass flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5 text-theme-muted" />
                    </div>
                  )}
                  <input
                    type="text"
                    value={imagePath}
                    onChange={(e) => setImagePath(e.target.value)}
                    placeholder="https://... or upload photo"
                    className="flex-1 px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs"
                  />
                  <label className="px-3 py-2 rounded-xl bg-theme-accent/15 text-theme-accent font-semibold flex items-center gap-1 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? '...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*,.jpg,.jpeg,.png,.webp,.heic,.heif"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleTestimonialImageUpload(e.target.files[0]);
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-theme-primary mb-1">Star Rating (1-5)</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                >
                  <option value={5}>5 Stars (Exceptional)</option>
                  <option value={4}>4 Stars (Very Good)</option>
                  <option value={3}>3 Stars (Good)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pubTestCheck"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded text-theme-accent cursor-pointer"
                />
                <label htmlFor="pubTestCheck" className="font-semibold text-theme-primary cursor-pointer">
                  Publish on Website
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-theme-glass">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl glass-button text-theme-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-theme-accent text-white font-semibold cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
