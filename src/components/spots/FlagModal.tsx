'use client';

import React, { useState } from 'react';
import { store } from '@/lib/store';
import { NoiseReading } from '@/lib/types';
import { AlertTriangle, X, CheckCircle2 } from 'lucide-react';

interface FlagModalProps {
  reading: NoiseReading | null;
  onClose: () => void;
}

export default function FlagModal({ reading, onClose }: FlagModalProps) {
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!reading) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    store.flagReading(reading.id, reason.trim());
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Report Submitted</h4>
            <p className="text-xs text-slate-500 mt-1">
              Thank you for keeping campus data clean. A moderator will review this reading.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Flag Suspicious Reading
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Report implausible values, intentional distortions, or spam entries.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs">
              <p>
                <strong>Reading:</strong> {reading.db_level ? `${reading.db_level} dB(A)` : reading.estimate_level}
              </p>
              <p className="text-slate-500 mt-0.5">Author: {reading.author_name || 'Anonymous'}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reason for report:
              </label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Impossible 20 dB reading in a crowded dining hall, or duplicate spam entry."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
