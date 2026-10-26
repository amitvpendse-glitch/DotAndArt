import React from 'react';
import { Save, CheckCircle2 } from 'lucide-react';

interface FloatingSaveButtonProps {
  onSave: () => void;
  isSaving?: boolean;
  isDirty?: boolean;
  disabled?: boolean;
}

export const FloatingSaveButton: React.FC<FloatingSaveButtonProps> = ({
  onSave,
  isSaving = false,
  isDirty = false,
  disabled,
}) => {
  const isInactive = disabled !== undefined ? disabled : (!isDirty && !isSaving);

  return (
    <button
      type="button"
      onClick={onSave}
      disabled={isInactive || isSaving}
      className={`fixed bottom-8 right-8 z-50 flex items-center gap-2.5 px-6 py-3.5 rounded-full text-xs font-semibold shadow-2xl transition-all duration-300 ${
        isSaving
          ? 'bg-[#C85A32] text-white cursor-wait opacity-100 shadow-xl'
          : isInactive
          ? 'bg-stone-800/90 text-stone-400 border border-stone-700/60 cursor-not-allowed opacity-75 shadow-none'
          : 'bg-[#C85A32] hover:bg-[#A03E1B] text-white cursor-pointer shadow-2xl transform hover:-translate-y-1 hover:scale-105 active:scale-95 ring-2 ring-orange-500/30'
      }`}
      title={
        isSaving
          ? 'Saving changes to cloud...'
          : isInactive
          ? 'No unsaved changes in admin CMS'
          : 'Click to save changes to cloud database'
      }
    >
      {isSaving ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
          <span className="font-bold tracking-wide">Saving to Cloud...</span>
        </>
      ) : isInactive ? (
        <>
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Saved</span>
        </>
      ) : (
        <>
          <Save className="w-4 h-4 shrink-0" />
          <span className="font-bold tracking-wide">Save Changes</span>
        </>
      )}
    </button>
  );
};
