import React, { useState } from 'react';
import {
  Settings,
  DollarSign,
  Moon,
  Sun,
  User,
  ShieldCheck,
  Check,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { User as UserType } from '../types/index.ts';
import { SUPPORTED_CURRENCIES } from '../lib/currency.ts';
import { api } from '../lib/api.ts';

interface SettingsViewProps {
  user: UserType | null;
  isDark: boolean;
  onToggleTheme: () => void;
  onUserUpdated: (u: UserType) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  isDark,
  onToggleTheme,
  onUserUpdated,
}) => {
  const [name, setName] = useState(user?.name || 'Musab Gafar');
  const [currency, setCurrency] = useState(user?.defaultCurrency || 'NGN');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const updated = await api.updateUser({
        name,
        defaultCurrency: currency,
      });
      onUserUpdated(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-xl shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <span>Account & System Settings</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage your personal profile, primary currency formatting, and AI model preferences
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Settings saved successfully. All financial metrics updated.</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          {/* User Profile */}
          <div className="space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-white">Profile Information</h3>
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg dark:text-white"
              />
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || 'gafarmusab93@gmail.com'}
                className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">Isolated user workspace identifier</span>
            </div>
          </div>

          {/* Currency Configuration */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-white">Primary Operating Currency</h3>
            <p className="text-[11px] text-neutral-500">
              SpendWise formats figures using proper localized standards (e.g. ₦1,500.00). Changing currency does not convert historical data silently.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SUPPORTED_CURRENCIES.map(c => {
                const isSelected = currency === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCurrency(c.code)}
                    className={`p-3 text-left border rounded-lg transition-colors ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                        : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <div className="font-bold text-sm font-mono tabular-nums">{c.symbol} {c.code}</div>
                    <div className="text-[10px] text-neutral-500 truncate mt-0.5">{c.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Mode Toggle */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">Appearance & Theme</h3>
              <p className="text-[11px] text-neutral-500">Toggle between Light and Dark interface themes</p>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>

          {/* AI Architecture Information */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
            <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>Gemma 4 AI Engine Configuration</span>
            </h3>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-500">Integrated Model:</span>
                <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                  Google Gemma 4 / Gemini API (@google/genai)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Server Proxy:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Active & Isolated (Zero browser key exposure)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Fallback Mechanism:</span>
                <span className="text-neutral-600 dark:text-neutral-400">
                  Deterministic Financial Engine Grounded in Database
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
