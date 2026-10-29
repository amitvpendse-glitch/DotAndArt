import React, { createContext, useContext, useEffect } from 'react';
import { getSupabase } from '../lib/firestoreCatalog';

const SyncContext = createContext({});

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    const channels = [
      supabase.channel('products_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        console.log('[Realtime] Products change:', payload);
        window.dispatchEvent(new CustomEvent('app_products_updated'));
      }).subscribe(),
      supabase.channel('categories_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, (payload) => {
        console.log('[Realtime] Categories change:', payload);
        window.dispatchEvent(new CustomEvent('app_categories_updated'));
      }).subscribe(),
      supabase.channel('settings_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload) => {
        console.log('[Realtime] Settings change:', payload);
        window.dispatchEvent(new CustomEvent('app_settings_updated', { detail: payload.new }));
      }).subscribe(),
      supabase.channel('pages_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'pages' }, (payload) => {
        console.log('[Realtime] Pages change:', payload);
        window.dispatchEvent(new CustomEvent('app_pages_updated'));
      }).subscribe(),
      supabase.channel('testimonials_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, (payload) => {
        console.log('[Realtime] Testimonials change:', payload);
        window.dispatchEvent(new CustomEvent('app_testimonials_updated'));
      }).subscribe(),
      supabase.channel('faqs_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'faqs' }, (payload) => {
        console.log('[Realtime] FAQs change:', payload);
        window.dispatchEvent(new CustomEvent('app_faqs_updated'));
      }).subscribe(),
    ];

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
  }, []);

  return <SyncContext.Provider value={{}}>{children}</SyncContext.Provider>;
};

export const useSync = () => useContext(SyncContext);
