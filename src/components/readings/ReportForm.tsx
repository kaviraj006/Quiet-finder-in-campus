'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  CampusSpot,
  ManualEstimateLevel,
  MeasurementMethod,
  SpotCategory,
} from '@/lib/types';
import { MANUAL_ESTIMATES, SPOT_CATEGORIES } from '@/lib/constants';
import { getNoiseCategory, getNoiseColor } from '@/lib/noise';
import { store } from '@/lib/store';
import {
  Volume2,
  Smartphone,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  HelpCircle,
  Info,
  MapPin,
  Loader2,
  Sliders,
} from 'lucide-react';

const reportSchema = z
  .object({
    spotId: z.string().min(1, 'Please select a campus location'),
    newSpotName: z.string().max(50).optional(),
    method: z.enum(['phone_meter', 'manual_estimate']),
    dbLevel: z
      .number()
      .min(25, 'Reading must be at least 25 dB')
      .max(110, 'Reading cannot exceed 110 dB')
      .optional()
      .nullable(),
    estimateLevel: z.enum(['silent', 'quiet', 'chatty', 'loud']).optional().nullable(),
    durationSeconds: z.number().min(5, 'Minimum 5s').max(300, 'Maximum 300s'),
    time: z.string().min(1, 'Time is required'),
    note: z.string().max(200, 'Note too long (max 200 chars)').optional(),
    guidelinesAccepted: z.literal(true, {
      message: 'You must confirm the measurement guidelines',
    }),
  })
  .refine(
    (data) => {
      if (data.method === 'phone_meter') {
        return typeof data.dbLevel === 'number' && !isNaN(data.dbLevel);
      }
      return Boolean(data.estimateLevel);
    },
    {
      message: 'Please provide either a phone meter dB reading or select a subjective estimate',
      path: ['dbLevel'],
    }
  );

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportFormProps {
  initialSpotId?: string;
  onSuccess?: () => void;
}

