'use client';

import React, { useEffect, useState } from 'react';
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { VIT_CHENNAI_MAP } from '@/lib/constants';
import { getNoiseCategory, getNoiseColor, formatCampusTime } from '@/lib/noise';
import { CampusSpot, SpotStats } from '@/lib/types';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Volume2,
  Navigation,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

interface CampusMapInnerProps {
  spots: CampusSpot[];
  statsMap: Record<string, SpotStats>;
  activeSlotIndex: number;
  showHeatmap: boolean;
  onSelectSpot?: (spot: CampusSpot) => void;
  selectedSpotId?: string | null;
  adminPickerMode?: boolean;
  onPickCoordinates?: (coords: { lat: number; lng: number }) => void;
  pickedCoords?: { lat: number; lng: number } | null;
}

// Controller component to reset map view or fly to selected spot
function MapViewController({
  selectedSpot,
  pickedCoords,
}: {
  selectedSpot?: CampusSpot | null;
  pickedCoords?: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (pickedCoords) {
      map.flyTo([pickedCoords.lat, pickedCoords.lng], 18, { duration: 0.8 });
    } else if (selectedSpot && selectedSpot.latitude && selectedSpot.longitude) {
      map.flyTo([selectedSpot.latitude, selectedSpot.longitude], 18, { duration: 0.8 });
    }
  }, [selectedSpot, pickedCoords, map]);

  return null;
}

// Click listener for admin coordinate picking
function MapEventsHandler({
  onPick,
  enabled,
}: {
  onPick?: (coords: { lat: number; lng: number }) => void;
  enabled: boolean;
}) {
  useMapEvents({
    click(e) {
      if (enabled && onPick) {
        onPick({
          lat: Math.round(e.latlng.lat * 1000000) / 1000000,
          lng: Math.round(e.latlng.lng * 1000000) / 1000000,
        });
      }
    },
  });
  return null;
}

