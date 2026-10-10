import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, HelpCircle } from 'lucide-react';
import { FAQ } from '../types';
import { safeFetchJson, safeResponseJson } from '../lib/safeFetch';

interface AdminFAQsProps {
  token: string;
}

export const AdminFAQs: React.FC<AdminFAQsProps> = ({ token }) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('Ordering');
  const [isPublished, setIsPublished] = useState(true);

  const fetchFaqs = () => {
    setLoading(true);
    safeFetchJson<FAQ[]>('/api/faqs')
      .then((data) => setFaqs(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleOpenCreate = () => {
    setEditing(null);
    setQuestion('');
    setAnswer('');
    setCategory('Ordering');
    setIsPublished(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (f: FAQ) => {
    setEditing(f);
    setQuestion(f.question);
    setAnswer(f.answer);
    setCategory(f.category);
    setIsPublished(f.is_published);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editing ? `/api/admin/faqs/${editing.id}` : '/api/admin/faqs';
    const method = editing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question,
          answer,
          category,
          is_published: isPublished,
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchFaqs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this FAQ entry?')) return;
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchFaqs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-theme-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-theme-muted">Loading FAQs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-theme-primary">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-theme-primary">FAQ Management</h2>
          <p className="text-xs text-theme-muted">
            Manage answers about sizes, advance payment terms, creation times, and worldwide courier logistics.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-theme-accent hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add FAQ Entry</span>
        </button>
      </div>

      <div className="glass-card rounded-2xl border border-theme-glass craft-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-theme-page text-theme-muted uppercase tracking-wider font-semibold border-b border-theme-glass">
              <tr>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Question & Answer</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-glass">
              {faqs.map((f) => (
                <tr key={f.id} className="hover:bg-theme-accent/5">
                  <td className="px-5 py-4 font-semibold text-theme-accent align-top whitespace-nowrap">
                    {f.category}
                  </td>
                  <td className="px-5 py-4 space-y-1">
                    <p className="font-serif font-semibold text-theme-primary text-sm">
                      {f.question}
                    </p>
                    <p className="text-theme-muted font-light leading-relaxed line-clamp-2">
                      {f.answer}
                    </p>
                  </td>
                  <td className="px-5 py-4 align-top">
                    {f.is_published ? (
                      <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-300 text-[10px] font-semibold border border-green-500/20">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-600 dark:text-gray-400 text-[10px] font-semibold border border-gray-500/20">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right space-x-1 align-top whitespace-nowrap">
                    <button
                      onClick={() => handleOpenEdit(f)}
                      className="p-1.5 rounded text-theme-primary hover:bg-theme-accent/15 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="p-1.5 rounded text-red-500 hover:bg-red-500/20 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="max-w-lg w-full glass-panel rounded-3xl border border-theme-glass craft-shadow p-6 space-y-4 text-xs text-theme-primary">
            <h3 className="font-serif text-lg font-bold text-theme-primary">
              {editing ? 'Edit FAQ Entry' : 'Create FAQ Entry'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold text-theme-primary mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Ordering & Payment, Shipping, Framing..."
                  className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-theme-primary mb-1">Question *</label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-theme-primary mb-1">Answer *</label>
                <textarea
                  rows={4}
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary resize-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pubFaqCheck"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded text-theme-accent cursor-pointer"
                />
                <label htmlFor="pubFaqCheck" className="font-semibold text-theme-primary cursor-pointer">
                  Publish in FAQ section
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
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
