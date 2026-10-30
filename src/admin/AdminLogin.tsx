import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, ArrowRight, ArrowLeft, Home } from 'lucide-react';
import { safeFetchJson } from '../lib/safeFetch';

interface AdminLoginProps {
  onLoginSuccess: (token: string, username: string) => void;
  onBackToSite?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToSite }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lockoutRemaining, setLockoutRemaining] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount so typing works immediately
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDigit = (d: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + d);
      setErrorMessage('');
    }
    inputRef.current?.focus();
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setPin('');
    setErrorMessage('');
    inputRef.current?.focus();
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length !== 4) {
      setErrorMessage('Please enter all 4 digits of your administrator PIN.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const data = await safeFetchJson<{
        success?: boolean;
        token?: string;
        username?: string;
        error?: string;
        retry_after_seconds?: number;
      }>(
        '/api/admin/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin }),
        },
        null
      );

      if (data && data.token && data.success !== false) {
        sessionStorage.setItem('dot_admin_token', data.token);
        onLoginSuccess(data.token, data.username || 'admin');
        return;
      }

      if (data?.retry_after_seconds) {
        setLockoutRemaining(data.retry_after_seconds);
      }
      setErrorMessage(data?.error || 'Authentication failed. Please check your PIN.');
      setPin('');
    } catch (err) {
      setErrorMessage('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (onBackToSite) {
      onBackToSite();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative bg-theme-page">
      {/* Top Back to Website Bar */}
      <div className="absolute top-6 left-6 z-20">
        <button
          type="button"
          onClick={handleGoBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card hover:bg-theme-accent hover:text-white border border-theme-glass text-xs font-semibold text-theme-primary transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Website</span>
        </button>
      </div>

      {/* Top Center Brand Logo Header */}
      <div
        onClick={handleGoBack}
        className="flex flex-col items-center justify-center mb-6 z-20 cursor-pointer group select-none"
      >
        <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-theme-accent/30 shadow-2xl group-hover:scale-105 transition-transform bg-white">
          <img
            src="/static/assets/images/DotAndArt_Logo.jpeg"
            alt="Dot And Art Studio Logo"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = '/logo.png'; }}
          />
        </div>
        <span className="font-serif font-bold text-xl text-theme-primary mt-2.5 tracking-wide group-hover:text-theme-accent transition-colors">
          Dot And Art Studio
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        onClick={handleContainerClick}
        className="max-w-md w-full glass-card rounded-3xl border border-theme-glass craft-shadow p-8 sm:p-10 space-y-7 text-center text-theme-primary relative"
      >
        {/* Header Icon */}
        <div className="space-y-3">
          <div className="w-36 h-36 mx-auto flex items-center justify-center transition-transform hover:scale-105 filter drop-shadow-xl">
            <img
              src="/static/assets/images/DotAndArt_Logo.jpeg"
              alt="Dot And Art Logo"
              className="w-full h-full object-cover rounded-full select-none ring-4 ring-theme-accent/20 shadow-lg"
              onError={(e) => { e.currentTarget.src = '/logo.png'; }}
            />
          </div>
          <h2 className="font-serif text-3xl font-semibold text-theme-primary">
            Dot And Art CMS
          </h2>
          <p className="text-xs text-theme-muted max-w-xs mx-auto">
            Protected administrative console. Enter your four-digit security PIN using your keyboard or on-screen keypad.
          </p>
        </div>

        {/* Error / Lockout Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs flex items-center gap-2 text-left">
            <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Masked PIN Display with Active Keyboard Input */}
        <div className="space-y-2 relative">
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 4);
              setPin(val);
              setErrorMessage('');
            }}
            autoFocus
            aria-label="Admin Security PIN"
            className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer focus:outline-none"
          />
          <div className="flex justify-center gap-4 py-3 pointer-events-none">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-xl font-bold transition-all ${
                    isFilled
                      ? 'border-theme-accent bg-theme-accent/15 text-theme-accent scale-105 shadow-sm'
                      : 'border-theme-glass bg-theme-page text-transparent'
                  }`}
                >
                  {isFilled ? '●' : '—'}
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-theme-muted">
            Keyboard typing is active. Press <kbd className="px-1.5 py-0.5 rounded bg-theme-glass font-mono text-[10px]">Enter</kbd> to log in.
          </p>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto z-30 relative">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={loading || pin.length >= 4}
              onClick={(e) => {
                e.stopPropagation();
                handleDigit(digit);
              }}
              className="h-12 rounded-xl glass-button text-theme-primary font-semibold text-lg border border-theme-glass transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            disabled={loading || pin.length === 0}
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="h-12 rounded-xl glass-button hover:bg-red-500/20 hover:text-red-500 text-theme-muted text-xs font-semibold border border-theme-glass transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            disabled={loading || pin.length >= 4}
            onClick={(e) => {
              e.stopPropagation();
              handleDigit('0');
            }}
            className="h-12 rounded-xl glass-button text-theme-primary font-semibold text-lg border border-theme-glass transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            disabled={loading || pin.length === 0}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="h-12 rounded-xl glass-button text-theme-muted text-xs font-semibold border border-theme-glass transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            ⌫
          </button>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading || pin.length !== 4}
            className="w-full py-3.5 px-6 rounded-full bg-theme-accent hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer z-30 relative"
          >
            {loading ? (
              <span>Verifying PIN...</span>
            ) : (
              <>
                <span>Enter Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Alternative explicit Return to Website link inside card */}
        <div className="pt-2 border-t border-theme-glass">
          <button
            type="button"
            onClick={handleGoBack}
            className="text-xs text-theme-muted hover:text-theme-accent flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Changed your mind? Return to main website</span>
          </button>
        </div>
      </form>
    </div>
  );
};