export default function CampusMapInner({
  spots,
  statsMap,
  activeSlotIndex,
  showHeatmap,
  onSelectSpot,
  selectedSpotId,
  adminPickerMode = false,
  onPickCoordinates,
  pickedCoords,
}: CampusMapInnerProps) {
  // Only display spots that have verified coordinates on the geographical map overlay
  const mappableSpots = spots.filter(
    (s) => s.is_verified && s.latitude !== null && s.longitude !== null
  );

  const selectedSpot = spots.find((s) => s.id === selectedSpotId);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      <MapContainer
        center={VIT_CHENNAI_MAP.center}
        zoom={VIT_CHENNAI_MAP.defaultZoom}
        minZoom={VIT_CHENNAI_MAP.minZoom}
        maxZoom={VIT_CHENNAI_MAP.maxZoom}
        className="w-full h-full z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution={VIT_CHENNAI_MAP.attribution}
          url={VIT_CHENNAI_MAP.tileUrl}
        />

        <MapViewController selectedSpot={selectedSpot} pickedCoords={pickedCoords} />
        <MapEventsHandler enabled={adminPickerMode} onPick={onPickCoordinates} />

        {/* Spatial Heatmap Layer: Simulated continuous gradient interpolation around measured spots */}
        {showHeatmap &&
          mappableSpots.map((spot) => {
            const stats = statsMap[spot.id];
            if (!stats || stats.totalCount === 0 || spot.latitude === null || spot.longitude === null) {
              return null;
            }

            const db = stats.energyAvgDb ?? 50;
            const color = getNoiseColor(db);

            return (
              <React.Fragment key={`heat-${spot.id}`}>
                {/* Outer dispersion halo */}
                <Circle
                  center={[spot.latitude, spot.longitude]}
                  radius={75}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: 0.15,
                    stroke: false,
                  }}
                />
                {/* Mid dispersion halo */}
                <Circle
                  center={[spot.latitude, spot.longitude]}
                  radius={40}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: 0.25,
                    stroke: false,
                  }}
                />
              </React.Fragment>
            );
          })}

        {/* Campus Spot Markers */}
        {mappableSpots.map((spot) => {
          if (spot.latitude === null || spot.longitude === null) return null;

          const stats = statsMap[spot.id];
          const hasMeasured = stats && stats.energyAvgDb !== null;
          const db = hasMeasured ? stats.energyAvgDb! : null;
          const color = db !== null ? getNoiseColor(db) : '#94a3b8';
          const isSelected = spot.id === selectedSpotId;

          return (
            <CircleMarker
              key={spot.id}
              center={[spot.latitude, spot.longitude]}
              radius={isSelected ? 14 : 11}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.95,
                color: isSelected ? '#ffffff' : '#0f172a',
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => {
                  if (onSelectSpot) onSelectSpot(spot);
                },
              }}
            >
              <Popup className="quiet-popup">
                <div className="p-4 w-72 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 rounded-lg">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-base leading-tight text-slate-900 dark:text-white">
                        {spot.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {spot.building_name ? `${spot.building_name} • ` : ''}
                        {spot.floor || 'Campus Space'}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  </div>

                  {/* Noise Level Card */}
                  <div className="my-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-semibold text-sm">
                          {db !== null ? `${db} dB(A)` : 'No measured data'}
                        </span>
                      </div>
                      {db !== null && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md font-medium border ${
                            getNoiseCategory(db).badgeBg
                          }`}
                        >
                          {getNoiseCategory(db).label}
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span>Reports:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          {stats ? stats.totalCount : 0} (
                          {stats ? stats.measuredCount : 0} phone,{' '}
                          {stats ? stats.estimateCount : 0} estimate)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span
                          className={`font-medium ${
                            stats?.isSufficientData
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {stats?.isSufficientData ? 'Sufficient sample' : 'Limited sample'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last updated:</span>
                        <span>{formatCampusTime(stats?.mostRecentReadingTime)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Link
                      href={`/spots/${spot.id}`}
                      className="flex-1 text-center py-1.5 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>View Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/report?spotId=${spot.id}`}
                      className="py-1.5 px-3 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>Log</span>
                    </Link>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Temporary Marker for Admin Coordinate Picker */}
        {adminPickerMode && pickedCoords && (
          <CircleMarker
            center={[pickedCoords.lat, pickedCoords.lng]}
            radius={9}
            pathOptions={{
              fillColor: '#6366f1',
              color: '#ffffff',
              weight: 3,
              fillOpacity: 1,
            }}
          >
            <Popup>
              <div className="p-2 text-xs font-medium">
                <p className="text-indigo-600 font-bold mb-1">Target Coordinates Picked</p>
                <p>Lat: {pickedCoords.lat}</p>
                <p>Lng: {pickedCoords.lng}</p>
              </div>
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>

      {/* Floating Map Legend & Overlay Disclaimer */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-md text-xs max-w-xs pointer-events-auto">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-teal-700" />
            Noise Level Scale
          </span>
          <span className="text-[10px] text-slate-400">35 – 85 dB</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gradient-to-r from-[hsl(190,60%,38%)] via-[hsl(130,50%,40%)] via-[hsl(45,90%,47%)] via-[hsl(24,94%,50%)] to-[hsl(5,70%,46%)] mb-1" />
        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
          <span>Silent (35)</span>
          <span>Moderate (55)</span>
          <span>Loud (85+)</span>
        </div>
        {showHeatmap && (
          <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 flex items-start gap-1">
            <Info className="w-3 h-3 text-teal-600 shrink-0 mt-0.5" />
            <span>Heatmap uses spatial interpolation between reports. Direct measurements only at circle markers.</span>
          </div>
        )}
      </div>

      {/* Mode / Verification Indicator */}
      {adminPickerMode && (
        <div className="absolute top-3 left-3 z-[1000] bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-md shadow font-medium flex items-center gap-1.5 animate-pulse">
          <MapPin className="w-3.5 h-3.5" />
          Click anywhere on campus map to assign GPS coordinates
        </div>
      )}
    </div>
  );
}
