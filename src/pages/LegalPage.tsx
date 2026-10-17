import React, { useState, useEffect } from 'react';
import { WebsitePage, WebsiteSettings } from '../types';
import { safeFetchJson } from '../lib/safeFetch';
import { usePageSeo } from '../lib/usePageSeo';

interface LegalPageProps {
  slug: string;
}

export const LegalPage: React.FC<LegalPageProps> = ({ slug }) => {
  const { page, loading } = usePageSeo(slug, `${slug.replace(/-/g, ' ')} — Dot And Art`);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  useEffect(() => {
    safeFetchJson<WebsiteSettings | null>('/api/settings', undefined, null).then((data) => {
      if (data) setSettings(data);
    });
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-[#7D6B5D]">
        Loading policy content...
      </div>
    );
  }

  const legalContent = page?.sections?.find((s) => s.section_type === 'legal_text')?.content_json;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="border-b border-[#E5D7C7] pb-6 space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#A03E1B]">
          Information & Guidelines
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2C2724]">
          {legalContent?.heading || page?.title || 'Policy Information'}
        </h1>
        {legalContent?.effective_date && (
          <p className="text-xs text-[#8C7667]">{legalContent.effective_date}</p>
        )}
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E3D4C4] craft-shadow space-y-6 text-xs sm:text-sm text-[#4A3E36] leading-relaxed font-light">
        {legalContent?.intro && (
          <p className="font-normal text-[#2C2724] pb-4 border-b border-[#F0E5D8]">
            {legalContent.intro}
          </p>
        )}

        {legalContent?.sections &&
          legalContent.sections.map((sec: any, idx: number) => (
            <div key={idx} className="space-y-2">
              <h3 className="font-serif text-base sm:text-lg font-semibold text-[#2C2724]">
                {sec.title}
              </h3>
              <p className="text-[#66574D]">{sec.body}</p>
            </div>
          ))}

        <div className="pt-6 border-t border-[#F0E5D8] text-[11px] text-[#8C7667] italic">
          Disclaimer: This policy document represents editable studio terms and conditions for {settings?.business_name || 'Dot And Art'} and is subject to updates. For any questions, please contact <a href={`mailto:${settings?.email || 'shitalthosar@yahoo.com'}`} className="underline hover:text-[#A03E1B]">{settings?.email || 'shitalthosar@yahoo.com'}</a>.
        </div>
      </div>
    </div>
  );
};
