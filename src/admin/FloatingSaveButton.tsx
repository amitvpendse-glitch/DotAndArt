import React from 'react';
import { Save } from 'lucide-react';

interface FloatingSaveButtonProps {
  onSave: () => void;
  isSaving?: boolean;
}

export const FloatingSaveButton: React.FC<FloatingSaveButtonProps> = ({ onSave, isSaving }) => {
  return (
    <button
      onClick={onSave}
      disabled={isSaving}
      className="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-6 py-3 rounded-full bg-theme-accent text-white shadow-xl hover:bg-theme-accent/90 transition-all cursor-pointer disabled:opacity-50"
    >
      <Save className="w-5 h-5" />
      <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
    </button>
  );
};
