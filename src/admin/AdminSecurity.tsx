import React, { useState } from 'react';
import { KeyRound, ShieldCheck, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { safeResponseJson } from '../lib/safeFetch';

interface AdminSecurityProps {
  token: string;
  onPinChanged: () => void;
}

export const AdminSecurity: React.FC<AdminSecurityProps> = ({ token, onPinChanged }) => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setErrorMsg('New PIN must be exactly 4 numeric digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setErrorMsg('New PIN and confirmation PIN do not match.');
      return;
    }

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/change-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_pin: currentPin,
          new_pin: newPin,
          confirm_pin: confirmPin,
        }),
      });

      const data = await safeResponseJson(res, {});
      if (res.ok) {
        setSuccessMsg('PIN successfully updated. You will now be redirected to sign in with your new PIN.');
        setTimeout(() => {
          onPinChanged();
        }, 2000);
      } else {
        setErrorMsg(data?.error || 'Failed to update PIN. Please verify your current PIN.');
      }
    } catch {
      setErrorMsg('Network error.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#2C2724]">Security & PIN Management</h2>
        <p className="text-xs text-[#7D6B5D]">
          Update your server-validated four-digit administrator credentials and review audit history logs.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Change PIN Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3D4C4] craft-shadow space-y-5 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FAF0E6] text-[#C85A32] flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#2C2724]">
              Change Administrator 4-Digit PIN
            </h3>
            <p className="text-[#7D6B5D]">
              Requires the existing PIN to verify identity. Changing the PIN immediately invalidates all active sessions.
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePin} className="space-y-4 max-w-md pt-2">
          <div>
            <label className="block font-semibold text-[#4A3E36] mb-1">
              Current 4-Digit PIN *
            </label>
            <input
              type="password"
              maxLength={4}
              required
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8C7B5] font-mono text-center text-lg tracking-widest focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#4A3E36] mb-1">
                New 4-Digit PIN *
              </label>
              <input
                type="password"
                maxLength={4}
                required
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8C7B5] font-mono text-center text-lg tracking-widest focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#4A3E36] mb-1">
                Confirm New PIN *
              </label>
              <input
                type="password"
                maxLength={4}
                required
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8C7B5] font-mono text-center text-lg tracking-widest focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || currentPin.length !== 4 || newPin.length !== 4}
            className="w-full py-3 px-6 rounded-full bg-[#C85A32] hover:bg-[#A03E1B] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Validating & Updating...' : 'Update Security PIN'}
          </button>
        </form>
      </div>
    </div>
  );
};
