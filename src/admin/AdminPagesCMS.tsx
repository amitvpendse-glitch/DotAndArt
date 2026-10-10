import React, { useState, useEffect } from 'react';
import {
  Save,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ImageIcon,
  UploadCloud,
  X,
} from 'lucide-react';
import { WebsitePage, PageSection } from '../types';
import { safeFetchJson, safeResponseJson } from '../lib/safeFetch';
import { INITIAL_PAGES } from '../data/initialCatalog';

interface AdminPagesCMSProps {
  token: string;
}

export const AdminPagesCMS: React.FC<AdminPagesCMSProps> = ({ token }) => {
  const [pages, setPages] = useState<WebsitePage[]>(INITIAL_PAGES);
  const [selectedSlug, setSelectedSlug] = useState<string>('home');
  const [activePage, setActivePage] = useState<WebsitePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // New Section Modal State
  const [newSecModalOpen, setNewSecModalOpen] = useState(false);
  const [newSecKey, setNewSecKey] = useState('');
  const [newSecType, setNewSecType] = useState('text');

  // New Field Modal State
  const [newFieldSecIdx, setNewFieldSecIdx] = useState<number | null>(null);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldIsImage, setNewFieldIsImage] = useState(false);

  const fetchPages = () => {
    setLoading(true);
    safeFetchJson<WebsitePage[]>('/api/admin/pages', {
      headers: { Authorization: `Bearer ${token}` },
    }, INITIAL_PAGES)
      .then((data) => {
        let list = Array.isArray(data) && data.length > 0 ? [...data] : [...INITIAL_PAGES];
        // Ensure all default INITIAL_PAGES exist in list
        INITIAL_PAGES.forEach((initP) => {
          if (!list.some((p) => p.slug === initP.slug)) {
            list.push(initP);
          }
        });
        setPages(list);
        const currentSlug = selectedSlug || 'home';
        const found = list.find((p) => p.slug === currentSlug) || list[0];
        setSelectedSlug(found.slug);
        setActivePage(JSON.parse(JSON.stringify(found)));
      })
      .catch((err) => {
        console.error(err);
        setPages(INITIAL_PAGES);
        setActivePage(JSON.parse(JSON.stringify(INITIAL_PAGES[0])));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSelectPage = (slug: string) => {
    setSelectedSlug(slug);
    setSuccessMsg('');
    setErrorMsg('');
    const found = pages.find((p) => p.slug === slug);
    if (found) {
      setActivePage(JSON.parse(JSON.stringify(found)));
    }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!activePage) return;
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch(`/api/admin/pages/${activePage.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: activePage.title,
          seo_title: activePage.seo_title,
          meta_description: activePage.meta_description,
          status,
          sections: activePage.sections,
        }),
      });

      const data = await safeResponseJson(res, {});
      if (!res.ok) {
        setErrorMsg(data?.error || 'Failed to update page CMS.');
        return;
      }

      setSuccessMsg(`Successfully saved and published changes for "${activePage.title}".`);
      fetchPages();
    } catch (err) {
      setErrorMsg('Server error saving page CMS.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (sIdx: number, fieldKey: string, file: File) => {
    if (!activePage) return;
    const uploadId = `${sIdx}-${fieldKey}`;
    setUploadingKey(uploadId);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await safeResponseJson(res, {});
      if (!res.ok || !data.url) {
        setErrorMsg(data?.error || 'Failed to upload image file.');
        return;
      }

      const copy = [...activePage.sections];
      copy[sIdx].content_json = {
        ...copy[sIdx].content_json,
        [fieldKey]: data.url,
      };

      setActivePage({ ...activePage, sections: copy });
      setSuccessMsg(`Image uploaded and updated for field "${fieldKey}". Click "Publish Changes" to save.`);
    } catch (err) {
      setErrorMsg('Error uploading section image.');
    } finally {
      setUploadingKey(null);
    }
  };

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePage || !newSecKey) return;

    const newSec: PageSection = {
      id: `sec-${Date.now()}`,
      page_id: activePage.id,
      section_type: newSecType,
      section_key: newSecKey.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      content_json: {
        title: 'New Section Title',
        subtitle: 'Enter section description here...',
        image_url: '/logo.png',
      },
      display_order: (activePage.sections?.length || 0) + 1,
      is_visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setActivePage({
      ...activePage,
      sections: [...(activePage.sections || []), newSec],
    });

    setNewSecModalOpen(false);
    setNewSecKey('');
  };

  const handleDeleteSection = (sIdx: number) => {
    if (!activePage) return;
    if (!window.confirm('Delete this section from the page?')) return;

    const copy = [...activePage.sections];
    copy.splice(sIdx, 1);
    setActivePage({ ...activePage, sections: copy });
  };

  const handleMoveSection = (sIdx: number, direction: 'up' | 'down') => {
    if (!activePage) return;
    const sections = [...activePage.sections];
    const targetIdx = direction === 'up' ? sIdx - 1 : sIdx + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const temp = sections[sIdx];
    sections[sIdx] = sections[targetIdx];
    sections[targetIdx] = temp;

    // re-assign display orders
    sections.forEach((s, i) => {
      s.display_order = i + 1;
    });

    setActivePage({ ...activePage, sections });
  };

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePage || newFieldSecIdx === null || !newFieldKey) return;

    const copy = [...activePage.sections];
    let key = newFieldKey.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (newFieldIsImage && !key.includes('image') && !key.includes('img') && !key.includes('photo')) {
      key = `${key}_image`;
    }

    copy[newFieldSecIdx].content_json = {
      ...copy[newFieldSecIdx].content_json,
      [key]: newFieldIsImage ? '/logo.png' : 'New Field Text Value',
    };

    setActivePage({ ...activePage, sections: copy });
    setNewFieldSecIdx(null);
    setNewFieldKey('');
    setNewFieldIsImage(false);
  };

  const handleDeleteField = (sIdx: number, fieldKey: string) => {
    if (!activePage) return;
    const copy = [...activePage.sections];
    delete copy[sIdx].content_json[fieldKey];
    setActivePage({ ...activePage, sections: copy });
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-theme-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-theme-muted">Loading website pages & section content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-theme-primary">
      {/* CMS Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-theme-primary">Website Pages CMS</h2>
          <p className="text-xs text-theme-muted">
            Full content & media management system for all website pages: Home, Catalog, Bespoke Orders, Gallery, About Artist, Contact & Policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activePage && (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave('draft')}
                className="px-4 py-2 rounded-xl glass-button text-theme-primary text-xs font-semibold hover:bg-theme-accent/10 cursor-pointer"
              >
                Save Draft
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave('published')}
                className="px-5 py-2 rounded-xl bg-theme-accent hover:opacity-90 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Publish Changes</span>
              </button>
            </>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Dropdown List Page Selector */}
      <div className="p-4 sm:p-5 rounded-2xl bg-theme-page border border-theme-glass space-y-3 craft-shadow">
        <label className="block text-xs font-bold uppercase tracking-wider text-theme-accent flex items-center gap-1.5">
          <Layers className="w-4 h-4" />
          <span>Select Webpage to Edit ({pages.length} Pages Available):</span>
        </label>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <select
              value={selectedSlug}
              onChange={(e) => handleSelectPage(e.target.value)}
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-theme-card border-2 border-theme-accent/40 focus:border-theme-accent text-theme-primary text-sm font-bold shadow-xs cursor-pointer appearance-none transition-all"
            >
              {pages.map((p) => (
                <option key={p.slug} value={p.slug} className="bg-theme-page text-theme-primary font-sans py-1">
                  {p.title} (/{p.slug === 'home' ? '' : p.slug}) — {p.status.toUpperCase()}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-theme-accent">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-theme-muted shrink-0">
            <span className="px-3 py-2 rounded-xl bg-theme-card border border-theme-glass font-mono font-medium">
              URL Path: /{selectedSlug === 'home' ? '' : selectedSlug}
            </span>
          </div>
        </div>

        {/* Quick select pill shortcuts */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-theme-glass/60">
          <span className="text-[10px] uppercase font-bold text-theme-muted mr-1">Quick Select:</span>
          {pages.map((p) => {
            const isSelected = selectedSlug === p.slug;
            return (
              <button
                key={p.slug}
                onClick={() => handleSelectPage(p.slug)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-theme-accent text-white shadow-2xs font-bold'
                    : 'bg-theme-card text-theme-primary hover:bg-theme-accent/20 border border-theme-glass'
                }`}
              >
                {p.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Page CMS Panel */}
      {activePage && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-theme-glass craft-shadow space-y-8 text-xs text-theme-primary">
          {/* Top Bar Info & Live Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-glass">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl font-bold text-theme-primary">
                  Editing Webpage: {activePage.title}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    activePage.status === 'published'
                      ? 'bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20'
                      : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                  }`}
                >
                  {activePage.status}
                </span>
              </div>
              <p className="text-xs text-theme-muted font-mono mt-0.5">
                URL Path: /{activePage.slug === 'home' ? '' : activePage.slug}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={activePage.slug === 'home' ? '/' : `/${activePage.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl glass-button text-xs text-theme-primary hover:bg-theme-accent/15 flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-theme-accent" />
                <span>View Live Webpage</span>
              </a>
            </div>
          </div>

          {/* Page Metadata & SEO */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-bold text-theme-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-theme-accent" />
              <span>Page Title & Search Engine Optimization (SEO)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-theme-primary mb-1">Page Title *</label>
                <input
                  type="text"
                  value={activePage.title}
                  onChange={(e) => setActivePage({ ...activePage, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-theme-primary mb-1">SEO Title Tag (&lt;title&gt;)</label>
                <input
                  type="text"
                  value={activePage.seo_title || ''}
                  onChange={(e) => setActivePage({ ...activePage, seo_title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-theme-primary mb-1">Meta Description (&lt;meta name="description"&gt;)</label>
              <textarea
                rows={2}
                value={activePage.meta_description || ''}
                onChange={(e) => setActivePage({ ...activePage, meta_description: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary resize-none"
              />
            </div>
          </div>

          {/* Page Sections Editor */}
          <div className="space-y-6 pt-6 border-t border-theme-glass">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-serif text-lg font-bold text-theme-primary">
                  Page Content & Image Sections ({activePage.sections?.length || 0})
                </h4>
                <p className="text-xs text-theme-muted">
                  Modify headlines, copy text, images, and section visibility for this page.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setNewSecModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-theme-accent/15 text-theme-accent hover:bg-theme-accent/20 border border-theme-glass font-semibold text-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Content Section</span>
              </button>
            </div>

            {activePage.sections && activePage.sections.length > 0 ? (
              <div className="space-y-6">
                {activePage.sections.map((section, sIdx) => (
                  <div
                    key={section.id || sIdx}
                    className="p-5 sm:p-6 rounded-2xl bg-theme-page border border-theme-glass space-y-4 shadow-2xs"
                  >
                    {/* Section Header Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-theme-glass">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-theme-accent uppercase bg-theme-accent/10 px-2 py-0.5 rounded border border-theme-glass">
                          Section #{sIdx + 1}: {section.section_key}
                        </span>
                        <span className="text-[10px] text-theme-muted font-mono">
                          Type: {section.section_type}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Order adjustment */}
                        <button
                          type="button"
                          disabled={sIdx === 0}
                          onClick={() => handleMoveSection(sIdx, 'up')}
                          className="p-1 rounded glass-button text-theme-primary disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={sIdx === activePage.sections.length - 1}
                          onClick={() => handleMoveSection(sIdx, 'down')}
                          className="p-1 rounded glass-button text-theme-primary disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Visibility check */}
                        <label className="flex items-center gap-1.5 text-xs text-theme-primary cursor-pointer px-2 py-1 rounded bg-theme-card border border-theme-glass">
                          <input
                            type="checkbox"
                            checked={section.is_visible}
                            onChange={(e) => {
                              const copy = [...activePage.sections];
                              copy[sIdx].is_visible = e.target.checked;
                              setActivePage({ ...activePage, sections: copy });
                            }}
                            className="rounded text-theme-accent cursor-pointer"
                          />
                          <span>Visible</span>
                        </label>

                        {/* Delete Section */}
                        <button
                          type="button"
                          onClick={() => handleDeleteSection(sIdx)}
                          className="p-1 rounded text-red-500 hover:bg-red-500/20 cursor-pointer"
                          title="Delete Section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Section Content Json Fields */}
                    {section.content_json && (
                      <div className="space-y-4 pt-2">
                        {Object.entries(section.content_json).map(([key, val]) => {
                          const isLong = typeof val === 'string' && (val.length > 80 || val.includes('\n'));
                          const isImageField =
                            key.includes('image') ||
                            key.includes('img') ||
                            key.includes('photo') ||
                            key.includes('banner') ||
                            key.includes('bg') ||
                            key.includes('logo') ||
                            key.includes('avatar') ||
                            key.includes('src') ||
                            (typeof val === 'string' && (val.startsWith('/') || val.startsWith('http')));

                          const uploadId = `${sIdx}-${key}`;
                          const isUploading = uploadingKey === uploadId;

                          return (
                            <div key={key} className="space-y-1.5 p-3 rounded-xl bg-theme-card/60 border border-theme-glass">
                              <div className="flex items-center justify-between">
                                <label className="block font-mono text-[10px] text-theme-accent uppercase font-bold flex items-center gap-1">
                                  {isImageField && <ImageIcon className="w-3.5 h-3.5" />}
                                  <span>{key.replace(/_/g, ' ')}</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteField(sIdx, key)}
                                  className="text-[10px] text-red-400 hover:underline cursor-pointer"
                                >
                                  remove field
                                </button>
                              </div>

                              {isImageField ? (
                                <div className="space-y-2.5 pt-1">
                                  {/* Image Live Preview */}
                                  {typeof val === 'string' && val.trim() !== '' && (
                                    <div className="relative group w-32 h-24 rounded-xl border border-theme-glass overflow-hidden bg-black/20">
                                      <img
                                        src={val}
                                        alt={key}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] text-white font-medium">
                                        Preview
                                      </div>
                                    </div>
                                  )}

                                  {/* Image URL text input & Direct Upload Button */}
                                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                    <input
                                      type="text"
                                      value={String(val)}
                                      placeholder="https://... or /uploads/filename.jpg"
                                      onChange={(e) => {
                                        const copy = [...activePage.sections];
                                        copy[sIdx].content_json = {
                                          ...copy[sIdx].content_json,
                                          [key]: e.target.value,
                                        };
                                        setActivePage({ ...activePage, sections: copy });
                                      }}
                                      className="flex-1 px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass text-theme-primary font-mono text-xs"
                                    />

                                    <label className="px-3.5 py-2 rounded-xl bg-theme-accent/20 hover:bg-theme-accent/30 border border-theme-glass text-theme-accent text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                                      {isUploading ? (
                                        <div className="w-4 h-4 border-2 border-theme-accent border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <UploadCloud className="w-4 h-4" />
                                      )}
                                      <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        disabled={isUploading}
                                        onChange={(e) => {
                                          if (e.target.files?.[0]) {
                                            handleImageUpload(sIdx, key, e.target.files[0]);
                                          }
                                        }}
                                        className="hidden"
                                      />
                                    </label>
                                  </div>
                                </div>
                              ) : isLong ? (
                                <textarea
                                  rows={Math.min(8, Math.max(3, String(val).split('\n').length + 1))}
                                  value={String(val)}
                                  onChange={(e) => {
                                    const copy = [...activePage.sections];
                                    copy[sIdx].content_json = {
                                      ...copy[sIdx].content_json,
                                      [key]: e.target.value,
                                    };
                                    setActivePage({ ...activePage, sections: copy });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-xl bg-theme-card border border-theme-glass text-theme-primary font-sans text-xs leading-relaxed"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={String(val)}
                                  onChange={(e) => {
                                    const copy = [...activePage.sections];
                                    copy[sIdx].content_json = {
                                      ...copy[sIdx].content_json,
                                      [key]: e.target.value,
                                    };
                                    setActivePage({ ...activePage, sections: copy });
                                  }}
                                  className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass text-theme-primary font-sans text-xs"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Field Button */}
                    <div className="pt-2 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setNewFieldSecIdx(sIdx);
                          setNewFieldIsImage(false);
                        }}
                        className="text-[11px] font-semibold text-theme-accent hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Text Field</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setNewFieldSecIdx(sIdx);
                          setNewFieldIsImage(true);
                        }}
                        className="text-[11px] font-semibold text-theme-accent hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>Add Image Field</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-theme-muted py-4 text-center">No content sections defined for this page yet.</p>
            )}
          </div>
        </div>
      )}

      {/* New Section Modal */}
      {newSecModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="max-w-md w-full glass-panel rounded-3xl border border-theme-glass craft-shadow p-6 space-y-4 text-xs text-theme-primary">
            <div className="flex items-center justify-between border-b border-theme-glass pb-3">
              <h3 className="font-serif text-lg font-bold text-theme-primary">Add Section to Webpage</h3>
              <button onClick={() => setNewSecModalOpen(false)} className="text-theme-muted cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSection} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Section Identifier *</label>
                <input
                  type="text"
                  required
                  value={newSecKey}
                  onChange={(e) => setNewSecKey(e.target.value)}
                  placeholder="e.g. hero_banner, gallery_grid, artist_bio"
                  className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Section Layout Type</label>
                <select
                  value={newSecType}
                  onChange={(e) => setNewSecType(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                >
                  <option value="hero">Hero Banner with Image</option>
                  <option value="feature">Feature Highlights Grid</option>
                  <option value="cta">Call to Action Banner</option>
                  <option value="text">Text Narrative / Bio</option>
                  <option value="custom">Custom Block</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-theme-glass">
                <button
                  type="button"
                  onClick={() => setNewSecModalOpen(false)}
                  className="px-4 py-2 rounded-xl glass-button text-theme-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-theme-accent text-white font-semibold cursor-pointer"
                >
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Field Modal */}
      {newFieldSecIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="max-w-md w-full glass-panel rounded-3xl border border-theme-glass craft-shadow p-6 space-y-4 text-xs text-theme-primary">
            <div className="flex items-center justify-between border-b border-theme-glass pb-3">
              <h3 className="font-serif text-lg font-bold text-theme-primary">
                Add {newFieldIsImage ? 'Image' : 'Text'} Field to Section
              </h3>
              <button onClick={() => setNewFieldSecIdx(null)} className="text-theme-muted cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddField} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Field Name Identifier *</label>
                <input
                  type="text"
                  required
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  placeholder={newFieldIsImage ? "e.g. hero_image, banner_photo" : "e.g. headline_text, subtitle"}
                  className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-theme-glass">
                <button
                  type="button"
                  onClick={() => setNewFieldSecIdx(null)}
                  className="px-4 py-2 rounded-xl glass-button text-theme-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-theme-accent text-white font-semibold cursor-pointer"
                >
                  Add Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