export default function ReportForm({ initialSpotId, onSuccess }: ReportFormProps) {
  const router = useRouter();
  const spots = store.getSpots();
  const currentUser = store.getCurrentUser();

  const [method, setMethod] = useState<MeasurementMethod>('phone_meter');
  const [sliderDb, setSliderDb] = useState<number>(45);
  const [selectedEstimate, setSelectedEstimate] = useState<ManualEstimateLevel>('quiet');
  const [isSuggestingNewSpot, setIsSuggestingNewSpot] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      spotId: initialSpotId || (spots[0]?.id ?? ''),
      method: 'phone_meter',
      dbLevel: 45,
      estimateLevel: null,
      durationSeconds: 25,
      time: '12:00',
      note: '',
      guidelinesAccepted: true,
    },
  });

  React.useEffect(() => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    setValue('time', timeStr);
  }, [setValue]);

  const selectedSpotId = watch('spotId');
  const activeSpot = spots.find((s) => s.id === selectedSpotId);

  const handleMethodChange = (newMethod: MeasurementMethod) => {
    setMethod(newMethod);
    setValue('method', newMethod);
    if (newMethod === 'phone_meter') {
      setValue('dbLevel', sliderDb);
      setValue('estimateLevel', null);
    } else {
      setValue('dbLevel', null);
      setValue('estimateLevel', selectedEstimate);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSliderDb(val);
    setValue('dbLevel', val);
  };

  const handleEstimatePick = (level: ManualEstimateLevel) => {
    setSelectedEstimate(level);
    setValue('estimateLevel', level);
  };

  const onSubmit = async (data: ReportFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let finalSpotId = data.spotId;

      // Handle new unverified spot suggestion
      if (isSuggestingNewSpot && data.newSpotName?.trim()) {
        const createdSpot = store.addSpot({
          name: data.newSpotName.trim(),
          description: 'Community submitted study spot (Pending coordinates verification)',
          category: 'other',
          latitude: null,
          longitude: null,
          is_verified: false,
          is_active: true,
        });
        finalSpotId = createdSpot.id;
      }

      // Compute observation timestamp from selected time
      const [hours, minutes] = data.time.split(':').map(Number);
      const obsDate = new Date();
      obsDate.setHours(hours, minutes, 0, 0);

      const reading = store.addReading(
        {
          spot_id: finalSpotId,
          method: data.method,
          db_level: data.method === 'phone_meter' ? data.dbLevel : null,
          estimate_level: data.method === 'manual_estimate' ? data.estimateLevel : null,
          duration_seconds: data.durationSeconds,
          observation_time: obsDate.toISOString(),
          note: data.note,
        },
        currentUser
      );

      const spotName = isSuggestingNewSpot
        ? data.newSpotName
        : spots.find((s) => s.id === finalSpotId)?.name || 'Campus Spot';

      setSubmitSuccess(
        `Reading successfully recorded for ${spotName}! Map markers, rankings, and heatmap have been dynamically updated.`
      );

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/spots/${finalSpotId}`);
        }
      }, 1600);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-md max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Report Logged Successfully
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          {submitSuccess}
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
          <span>Redirecting to study space analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm max-w-2xl mx-auto space-y-6"
    >
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-teal-700 dark:text-teal-400" />
          <span>Submit Campus Noise Report</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Crowdsource sound levels to help peers find quiet study environments.
        </p>
      </div>

      {/* 1. Location Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Campus Study Space
        </label>
        {!isSuggestingNewSpot ? (
          <div>
            <select
              {...register('spotId')}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-700"
            >
              {spots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.building_name || 'Campus Space'})
                </option>
              ))}
            </select>
            <div className="flex justify-between items-center mt-1.5 text-xs">
              <span className="text-slate-400">
                {activeSpot?.description || 'Select location'}
              </span>
              <button
                type="button"
                onClick={() => setIsSuggestingNewSpot(true)}
                className="text-teal-700 dark:text-teal-400 font-semibold hover:underline"
              >
                + Not listed? Suggest new spot
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Suggest New Study Space
              </span>
              <button
                type="button"
                onClick={() => setIsSuggestingNewSpot(false)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white underline"
              >
                Back to existing list
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. AB3 5th Floor Lounge, Delta Block Terrace"
              {...register('newSpotName')}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-white"
            />
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Will appear in rankings immediately; marked as "pending verification" on map until an administrator assigns verified GPS coordinates.</span>
            </p>
          </div>
        )}
        {errors.spotId && (
          <p className="text-xs text-rose-600 font-medium">{errors.spotId.message}</p>
        )}
      </div>

      {/* 2. Measurement Method Switcher */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Measurement Method
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleMethodChange('phone_meter')}
            className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              method === 'phone_meter'
                ? 'border-teal-700 bg-teal-50/60 dark:border-teal-500 dark:bg-teal-950/40 ring-1 ring-teal-700'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <Smartphone className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">
                Phone Sound-Meter App
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Primary method: Enter numeric dB(A) reading from Decibel X, NIOSH, or Sound Meter app
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleMethodChange('manual_estimate')}
            className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              method === 'manual_estimate'
                ? 'border-teal-700 bg-teal-50/60 dark:border-teal-500 dark:bg-teal-950/40 ring-1 ring-teal-700'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">
                Manual Estimate
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Fallback: Subjective perception (Silent, Quiet, Chatty, Loud)
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Input Value based on Method */}
      {method === 'phone_meter' ? (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Measured Average Level (LAeq)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {sliderDb} <span className="text-sm font-normal text-slate-500">dB(A)</span>
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-bold border ${
                  getNoiseCategory(sliderDb).badgeBg
                }`}
              >
                {getNoiseCategory(sliderDb).label}
              </span>
            </div>
          </div>

          <input
            type="range"
            min="30"
            max="90"
            step="1"
            value={sliderDb}
            onChange={handleSliderChange}
            className="w-full accent-teal-800 dark:accent-teal-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>30 dB (Silent Whisper)</span>
            <span>60 dB (Normal Talk)</span>
            <span>90 dB (High Noise)</span>
          </div>

          {/* Quick instructions */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <p className="font-bold text-slate-700 dark:text-slate-300">
              Instructions for reliable readings:
            </p>
            <p>1. Keep your phone microphone unobstructed for 20–30s.</p>
            <p>2. Enter the average (LAeq) reading from your sound-meter app.</p>
            <p className="text-teal-700 dark:text-teal-400 italic">
              Note: Uncalibrated phone microphones vary slightly across brands and are identified as community estimates.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Subjective Noise Perception
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(MANUAL_ESTIMATES) as ManualEstimateLevel[]).map((level) => {
              const est = MANUAL_ESTIMATES[level];
              const isSelected = selectedEstimate === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleEstimatePick(level)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-teal-700 bg-teal-50 dark:border-teal-500 dark:bg-teal-950/40 ring-1 ring-teal-700'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="font-extrabold text-sm capitalize text-slate-900 dark:text-white">
                    {est.label}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                    {est.description}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Subjective presets are classified independently and never blended into acoustic dB averages.</span>
          </p>
        </div>
      )}

      {/* 4. Measurement Time & Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Time of Reading
          </label>
          <input
            type="time"
            {...register('time')}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">Campus local time (Asia/Kolkata)</span>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Measurement Duration
          </label>
          <select
            {...register('durationSeconds', { valueAsNumber: true })}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white"
          >
            <option value={15}>15 seconds</option>
            <option value={20}>20 seconds</option>
            <option value={30}>30 seconds (recommended)</option>
            <option value={60}>1 minute</option>
          </select>
          <span className="text-[11px] text-slate-400 mt-1 block">Recommended interval for stable LAeq</span>
        </div>
      </div>

      {/* 5. Optional Context Note */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
          Optional Context Note
        </label>
        <input
          type="text"
          placeholder="e.g. Near corner window; quiet study zone; exam week"
          {...register('note')}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white"
        />
      </div>

      {/* Guidelines confirmation checkbox */}
      <div className="flex items-start gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <input
          type="checkbox"
          id="guidelines"
          {...register('guidelinesAccepted')}
          className="mt-0.5 accent-teal-800 dark:accent-teal-500 rounded cursor-pointer"
        />
        <label htmlFor="guidelines" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
          I confirm that this measurement was observed in person at the indicated location and reflects the ambient acoustic environment.
        </label>
      </div>
      {errors.guidelinesAccepted && (
        <p className="text-xs text-rose-600 font-medium">{errors.guidelinesAccepted.message}</p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Recording Reading...</span>
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4" />
            <span>Submit Community Noise Reading</span>
          </>
        )}
      </button>
    </form>
  );
}
