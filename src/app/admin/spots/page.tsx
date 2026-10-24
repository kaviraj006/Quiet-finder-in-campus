'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CampusMap from '@/components/map/CampusMap';
import { store } from '@/lib/store';
import { SPOT_CATEGORIES } from '@/lib/constants';
import { CampusSpot, SpotCategory } from '@/lib/types';
import {
  MapPin,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Crosshair,
  Save,
  X,
} from 'lucide-react';

export default function AdminSpotsPage() {
  const [spots, setSpots] = useState<CampusSpot[]>([]);
  const [editingSpot, setEditingSpot] = useState<CampusSpot | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [mapPickerActive, setMapPickerActive] = useState(false);
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCat, setFormCat] = useState<SpotCategory>('academic');
  const [formBuilding, setFormBuilding] = useState('');
  const [formFloor, setFormFloor] = useState('');
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');
  const [formVerified, setFormVerified] = useState(false);
  const [formActive, setFormActive] = useState(true);

  useEffect(() => {
    const load = () => {
      setSpots(store.getSpots(true));
    };
    load();
    const unsub = store.subscribe(load);
    return () => unsub();
  }, []);

  const openEdit = (spot: CampusSpot) => {
    setEditingSpot(spot);
    setIsAddingNew(false);
    setFormName(spot.name);
    setFormDesc(spot.description);
    setFormCat(spot.category);
    setFormBuilding(spot.building_name || '');
    setFormFloor(spot.floor || '');
    setFormLat(spot.latitude !== null ? String(spot.latitude) : '');
    setFormLng(spot.longitude !== null ? String(spot.longitude) : '');
    setFormVerified(spot.is_verified);
    setFormActive(spot.is_active);
    setPickedCoords(
      spot.latitude && spot.longitude
        ? { lat: spot.latitude, lng: spot.longitude }
        : null
    );
  };

  const openAdd = () => {
    setEditingSpot(null);
    setIsAddingNew(true);
    setFormName('');
    setFormDesc('');
    setFormCat('academic');
    setFormBuilding('');
    setFormFloor('');
    setFormLat('');
    setFormLng('');
    setFormVerified(false);
    setFormActive(true);
    setPickedCoords(null);
  };

  const handlePickCoordinates = (coords: { lat: number; lng: number }) => {
    setPickedCoords(coords);
    setFormLat(String(coords.lat));
    setFormLng(String(coords.lng));
    setFormVerified(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const lat = formLat.trim() ? parseFloat(formLat) : null;
    const lng = formLng.trim() ? parseFloat(formLng) : null;

    if (isAddingNew) {
      store.addSpot({
        name: formName.trim(),
        description: formDesc.trim(),
        category: formCat,
        building_name: formBuilding.trim() || undefined,
        floor: formFloor.trim() || undefined,
        latitude: lat,
        longitude: lng,
        is_verified: formVerified,
        is_active: formActive,
      });
      setIsAddingNew(false);
    } else if (editingSpot) {
      store.updateSpot(editingSpot.id, {
        name: formName.trim(),
        description: formDesc.trim(),
        category: formCat,
        building_name: formBuilding.trim() || undefined,
        floor: formFloor.trim() || undefined,
        latitude: lat,
        longitude: lng,
        is_verified: formVerified,
        is_active: formActive,
      });
      setEditingSpot(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this study space and all its associated readings?')) {
      store.deleteSpot(id);
      if (editingSpot?.id === id) {
        setEditingSpot(null);
      }
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                Administration
              </span>
              <span className="text-xs text-slate-400">Campus Cartography & Spatial Data</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Campus Locations & GPS Coordinates
            </h1>
          </div>

          <button
            onClick={openAdd}
            className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Study Space</span>
          </button>
        </div>

        {/* Edit / Add Modal or Inspector */}
        {(editingSpot || isAddingNew) && (
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-teal-700 dark:border-teal-500 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-700" />
                <span>{isAddingNew ? 'Register New Campus Location' : `Editing: ${editingSpot?.name}`}</span>
              </h3>
              <button
                onClick={() => {
                  setEditingSpot(null);
                  setIsAddingNew(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Location Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Central Library - 1st Floor Reading Lounge"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formCat}
                    onChange={(e) => setFormCat(e.target.value as SpotCategory)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white"
                  >
                    {SPOT_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Building Name
                  </label>
                  <input
                    type="text"
                    value={formBuilding}
                    onChange={(e) => setFormBuilding(e.target.value)}
                    placeholder="e.g. Academic Block 1 (AB1), Central Library"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Floor / Area
                  </label>
                  <input
                    type="text"
                    value={formFloor}
                    onChange={(e) => setFormFloor(e.target.value)}
                    placeholder="e.g. 2nd Floor West Wing"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Describe acoustic characteristics, air conditioning, seating capacity, or outlets..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* GPS Coordinates & Interactive Map Click Picker */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Geographic GPS Coordinates (WGS84)
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Unverified coordinates are excluded from the public geographic overlay until placed.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMapPickerActive(!mapPickerActive)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      mapPickerActive
                        ? 'bg-indigo-600 text-white animate-pulse'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Crosshair className="w-4 h-4 text-indigo-500" />
                    <span>{mapPickerActive ? 'Click Map To Pick Location' : 'Pick Coordinates on Map'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formLat}
                      onChange={(e) => setFormLat(e.target.value)}
                      placeholder="e.g. 12.843677"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formLng}
                      onChange={(e) => setFormLng(e.target.value)}
                      placeholder="e.g. 80.153513"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Map Preview for Clicking */}
                {mapPickerActive && (
                  <div className="mt-2 h-72 w-full rounded-xl overflow-hidden border border-indigo-400">
                    <CampusMap
                      spots={spots}
                      statsMap={{}}
                      activeSlotIndex={0}
                      showHeatmap={false}
                      adminPickerMode={true}
                      onPickCoordinates={handlePickCoordinates}
                      pickedCoords={pickedCoords}
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formVerified}
                      onChange={(e) => setFormVerified(e.target.checked)}
                      className="rounded accent-teal-800 cursor-pointer"
                    />
                    <span>Verified Geographic Coordinates (Render on live campus map)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formActive}
                      onChange={(e) => setFormActive(e.target.checked)}
                      className="rounded accent-teal-800 cursor-pointer"
                    />
                    <span>Active Study Space</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSpot(null);
                    setIsAddingNew(false);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Location</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Spots Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Space Name</th>
                  <th className="py-3 px-4">Building & Floor</th>
                  <th className="py-3 px-4">GPS Coordinates</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {spots.map((spot) => (
                  <tr key={spot.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{spot.name}</div>
                      <span className="text-[11px] text-slate-400 capitalize">{spot.category}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      <div>{spot.building_name || '—'}</div>
                      <span className="text-[11px] text-slate-400">{spot.floor || 'Campus'}</span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {spot.latitude && spot.longitude
                        ? `${spot.latitude.toFixed(5)}, ${spot.longitude.toFixed(5)}`
                        : 'Unassigned'}
                    </td>

                    <td className="py-3 px-4">
                      {spot.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {spot.is_active ? (
                        <span className="text-[11px] text-emerald-600 font-semibold">Active</span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-semibold">Deactivated</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(spot)}
                          title="Edit location and coordinates"
                          className="p-1.5 text-slate-500 hover:text-teal-700 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(spot.id)}
                          title="Delete location"
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
