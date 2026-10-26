import React, { useState, useEffect } from 'react';
import { FloatingSaveButton } from './FloatingSaveButton';
import {
  Save,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Layers,
  Check,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  FileText,
  Sparkles,
} from 'lucide-react';
import { WebsitePage, PageSection, WebsiteSettings } from '../types';
import { safeFetchJson, safeResponseJson } from '../lib/safeFetch';
import { INITIAL_PAGES } from '../data/initialCatalog';
import { setActiveWhatsAppNumber } from '../utils/whatsapp';
import { AdminTestimonials } from './AdminTestimonials';
import { AdminFAQs } from './AdminFAQs';
import { onSnapshot, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PAGES_COLLECTION } from '../lib/firestoreCatalog';
import { compressImageFile, compressDataUrl } from '../utils/imageCompressor';

interface AdminPagesCMSProps {
  token: string;
}

const sortSectionKeys = (secKey: string, entries: [string, any][]): [string, any][] => {
  if (secKey === 'artist_story') {
    const preferredOrder = [
      'statement_heading',
      'paragraph_1',
      'paragraph_2',
      'paragraph_3',
      'paragraph_4',
      'paragraph_5',
      'closing_thanks',
      'closing_sign',
      'closing_name',
      'closing_role',
    ];
    return [...entries].sort(([a], [b]) => {
      const idxA = preferredOrder.indexOf(a);
      const idxB = preferredOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }

  if (secKey === 'custom_header') {
    const preferred = ['badge', 'title', 'subtitle'];
    return [...entries].sort(([a], [b]) => preferred.indexOf(a) - preferred.indexOf(b));
  }
  if (secKey === 'custom_pillars') {
    const preferred = ['size_title', 'size_desc', 'color_title', 'color_desc', 'bindu_title', 'bindu_desc'];
    return [...entries].sort(([a], [b]) => preferred.indexOf(a) - preferred.indexOf(b));
  }
  if (secKey === 'custom_form_headings') {
    const preferred = ['step1_heading', 'step2_heading', 'step3_heading', 'cta_button_text', 'policy_note'];
    return [...entries].sort(([a], [b]) => preferred.indexOf(a) - preferred.indexOf(b));
  }
  if (secKey === 'custom_form_labels') {
    const preferred = ['central_photo_label', 'central_photo_note', 'pattern_label', 'instructions_label', 'instructions_placeholder'];
    return [...entries].sort(([a], [b]) => preferred.indexOf(a) - preferred.indexOf(b));
  }
  if (secKey === 'testimonials_hero') {
    const preferred = ['badge', 'title', 'subtitle', 'button_text'];
    return [...entries].sort(([a], [b]) => preferred.indexOf(a) - preferred.indexOf(b));
  }
  if (secKey === 'testimonials_stats') {
    const preferred = [
      'stat1_value', 'stat1_label',
      'stat2_value', 'stat2_sub', 'stat2_label',
      'stat3_value', 'stat3_sub', 'stat3_label',
      'stat4_value', 'stat4_sub', 'stat4_label',
    ];
    return [...entries].sort(([a], [b]) => preferred.indexOf(a) - preferred.indexOf(b));
  }
  if (secKey === 'testimonials_cta') {
    const preferred = ['title', 'description', 'button_text'];
    return [...entries].sort(([a], [b]) => preferred.indexOf(a) - preferred.indexOf(b));
  }
  if (secKey === 'faqs_header') {
    const preferred = ['badge', 'title', 'description'];
    return [...entries].sort(([a], [b]) => preferred.indexOf(a) - preferred.indexOf(b));
  }
  if (secKey === 'faqs_help_card') {
    const preferred = ['title', 'description', 'button_text'];
    return [...entries].sort(([a], [b]) => preferred.indexOf(a) - preferred.indexOf(b));
  }
  if (secKey === 'contact_header') {
    const preferred = ['badge', 'title', 'description'];
    return [...entries].sort(([a], [b]) => preferred.indexOf(a) - preferred.indexOf(b));
  }
  if (secKey === 'studio_info') {
    const preferred = [
      'info_title',
      'whatsapp_display',
      'whatsapp_note',
      'domain_name',
      'email_address',
      'studio_address',
      'instagram_handle',
      'instagram_url',
      'facebook_url',
    ];
    return [...entries].sort(([a], [b]) => preferred.indexOf(a) - preferred.indexOf(b));
  }
  if (secKey === 'contact_form') {
    const preferred = ['form_title', 'form_subtitle', 'submit_button_text'];
    return [...entries].sort(([a], [b]) => preferred.indexOf(a) - preferred.indexOf(b));
  }

  return [...entries].sort(([a], [b]) => {
    const matchA = a.match(/\d+/);
    const matchB = b.match(/\d+/);
    if (matchA && matchB && a.replace(/\d+/, '') === b.replace(/\d+/, '')) {
      return parseInt(matchA[0], 10) - parseInt(matchB[0], 10);
    }
    return a.localeCompare(b);
  });
};

export const AdminPagesCMS: React.FC<AdminPagesCMSProps> = ({ token }) => {
  const [pages, setPages] = useState<WebsitePage[]>(INITIAL_PAGES);
  const [selectedSlug, setSelectedSlug] = useState<string>('home');
  const [activePage, setActivePage] = useState<WebsitePage | null>(null);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const isDirtyRef = React.useRef(isDirty);
  const selectedSlugRef = React.useRef(selectedSlug);

  React.useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  React.useEffect(() => {
    selectedSlugRef.current = selectedSlug;
  }, [selectedSlug]);
  
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Helper to ensure all default sections and content_json keys from INITIAL_PAGES exist on page
  const ensurePageSections = (page: WebsitePage): WebsitePage => {
    const initP = INITIAL_PAGES.find((ip: any) => ip.slug === page.slug);
    if (!initP || !initP.sections) return page;

    const pageCopy: WebsitePage = JSON.parse(JSON.stringify(page));
    pageCopy.sections = pageCopy.sections || [];

    const existingMap = new Map<string, PageSection>();
    pageCopy.sections.forEach((s) => existingMap.set(s.section_key || s.id, s));

    initP.sections.forEach((initSec: PageSection) => {
      const secKey = initSec.section_key || initSec.id;
      const existingSec = existingMap.get(secKey);
      if (!existingSec) {
        pageCopy.sections.push(JSON.parse(JSON.stringify(initSec)));
      } else {
        existingSec.content_json = existingSec.content_json || {};
        if (initSec.content_json) {
          Object.entries(initSec.content_json).forEach(([k, v]) => {
            if (existingSec.content_json[k] === undefined || existingSec.content_json[k] === null) {
              existingSec.content_json[k] = v;
            }
          });
        }
      }
    });

    return pageCopy;
  };

  // Fetch all pages and global settings
  const fetchPagesAndSettings = () => {
    setLoading(true);
    Promise.all([
      safeFetchJson<WebsitePage[]>(
        '/api/admin/pages',
        { headers: { Authorization: `Bearer ${token}` } },
        INITIAL_PAGES
      ),
      safeFetchJson<WebsiteSettings | null>(
        '/api/admin/settings',
        { headers: { Authorization: `Bearer ${token}` } },
        null
      ),
    ])
      .then(([pagesData, settingsData]) => {
        const rawList = Array.isArray(pagesData) && pagesData.length > 0 ? [...pagesData] : [...INITIAL_PAGES];
        
        // Ensure all default pages and sections exist
        const list = rawList.map((p) => ensurePageSections(p));
        INITIAL_PAGES.forEach((initP) => {
          if (!list.some((p) => p.slug === initP.slug)) {
            list.push(ensurePageSections(initP));
          }
        });

        setPages(list);

        if (settingsData) {
          setSettings(settingsData);
          if (settingsData.whatsapp_number) {
            setActiveWhatsAppNumber(settingsData.whatsapp_number);
          }
        }

        const currentSlug = selectedSlug || 'home';
        const found = (list || []).find((p) => p.slug === currentSlug) || list[0];
        setSelectedSlug(found.slug);
        setActivePage(ensurePageSections(found));
        setIsDirty(false);
      })
      .catch((err) => {
        console.error('CMS Load Error:', err);
        setPages(INITIAL_PAGES);
        setActivePage(ensurePageSections(INITIAL_PAGES[0]));
        setIsDirty(false);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPagesAndSettings();

    // Add real-time listener for PAGES_COLLECTION
    const colRef = collection(db, PAGES_COLLECTION);
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const data: WebsitePage[] = [];
      snapshot.forEach((doc) => doc.exists() && data.push(doc.data() as WebsitePage));
      
      // Update pages state
      setPages(data);
      
      // If we have an activePage, and it's not dirty, update it with the new data
      if (selectedSlugRef.current && !isDirtyRef.current) {
          const updatedPage = data.find(p => p.slug === selectedSlugRef.current);
          if (updatedPage) {
              setActivePage(ensurePageSections(updatedPage));
          }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSelectPage = (slug: string) => {
    setSelectedSlug(slug);
    setSuccessMsg('');
    setErrorMsg('');
    const found = (pages || []).find((p) => p.slug === slug);
    if (found) {
      const merged = ensurePageSections(found);
      setActivePage(JSON.parse(JSON.stringify(merged)));
      setIsDirty(false);
    }
  };

  // Helper to update field in section
  const updateSectionField = (sectionKeyOrId: string, fieldKey: string, value: any) => {
    if (!activePage) return;
    const sectionsCopy = activePage.sections ? [...activePage.sections] : [];
    const idx = sectionsCopy.findIndex((s) => s.id === sectionKeyOrId || s.section_key === sectionKeyOrId);

    if (idx >= 0) {
      sectionsCopy[idx] = {
        ...sectionsCopy[idx],
        content_json: {
          ...(sectionsCopy[idx].content_json || {}),
          [fieldKey]: value,
        },
        updated_at: new Date().toISOString(),
      };
      setActivePage({ ...activePage, sections: sectionsCopy });
      setIsDirty(true);
    }
  };

  // Helper to update item in an array field inside section
  const updateSectionArrayItem = (sectionKeyOrId: string, arrayKey: string, itemIdx: number, itemField: string, value: any) => {
    if (!activePage) return;
    const sectionsCopy = activePage.sections ? [...activePage.sections] : [];
    const idx = sectionsCopy.findIndex((s) => s.id === sectionKeyOrId || s.section_key === sectionKeyOrId);

    if (idx >= 0) {
      const existingArray = [...(sectionsCopy[idx].content_json?.[arrayKey] || [])];
      if (existingArray[itemIdx]) {
        existingArray[itemIdx] = {
          ...existingArray[itemIdx],
          [itemField]: value,
        };
        sectionsCopy[idx] = {
          ...sectionsCopy[idx],
          content_json: {
            ...(sectionsCopy[idx].content_json || {}),
            [arrayKey]: existingArray,
          },
          updated_at: new Date().toISOString(),
        };
        setActivePage({ ...activePage, sections: sectionsCopy });
        setIsDirty(true);
      }
    }
  };

  // Add item to array field
  const addSectionArrayItem = (sectionKeyOrId: string, arrayKey: string, newItem: any) => {
    if (!activePage) return;
    const sectionsCopy = activePage.sections ? [...activePage.sections] : [];
    const idx = sectionsCopy.findIndex((s) => s.id === sectionKeyOrId || s.section_key === sectionKeyOrId);

    if (idx >= 0) {
      const existingArray = [...(sectionsCopy[idx].content_json?.[arrayKey] || [])];
      existingArray.push(newItem);
      sectionsCopy[idx] = {
        ...sectionsCopy[idx],
        content_json: {
          ...(sectionsCopy[idx].content_json || {}),
          [arrayKey]: existingArray,
        },
        updated_at: new Date().toISOString(),
      };
      setActivePage({ ...activePage, sections: sectionsCopy });
      setIsDirty(true);
    }
  };

  // Remove item from array field
  const removeSectionArrayItem = (sectionKeyOrId: string, arrayKey: string, itemIdx: number) => {
    if (!activePage) return;
    const sectionsCopy = activePage.sections ? [...activePage.sections] : [];
    const idx = sectionsCopy.findIndex((s) => s.id === sectionKeyOrId || s.section_key === sectionKeyOrId);

    if (idx >= 0) {
      const existingArray = [...(sectionsCopy[idx].content_json?.[arrayKey] || [])];
      existingArray.splice(itemIdx, 1);
      sectionsCopy[idx] = {
        ...sectionsCopy[idx],
        content_json: {
          ...(sectionsCopy[idx].content_json || {}),
          [arrayKey]: existingArray,
        },
        updated_at: new Date().toISOString(),
      };
      setActivePage({ ...activePage, sections: sectionsCopy });
      setIsDirty(true);
    }
  };

  // Toggle section visibility
  const toggleSectionVisibility = (sectionId: string) => {
    if (!activePage) return;
    const sectionsCopy = activePage.sections ? [...activePage.sections] : [];
    const idx = sectionsCopy.findIndex((s) => s.id === sectionId || s.section_key === sectionId);

    if (idx >= 0) {
      sectionsCopy[idx] = {
        ...sectionsCopy[idx],
        is_visible: !sectionsCopy[idx].is_visible,
        updated_at: new Date().toISOString(),
      };
      setActivePage({ ...activePage, sections: sectionsCopy });
      setIsDirty(true);
    }
  };

  // Reorder sections
  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (!activePage || !activePage.sections) return;
    const list = [...activePage.sections];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    list.forEach((sec, i) => {
      sec.display_order = i + 1;
    });

    setActivePage({ ...activePage, sections: list });
    setIsDirty(true);
  };

  // Handle file upload
  const handleFileUpload = async (uploadKey: string, onDone: (url: string) => void, file: File) => {
    if (!file || !activePage) return;
    setUploadingField(uploadKey);
    setErrorMsg('');

    try {
      // Compress image client-side before upload to guarantee ultra-fast processing
      const compressedFile = await compressImageFile(file);
      const formData = new FormData();
      formData.append('file', compressedFile);
      const data = await safeFetchJson<{ success?: boolean; file_path?: string; error?: string }>(
        '/api/uploads',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
        null
      );

      if (data && data.file_path) {
        onDone(data.file_path);
        setSuccessMsg('Image compressed & uploaded successfully!');
      } else {
        setErrorMsg(data?.error || 'Failed to upload image.');
      }
    } catch {
      setErrorMsg('Error uploading image file.');
    } finally {
      setUploadingField(null);
    }
  };

  // Add a new custom section to active page
  const handleAddSection = () => {
    if (!activePage) return;
    const newSection: PageSection = {
      id: `sec-${Date.now()}`,
      page_id: activePage.id,
      section_type: 'custom_text',
      section_key: `custom_${Date.now()}`,
      content_json: {
        title: 'New Section Title',
        subtitle: 'Subheading or badge text',
        description: 'Section description paragraph...',
      },
      display_order: (activePage.sections || []).length + 1,
      is_visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setActivePage({
      ...activePage,
      sections: [...(activePage.sections || []), newSection],
    });
    setIsDirty(true);
  };

  // Delete section
  const handleDeleteSection = (sectionId: string) => {
    if (!activePage || !window.confirm('Remove this section from the page?')) return;
    const list = (activePage.sections || []).filter((s) => s.id !== sectionId && s.section_key !== sectionId);
    setActivePage({ ...activePage, sections: list });
    setIsDirty(true);
  };

  // Save changes to backend & Cloud Firestore
  const handleSave = async (status: 'draft' | 'published' = 'published') => {
    if (!activePage) return;
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // Clean and compress any Data URLs in section content_json before saving
      const cleanedSections = await Promise.all(
        (activePage.sections || []).map(async (sec) => {
          if (!sec.content_json) return sec;
          const contentCopy = { ...sec.content_json };

          // Compress slides
          if (Array.isArray(contentCopy.slides)) {
            contentCopy.slides = await Promise.all(
              contentCopy.slides.map(async (slide: any) => {
                if (slide.image && typeof slide.image === 'string' && slide.image.startsWith('data:image/')) {
                  return { ...slide, image: await compressDataUrl(slide.image) };
                }
                return slide;
              })
            );
          }

          // Compress portals
          if (Array.isArray(contentCopy.portals)) {
            contentCopy.portals = await Promise.all(
              contentCopy.portals.map(async (portal: any) => {
                if (portal.image && typeof portal.image === 'string' && portal.image.startsWith('data:image/')) {
                  return { ...portal, image: await compressDataUrl(portal.image) };
                }
                return portal;
              })
            );
          }

          // Compress plates
          if (Array.isArray(contentCopy.plates)) {
            contentCopy.plates = await Promise.all(
              contentCopy.plates.map(async (plate: any) => {
                if (plate.src && typeof plate.src === 'string' && plate.src.startsWith('data:image/')) {
                  return { ...plate, src: await compressDataUrl(plate.src) };
                }
                return plate;
              })
            );
          }

          // Compress individual image fields
          for (const key of Object.keys(contentCopy)) {
            if (typeof contentCopy[key] === 'string' && contentCopy[key].startsWith('data:image/')) {
              contentCopy[key] = await compressDataUrl(contentCopy[key]);
            }
          }

          return { ...sec, content_json: contentCopy };
        })
      );

      const pagePayload = {
        title: activePage.title,
        seo_title: activePage.seo_title,
        meta_description: activePage.meta_description,
        status,
        sections: cleanedSections,
      };

      const updated = await safeFetchJson<WebsitePage | null>(
        `/api/admin/pages/${activePage.slug}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(pagePayload),
        },
        null
      );

      const finalPage: WebsitePage =
        updated && updated.slug ? updated : { ...activePage, sections: cleanedSections, updated_at: new Date().toISOString() };

      setPages((prev) => prev.map((p) => (p.slug === finalPage.slug ? finalPage : p)));
      setActivePage(finalPage);
      setIsDirty(false);

      // Immediately sync localStorage
      try {
        const pagesCustom = localStorage.getItem('app_custom_pages');
        let pagesArr: WebsitePage[] = pagesCustom ? JSON.parse(pagesCustom) : [];
        if (!Array.isArray(pagesArr)) pagesArr = [];
        const idx = pagesArr.findIndex((p) => p.slug === finalPage.slug);
        if (idx >= 0) {
          pagesArr[idx] = finalPage;
        } else {
          pagesArr.push(finalPage);
        }
        localStorage.setItem('app_custom_pages', JSON.stringify(pagesArr));
      } catch {}

      setSuccessMsg(`Page "${finalPage.title}" updated & saved to database successfully!`);
      window.dispatchEvent(new Event('app_pages_updated'));
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving page changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-theme-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-theme-muted">Loading website pages CMS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-theme-primary">
      {activePage && (
        <FloatingSaveButton 
          onSave={() => handleSave('published')} 
          isSaving={saving} 
          isDirty={isDirty}
        />
      )}
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-theme-primary flex items-center gap-2">
            <Layers className="w-6 h-6 text-theme-accent" />
            <span>Website Pages CMS</span>
          </h2>
          <p className="text-xs text-theme-muted">
            Manage every section, banner, slideshow, gallery, text block, and page structure across Dot And Art.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activePage && (
            <button
              type="button"
              disabled={!isDirty || saving}
              onClick={() => handleSave('published')}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-all ${
                !isDirty
                  ? 'bg-stone-500/20 text-stone-400 cursor-not-allowed border border-white/10'
                  : 'bg-[#C85A32] hover:bg-[#A03E1B] text-white cursor-pointer shadow-md transform hover:-translate-y-0.5'
              }`}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving to Cloud...</span>
                </>
              ) : !isDirty ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save &amp; Publish Changes</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Page Selector Tabs */}
      <div className="p-4 rounded-2xl glass-card border border-theme-glass space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-theme-accent">
          Select Page to Edit:
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {pages.map((p) => {
            const isSelected = selectedSlug === p.slug;
            return (
              <button
                key={p.slug}
                onClick={() => handleSelectPage(p.slug)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-theme-accent text-white shadow-xs font-bold'
                    : 'bg-theme-page text-theme-primary hover:bg-theme-accent/15 border border-theme-glass'
                }`}
              >
                {p.slug === 'home' && <span>🏠</span>}
                {p.slug === 'shop' && <span>🎨</span>}
                {p.slug === 'custom-order' && <span>🛒</span>}
                {p.slug === 'about' && <span>👤</span>}
                {p.slug === 'testimonials' && <span>💬</span>}
                {p.slug === 'faqs' && <span>❓</span>}
                {p.slug === 'contact' && <span>📬</span>}
                <span>{p.title.split('—')[0].trim()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Page Content Editor */}
      {activePage && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-theme-glass craft-shadow space-y-8 text-xs text-theme-primary">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-glass">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl font-bold text-theme-primary">
                  Editing: {activePage.title}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  {activePage.status}
                </span>
              </div>
              <p className="text-xs text-theme-muted font-mono mt-0.5">
                URL Path: /{activePage.slug === 'home' ? '' : activePage.slug}
              </p>
            </div>

            <a
              href={activePage.slug === 'home' ? '/' : `/${activePage.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl glass-button text-xs text-theme-primary hover:bg-theme-accent/15 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer border border-theme-glass"
            >
              <ExternalLink className="w-3.5 h-3.5 text-theme-accent" />
              <span>View Webpage</span>
            </a>
          </div>

          {/* Sections List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-base font-bold text-theme-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-theme-accent" />
                <span>Page Sections ({(activePage.sections || []).length})</span>
              </h4>

              <button
                type="button"
                onClick={handleAddSection}
                className="px-3 py-1.5 rounded-xl bg-theme-accent/15 text-theme-accent hover:bg-theme-accent hover:text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Section</span>
              </button>
            </div>

            {(activePage.sections || []).map((section, idx) => {
              const content = section.content_json || {};
              const secKey = section.section_key || section.id;

              return (
                <div
                  key={section.id || secKey}
                  className={`p-6 rounded-2xl bg-theme-page border transition-all space-y-5 ${
                    section.is_visible
                      ? 'border-theme-glass shadow-xs'
                      : 'border-stone-500/30 opacity-60 bg-stone-500/5'
                  }`}
                >
                  {/* Section Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-theme-glass">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-theme-accent text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </span>
                      <h5 className="font-serif font-bold text-sm text-theme-primary capitalize">
                        {secKey.replace(/_/g, ' ')}
                      </h5>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-accent/10 text-theme-accent border border-theme-glass">
                        {section.section_type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveSection(idx, 'up')}
                        className="p-1.5 rounded-lg bg-theme-card text-theme-muted hover:text-theme-primary disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === (activePage.sections || []).length - 1}
                        onClick={() => moveSection(idx, 'down')}
                        className="p-1.5 rounded-lg bg-theme-card text-theme-muted hover:text-theme-primary disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleSectionVisibility(section.id || secKey)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          section.is_visible
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-stone-500/15 text-stone-500 border border-stone-500/30'
                        }`}
                      >
                        {section.is_visible ? 'Visible' : 'Hidden'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSection(section.id || secKey)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Section Custom Form Content */}
                  <div className="space-y-4">
                    {/* 1. Slideshow Custom Array Editor */}
                    {secKey === 'slideshow' && Array.isArray(content.slides) ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-theme-accent">
                            Hero Slideshow Images &amp; Titles ({content.slides.length} Slides)
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              addSectionArrayItem(secKey, 'slides', {
                                image: '/static/assets/images/Home_page_banner.jpeg',
                                title: 'NEW SLIDE TITLE',
                                subtext: 'Handcrafted artwork',
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-theme-accent/15 text-theme-accent font-semibold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Slide</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {content.slides.map((slide: any, sIdx: number) => (
                            <div
                              key={sIdx}
                              className="p-3.5 rounded-xl bg-theme-card border border-theme-glass space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold text-theme-accent">
                                  Slide #{sIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeSectionArrayItem(secKey, 'slides', sIdx)}
                                  className="text-red-500 hover:bg-red-500/10 p-1 rounded cursor-pointer"
                                  title="Delete Slide"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                                <div className="sm:col-span-4 flex items-center gap-2">
                                  {slide.image ? (
                                    <img
                                      src={slide.image}
                                      alt="Slide"
                                      className="w-12 h-12 object-cover rounded-lg border border-theme-glass shrink-0"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-lg bg-stone-500/20 flex items-center justify-center shrink-0">
                                      <ImageIcon className="w-5 h-5" />
                                    </div>
                                  )}
                                  <label className="px-2.5 py-1.5 rounded-lg bg-theme-accent/15 text-theme-accent hover:bg-theme-accent hover:text-white font-semibold text-[11px] flex items-center gap-1 cursor-pointer shrink-0 transition-all">
                                    <Upload className="w-3 h-3" />
                                    <span>
                                      {uploadingField === `slide-${sIdx}` ? '...' : 'Upload'}
                                    </span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleFileUpload(
                                            `slide-${sIdx}`,
                                            (url) => updateSectionArrayItem(secKey, 'slides', sIdx, 'image', url),
                                            file
                                          );
                                        }
                                      }}
                                    />
                                  </label>
                                </div>

                                <div className="sm:col-span-8 space-y-1">
                                  <input
                                    type="text"
                                    value={slide.image || ''}
                                    onChange={(e) => updateSectionArrayItem(secKey, 'slides', sIdx, 'image', e.target.value)}
                                    placeholder="Image URL..."
                                    className="w-full px-3 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-xs"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                <input
                                  type="text"
                                  value={slide.title || ''}
                                  onChange={(e) => updateSectionArrayItem(secKey, 'slides', sIdx, 'title', e.target.value)}
                                  placeholder="Slide Headline Title"
                                  className="w-full px-3 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-xs font-semibold"
                                />
                                <input
                                  type="text"
                                  value={slide.subtext || ''}
                                  onChange={(e) => updateSectionArrayItem(secKey, 'slides', sIdx, 'subtext', e.target.value)}
                                  placeholder="Subtext / Description"
                                  className="w-full px-3 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-xs"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : secKey === 'begin_portals' && Array.isArray(content.portals) ? (
                      /* 2. Where Would You Like to Begin Portals */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-theme-accent">
                            &quot;Where would you like to begin?&quot; Entry Cards ({content.portals.length} Cards)
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              addSectionArrayItem(secKey, 'portals', {
                                title: 'New Category Card',
                                subtitle: 'Card description...',
                                image: '/static/assets/images/Home_page_banner.jpeg',
                                link: '/shop',
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-theme-accent/15 text-theme-accent font-semibold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Card</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {content.portals.map((pCard: any, pIdx: number) => (
                            <div
                              key={pIdx}
                              className="p-3.5 rounded-xl bg-theme-card border border-theme-glass space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold text-theme-accent">
                                  Card #{pIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeSectionArrayItem(secKey, 'portals', pIdx)}
                                  className="text-red-500 hover:bg-red-500/10 p-1 rounded cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="space-y-2">
                                {pCard.image ? (
                                  <img
                                    src={pCard.image}
                                    alt="Card Preview"
                                    className="w-full h-24 object-cover rounded-lg border border-theme-glass"
                                  />
                                ) : (
                                  <div className="w-full h-24 rounded-lg bg-stone-500/20 flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-theme-muted" />
                                  </div>
                                )}

                                <label className="w-full py-1.5 rounded-lg bg-theme-accent/15 text-theme-accent font-semibold text-[11px] flex items-center justify-center gap-1 cursor-pointer">
                                  <Upload className="w-3 h-3" />
                                  <span>{uploadingField === `portal-${pIdx}` ? 'Uploading...' : 'Upload Image'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handleFileUpload(
                                          `portal-${pIdx}`,
                                          (url) => updateSectionArrayItem(secKey, 'portals', pIdx, 'image', url),
                                          file
                                        );
                                      }
                                    }}
                                  />
                                </label>

                                <input
                                  type="text"
                                  value={pCard.title || ''}
                                  onChange={(e) => updateSectionArrayItem(secKey, 'portals', pIdx, 'title', e.target.value)}
                                  placeholder="Card Title"
                                  className="w-full px-3 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-xs font-bold"
                                />

                                <input
                                  type="text"
                                  value={pCard.subtitle || ''}
                                  onChange={(e) => updateSectionArrayItem(secKey, 'portals', pIdx, 'subtitle', e.target.value)}
                                  placeholder="Subtitle"
                                  className="w-full px-3 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-xs"
                                />

                                <input
                                  type="text"
                                  value={pCard.link || ''}
                                  onChange={(e) => updateSectionArrayItem(secKey, 'portals', pIdx, 'link', e.target.value)}
                                  placeholder="Link (e.g. /shop, /custom-order)"
                                  className="w-full px-3 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-[11px] font-mono"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : secKey === 'detail_plates' && Array.isArray(content.plates) ? (
                      /* 3. Details You Can Feel 9 Detail Plates */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-theme-accent">
                            &quot;Details you can feel before you touch it&quot; Gallery Plates ({content.plates.length} Images)
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              addSectionArrayItem(secKey, 'plates', {
                                src: '/static/assets/images/DA-MD-12-0001.jpg',
                                sku: 'DA-MD-12-0001',
                                name: 'New Artwork Plate',
                                size: '12"',
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-theme-accent/15 text-theme-accent font-semibold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Plate</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {content.plates.map((plate: any, plIdx: number) => (
                            <div
                              key={plIdx}
                              className="p-3.5 rounded-xl bg-theme-card border border-theme-glass space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold text-theme-accent">
                                  Plate #{plIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeSectionArrayItem(secKey, 'plates', plIdx)}
                                  className="text-red-500 hover:bg-red-500/10 p-1 rounded cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="space-y-2">
                                {plate.src ? (
                                  <img
                                    src={plate.src}
                                    alt="Plate Preview"
                                    className="w-full h-24 object-contain rounded-lg border border-theme-glass bg-stone-900/40 p-1"
                                  />
                                ) : (
                                  <div className="w-full h-24 rounded-lg bg-stone-500/20 flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-theme-muted" />
                                  </div>
                                )}

                                <label className="w-full py-1.5 rounded-lg bg-theme-accent/15 text-theme-accent font-semibold text-[11px] flex items-center justify-center gap-1 cursor-pointer">
                                  <Upload className="w-3 h-3" />
                                  <span>{uploadingField === `plate-${plIdx}` ? 'Uploading...' : 'Upload Photo'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handleFileUpload(
                                          `plate-${plIdx}`,
                                          (url) => updateSectionArrayItem(secKey, 'plates', plIdx, 'src', url),
                                          file
                                        );
                                      }
                                    }}
                                  />
                                </label>

                                <input
                                  type="text"
                                  value={plate.name || ''}
                                  onChange={(e) => updateSectionArrayItem(secKey, 'plates', plIdx, 'name', e.target.value)}
                                  placeholder="Artwork Title"
                                  className="w-full px-3 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-xs font-semibold"
                                />

                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    value={plate.size || ''}
                                    onChange={(e) => updateSectionArrayItem(secKey, 'plates', plIdx, 'size', e.target.value)}
                                    placeholder="Size (e.g. 12&quot;)"
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-[11px]"
                                  />
                                  <input
                                    type="text"
                                    value={plate.sku || ''}
                                    onChange={(e) => updateSectionArrayItem(secKey, 'plates', plIdx, 'sku', e.target.value)}
                                    placeholder="SKU"
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-[11px] font-mono"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : secKey === 'trust_boxes' && Array.isArray(content.boxes) ? (
                      /* 4. 4 Trust Text Boxes */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-theme-accent">
                            4 Craftsmanship &amp; Trust Text Boxes ({content.boxes.length} Boxes)
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              addSectionArrayItem(secKey, 'boxes', {
                                title: 'New Trust Guarantee',
                                description: 'Description of studio craft, delivery, or support...',
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-theme-accent/15 text-theme-accent font-semibold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Box</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {content.boxes.map((tBox: any, bIdx: number) => (
                            <div
                              key={bIdx}
                              className="p-3.5 rounded-xl bg-theme-card border border-theme-glass space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold text-theme-accent">
                                  Box #{bIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeSectionArrayItem(secKey, 'boxes', bIdx)}
                                  className="text-red-500 hover:bg-red-500/10 p-1 rounded cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <input
                                type="text"
                                value={tBox.title || ''}
                                onChange={(e) => updateSectionArrayItem(secKey, 'boxes', bIdx, 'title', e.target.value)}
                                placeholder="Box Heading"
                                className="w-full px-3 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-xs font-bold"
                              />

                              <textarea
                                rows={2}
                                value={tBox.description || ''}
                                onChange={(e) => updateSectionArrayItem(secKey, 'boxes', bIdx, 'description', e.target.value)}
                                placeholder="Description text..."
                                className="w-full px-3 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-xs leading-relaxed"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Standard Primitive Key/Value Field Editor */
                      sortSectionKeys(secKey, Object.entries(content)).map(([fKey, fVal]) => {
                        const isImage =
                          (fKey.includes('image') || fKey.includes('photo') || fKey.includes('banner') || fKey.includes('src')) &&
                          !fKey.includes('label') &&
                          !fKey.includes('note') &&
                          !fKey.includes('text') &&
                          !fKey.includes('title') &&
                          !fKey.includes('heading') &&
                          !fKey.includes('requirement');
                        const isLong =
                          fKey.includes('description') ||
                          fKey.includes('paragraph') ||
                          fKey.includes('content') ||
                          fKey.includes('intro') ||
                          fKey.includes('story') ||
                          fKey.includes('quote') ||
                          fKey.includes('subtitle') ||
                          fKey.includes('note') ||
                          fKey.includes('placeholder') ||
                          fKey.includes('instructions');

                        return (
                          <div key={fKey} className="space-y-1.5">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-theme-muted">
                              {fKey.replace(/_/g, ' ')}
                            </label>

                            {isImage ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  {fVal && typeof fVal === 'string' ? (
                                    <img
                                      src={fVal}
                                      alt="Field Preview"
                                      className="w-16 h-16 object-cover rounded-xl border border-theme-glass shrink-0"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 rounded-xl bg-theme-card flex items-center justify-center text-theme-muted border border-theme-glass shrink-0">
                                      <ImageIcon className="w-6 h-6" />
                                    </div>
                                  )}

                                  <input
                                    type="text"
                                    value={String(fVal ?? '')}
                                    onChange={(e) => updateSectionField(secKey, fKey, e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-xl bg-theme-card border border-theme-glass text-theme-primary text-xs"
                                    placeholder="Image URL or upload path..."
                                  />

                                  <label className="px-3 py-2 rounded-xl bg-theme-accent/15 text-theme-accent hover:bg-theme-accent hover:text-white font-semibold text-xs flex items-center gap-1 cursor-pointer shrink-0 transition-all">
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>
                                      {uploadingField === `${secKey}-${fKey}` ? 'Uploading...' : 'Upload'}
                                    </span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleFileUpload(
                                            `${secKey}-${fKey}`,
                                            (url) => updateSectionField(secKey, fKey, url),
                                            file
                                          );
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>
                            ) : isLong ? (
                              <textarea
                                rows={3}
                                value={String(fVal ?? '')}
                                onChange={(e) => updateSectionField(secKey, fKey, e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-theme-card border border-theme-glass text-theme-primary text-xs leading-relaxed focus:outline-none focus:border-theme-accent"
                              />
                            ) : typeof fVal === 'number' ? (
                              <input
                                type="number"
                                value={Number(fVal)}
                                onChange={(e) => updateSectionField(secKey, fKey, Number(e.target.value))}
                                className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass text-theme-primary text-xs focus:outline-none focus:border-theme-accent"
                              />
                            ) : (
                              <input
                                type="text"
                                value={String(fVal ?? '')}
                                onChange={(e) => updateSectionField(secKey, fKey, e.target.value)}
                                className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass text-theme-primary text-xs focus:outline-none focus:border-theme-accent"
                              />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Embedded Testimonials Catalog Manager */}
          {selectedSlug === 'testimonials' && (
            <div className="pt-8 border-t border-theme-glass space-y-4">
              <div className="p-4 rounded-2xl bg-theme-accent/10 border border-theme-glass flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base font-bold text-theme-primary">
                    Collector Testimonials & Reviews Item Catalog
                  </h4>
                  <p className="text-xs text-theme-muted">
                    Add, edit, remove, and toggle publish status for individual customer reviews displayed on the website.
                  </p>
                </div>
              </div>
              <AdminTestimonials token={token} />
            </div>
          )}

          {/* Embedded FAQs Catalog Manager */}
          {selectedSlug === 'faqs' && (
            <div className="pt-8 border-t border-theme-glass space-y-4">
              <div className="p-4 rounded-2xl bg-theme-accent/10 border border-theme-glass flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base font-bold text-theme-primary">
                    Frequently Asked Questions Item Catalog
                  </h4>
                  <p className="text-xs text-theme-muted">
                    Add, edit, remove, reorder, and categorize FAQ entries displayed on the website.
                  </p>
                </div>
              </div>
              <AdminFAQs token={token} />
            </div>
          )}

          {/* SEO & Meta Tags Editor */}
          <div className="p-6 rounded-2xl bg-theme-page border border-theme-glass space-y-4">
            <h4 className="font-serif text-base font-bold text-theme-primary flex items-center gap-2">
              <FileText className="w-4 h-4 text-theme-accent" />
              <span>Page Title &amp; SEO Meta Tags</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-theme-primary mb-1">Page Title *</label>
                <input
                  type="text"
                  value={activePage.title}
                  onChange={(e) => {
                    setActivePage({ ...activePage, title: e.target.value });
                    setIsDirty(true);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass text-theme-primary focus:outline-none focus:border-theme-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-theme-primary mb-1">SEO Title Tag (&lt;title&gt;)</label>
                <input
                  type="text"
                  value={activePage.seo_title || ''}
                  onChange={(e) => {
                    setActivePage({ ...activePage, seo_title: e.target.value });
                    setIsDirty(true);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass text-theme-primary focus:outline-none focus:border-theme-accent"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-theme-primary mb-1">Meta Description</label>
              <textarea
                rows={2}
                value={activePage.meta_description || ''}
                onChange={(e) => {
                  setActivePage({ ...activePage, meta_description: e.target.value });
                  setIsDirty(true);
                }}
                className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass text-theme-primary resize-none focus:outline-none focus:border-theme-accent"
              />
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="pt-4 border-t border-theme-glass flex items-center justify-between">
            <p className="text-xs text-theme-muted">
              Click &quot;Save &amp; Publish Changes&quot; to push edits live.
            </p>
            <button
              type="button"
              disabled={!isDirty || saving}
              onClick={() => handleSave('published')}
              className={`px-6 py-2.5 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-all ${
                !isDirty
                  ? 'bg-stone-500/20 text-stone-400 cursor-not-allowed border border-white/10'
                  : 'bg-[#C85A32] hover:bg-[#A03E1B] text-white cursor-pointer shadow-md transform hover:-translate-y-0.5'
              }`}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving to Cloud...</span>
                </>
              ) : !isDirty ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save &amp; Publish Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
