import React, { useState, useEffect } from 'react';
import {
  Package,
  CheckCircle,
  EyeOff,
  FolderTree,
  FileText,
  AlertTriangle,
  History,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { AuditLog } from '../types';
import { safeFetchJson } from '../lib/safeFetch';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
  token: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab, token }) => {
  const [stats, setStats] = useState<{
    totalProducts: number;
    publishedProducts: number;
    unpublishedProducts: number;
    totalCategories: number;
    missingImages: number;
    recentLogs: AuditLog[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    safeFetchJson<any>('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    }, null)
      .then((data) => {
        if (data) setStats(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-theme-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-theme-muted">Loading dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-theme-dark text-white craft-shadow border border-theme-glass">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs text-theme-accent border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Handmade Studio CMS Active</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-white">
            Dot And Art Administration
          </h1>
          <p className="text-xs text-theme-muted font-light max-w-xl opacity-90">
            Real-time control over catalog products, pricing, high-resolution media, and editable website pages.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigateTab('products')}
            className="px-4 py-2.5 rounded-xl bg-theme-accent hover:opacity-90 text-white text-xs font-semibold transition-opacity flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
          <button
            onClick={() => onNavigateTab('media')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/20 cursor-pointer"
          >
            <span>Upload Artwork Media</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Products */}
        <div
          onClick={() => onNavigateTab('products')}
          className="p-5 rounded-2xl glass-card border border-theme-glass craft-shadow hover:shadow-md transition-shadow cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-theme-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
            <Package className="w-4 h-4 text-theme-accent" />
          </div>
          <div className="font-serif text-3xl font-bold text-theme-primary">
            {stats?.totalProducts ?? 0}
          </div>
          <p className="text-[11px] text-theme-muted">Initial catalog items</p>
        </div>

        {/* Published */}
        <div
          onClick={() => onNavigateTab('products')}
          className="p-5 rounded-2xl glass-card border border-theme-glass craft-shadow hover:shadow-md transition-shadow cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-theme-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Published</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <div className="font-serif text-3xl font-bold text-green-600 dark:text-green-400">
            {stats?.publishedProducts ?? 0}
          </div>
          <p className="text-[11px] text-theme-muted">Live on public shop</p>
        </div>

        {/* Unpublished / Draft */}
        <div
          onClick={() => onNavigateTab('products')}
          className="p-5 rounded-2xl glass-card border border-theme-glass craft-shadow hover:shadow-md transition-shadow cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-theme-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Unpublished</span>
            <EyeOff className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-serif text-3xl font-bold text-amber-600 dark:text-amber-400">
            {stats?.unpublishedProducts ?? 0}
          </div>
          <p className="text-[11px] text-theme-muted">Hidden from customer view</p>
        </div>

        {/* Website Pages */}
        <div
          onClick={() => onNavigateTab('pages')}
          className="p-5 rounded-2xl glass-card border border-theme-glass craft-shadow hover:shadow-md transition-shadow cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-theme-muted">
            <span className="text-xs font-bold uppercase tracking-wider">CMS Pages</span>
            <FileText className="w-4 h-4 text-theme-accent" />
          </div>
          <div className="font-serif text-3xl font-bold text-theme-primary">
            6 Core
          </div>
          <p className="text-[11px] text-theme-muted">Home, Catalog, Bespoke, Gallery, About, Contact</p>
        </div>

        {/* Missing Photos Warning */}
        <div
          onClick={() => onNavigateTab('products')}
          className="p-5 rounded-2xl glass-card border border-theme-glass craft-shadow hover:shadow-md transition-shadow cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-theme-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Awaiting Photos</span>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="font-serif text-3xl font-bold text-orange-600 dark:text-orange-400">
            {stats?.missingImages ?? 0}
          </div>
          <p className="text-[11px] text-theme-muted">Showing graceful placeholders</p>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => onNavigateTab('importer')}
          className="p-6 rounded-2xl glass-card border border-theme-glass craft-shadow hover:border-theme-accent cursor-pointer transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-theme-accent/15 text-theme-accent flex items-center justify-center group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-theme-primary">
            Catalog Importer & Sync
          </h3>
          <p className="text-xs text-theme-muted leading-relaxed">
            Re-synchronize original workbook products or upload updated CSV/Excel spreadsheets with duplicate-safe idempotent checks.
          </p>
          <span className="text-xs font-bold text-theme-accent flex items-center gap-1 pt-1">
            Open Importer <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('pages')}
          className="p-6 rounded-2xl glass-card border border-theme-glass craft-shadow hover:border-theme-accent cursor-pointer transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-theme-accent/15 text-theme-accent flex items-center justify-center group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-theme-primary">
            Website Pages CMS
          </h3>
          <p className="text-xs text-theme-muted leading-relaxed">
            Edit home hero headlines, subtitles, craft philosophy narratives, bulk order info, and legal policies without touching code.
          </p>
          <span className="text-xs font-bold text-theme-accent flex items-center gap-1 pt-1">
            Edit Pages <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('security')}
          className="p-6 rounded-2xl glass-card border border-theme-glass craft-shadow hover:border-theme-accent cursor-pointer transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-theme-accent/15 text-theme-accent flex items-center justify-center group-hover:scale-105 transition-transform">
            <History className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-theme-primary">
            Security & Change PIN
          </h3>
          <p className="text-xs text-theme-muted leading-relaxed">
            Update your four-digit administrator login PIN and credentials.
          </p>
          <span className="text-xs font-bold text-theme-accent flex items-center gap-1 pt-1">
            Security Settings <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
