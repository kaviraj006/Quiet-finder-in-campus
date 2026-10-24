'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { store } from '@/lib/store';
import { AppSettings } from '@/lib/types';
import {
  Sliders,
  FileSpreadsheet,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Save,
  FlaskConical,
  Shield,
  Download,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(store.getSettings());
  const [showDemo, setShowDemo] = useState<boolean>(store.isShowDemoData());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setSettings(store.getSettings());
    setShowDemo(store.isShowDemoData());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSettings(settings);
    store.setShowDemoData(showDemo);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetDemo = () => {
    if (confirm('Reload the 216 paper seed demo readings? Genuine contributions will be preserved.')) {
      store.resetDemoData();
      setMessage('Simulated 216 paper demo readings successfully reloaded.');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handlePurgeDemo = () => {
    if (confirm('Purge all simulated demo records? Only genuine student readings will remain.')) {
      store.purgeDemoData();
      setMessage('All simulated demo records purged. Clean environment active.');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const exportCSV = () => {
    const readings = store.getReadings({ includeDemo: showDemo });
    const spots = store.getSpots(true);
    const getSpotName = (id: string) => spots.find((s) => s.id === id)?.name || id;

    const headers = [
      'reading_id',
      'spot_id',
      'spot_name',
      'observation_time_iso',
      'time_slot_index',
      'method',
      'db_level',
      'manual_estimate',
      'duration_seconds',
      'is_demo',
      'review_status',
    ];

    const rows = readings.map((r) => [
      r.id,
      r.spot_id,
      `"${getSpotName(r.spot_id).replace(/"/g, '""')}"`,
      r.observation_time,
      r.time_slot,
      r.method,
      r.db_level !== null ? r.db_level : '',
      r.estimate_level || '',
      r.duration_seconds,
      r.is_demo ? 'true' : 'false',
      r.review_status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quiet_finder_vit_chennai_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                Administration
              </span>
              <span className="text-xs text-slate-400">System Parameters & Seeds</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              System Settings & Data Management
            </h1>
          </div>

          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Noise Data (CSV)</span>
          </button>
        </div>

        {message && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {/* Configuration Form */}
        <form
          onSubmit={handleSave}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5"
        >
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-teal-700" />
            <span>Confidence Thresholds & Validation Bounds</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Minimum Sample Threshold
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={settings.minSamplesThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, minSamplesThreshold: parseInt(e.target.value) || 3 })
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Number of readings required per slot to display "Sufficient Sample" badge.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Allowed Institutional Domain
              </label>
              <input
                type="text"
                value={settings.allowedEmailDomain}
                onChange={(e) =>
                  setSettings({ ...settings, allowedEmailDomain: e.target.value.trim() })
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Allowed email domain for verified student signups.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Visual Scale Minimum dB
              </label>
              <input
                type="number"
                value={settings.visualScaleMinDb}
                onChange={(e) =>
                  setSettings({ ...settings, visualScaleMinDb: parseInt(e.target.value) || 35 })
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Teal color baseline</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Visual Scale Maximum dB
              </label>
              <input
                type="number"
                value={settings.visualScaleMaxDb}
                onChange={(e) =>
                  setSettings({ ...settings, visualScaleMaxDb: parseInt(e.target.value) || 85 })
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Red color peak</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Settings saved!
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>

        {/* Demo Data Management Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <FlaskConical className="w-5 h-5" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Paper Demo Data Isolation & Reset Controls
            </h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            The project paper contains simulated observations for 9 campus spots across 8 time slots (216 readings). Per master specification, demo data is isolated from real community measurements and can be purged or re-seeded on demand without affecting genuine student contributions.
          </p>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                Display Demo Data in Map & Rankings
              </span>
              <p className="text-[11px] text-slate-400">
                When disabled, the app operates strictly on genuine student observations.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showDemo}
                onChange={(e) => {
                  setShowDemo(e.target.checked);
                  store.setShowDemoData(e.target.checked);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-800"></div>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleResetDemo}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-teal-600" />
              <span>Reload Paper 216 Seed Readings</span>
            </button>

            <button
              onClick={handlePurgeDemo}
              className="px-4 py-2 border border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Purge Demo Records (Clean Real-Data Only)</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
