'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  HelpCircle,
  Smartphone,
  MessageSquare,
  Clock,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  Info,
} from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto py-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-teal-700 dark:text-teal-400" />
            <span>How Quiet Finder Works</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            The acoustic methodology, aggregation mathematics, and community principles powering VIT Chennai's noise mapping system.
          </p>
        </div>

        {/* Section 1: How to take a reading */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-teal-800 dark:text-teal-400">
            <Smartphone className="w-5 h-5" />
            <h2 className="text-lg font-bold">1. Taking a Phone Sound-Meter Reading</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Quiet Finder does not continuously capture audio in the background to preserve student privacy and battery life. Instead, students take a quick 20–30 second measurement using any standard decibel meter app (such as Decibel X, NIOSH SLM, or Sound Meter) and submit the average value.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                Step 1: Position
              </span>
              <p className="text-xs text-slate-500">
                Sit or stand at your intended study area. Keep the microphone exposed and unobstructed.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                Step 2: Sample for 25s
              </span>
              <p className="text-xs text-slate-500">
                Measure ambient sound for 20–30 seconds without speaking directly into the phone.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                Step 3: Enter LAeq
              </span>
              <p className="text-xs text-slate-500">
                Input the equivalent continuous sound level (LAeq) into Quiet Finder.
              </p>
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Microphone Variance Caveat:</strong> Consumer smartphone microphones are not laboratory-grade calibrated acoustic dosimeters. Readings provide community comparative guidance rather than certified regulatory acoustic monitoring.
            </span>
          </div>
        </section>

        {/* Section 2: Acoustic Math: Logarithmic Decibel Aggregation */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-teal-800 dark:text-teal-400">
            <Volume2 className="w-5 h-5" />
            <h2 className="text-lg font-bold">2. Logarithmic Energy Aggregation (LAeq)</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Sound pressure levels in decibels are logarithmic, not linear. Averaging 40 dB and 80 dB arithmetically yields 60 dB, which misrepresents acoustic reality because 80 dB carries 10,000 times more sound energy than 40 dB.
          </p>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-center text-xs sm:text-sm text-teal-900 dark:text-teal-300">
            L_Aeq = 10 · log₁₀ [ (1 / N) · ∑ 10^(Lᵢ / 10) ]
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Quiet Finder's engine converts each reading into sound energy, computes the mean acoustic energy across the time slot, and converts it back into decibels. This guarantees mathematically sound rankings.
          </p>
        </section>

        {/* Section 3: Separation of Measured dB vs Subjective Estimates */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <MessageSquare className="w-5 h-5" />
            <h2 className="text-lg font-bold">3. Separation of Measured dB and Manual Estimates</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            When students do not have a decibel meter app installed, they can submit a qualitative estimate: <em>Silent</em>, <em>Quiet</em>, <em>Chatty</em>, or <em>Loud</em>.
          </p>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <p className="font-bold text-slate-800 dark:text-slate-200">
              Crucial Statistical Principle:
            </p>
            <p>
              Subjective estimates are <strong>never silently blended into numeric dB(A) acoustic averages</strong>. They are tracked as an independent categorical distribution and displayed in separate visual sections so students always know the origin of the data.
            </p>
          </div>
        </section>

        {/* Section 4: Eight Two-Hour Slots & Sample Confidence */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Clock className="w-5 h-5" />
            <h2 className="text-lg font-bold">4. Two-Hour Time Slots & Sample Confidence</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Campus acoustics change dramatically across the day: a library foyer quiet at 08:00 AM may become noisy between 13:00 and 15:00 during lunch hours. Quiet Finder partitions the day into eight 2-hour slots:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold text-center">
            {['07:00–09:00', '09:00–11:00', '11:00–13:00', '13:00–15:00', '15:00–17:00', '17:00–19:00', '19:00–21:00', '21:00–23:00'].map((slot, i) => (
              <div key={i} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {slot}
              </div>
            ))}
          </div>

          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-xs text-teal-900 dark:text-teal-200">
            <strong>Sample Thresholds:</strong> A location must have at least <strong>3 valid readings</strong> within a time slot before being marked as "Sufficient Sample". When fewer observations exist, the reading is explicitly labeled as "Limited Sample (Provisional)".
          </div>
        </section>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-2"
          >
            <span>Explore Campus Quiet Spaces</span>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
