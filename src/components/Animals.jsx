import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  tag_number: '',
  type: 'cow',
  breed: '',
  date_of_birth: '',
  gender: 'female',
  status: 'active',
};

const inputClass =
  'w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition';
const labelClass = 'block text-xs font-medium text-slate-300 mb-1';
const badgeBase = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold border';

const STATUS_BADGES = {
  active: {
    label: 'Active (Milking)',
    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  pregnant_milking: {
    label: 'Pregnant (Milking)',
    cls: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
  },
  pregnant_dry: {
    label: 'Pregnant (Dry)',
    cls: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  },
  dry: {
    label: 'Dry / Non-Milking',
    cls: 'bg-slate-800 text-slate-400 border-slate-700',
  },
  sold: {
    label: 'Sold',
    cls: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  inactive: {
    label: 'Inactive',
    cls: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  },
};

export default function Animals() {
  const { isAdmin, canView } = useAuth();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (canView) fetchAnimals();
  }, [canView]);

  const fetchAnimals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching animals:', error.message);
    else setAnimals(data || []);
    setLoading(false);
  };

  const handleAddAnimal = async (e) => {
    e.preventDefault();
    if (!formData.tag_number) return;

    const { error } = await supabase.from('animals').insert([
      {
        ...formData,
        breed: formData.breed || null,
        date_of_birth: formData.date_of_birth || null,
      },
    ]);

    if (error) {
      alert('Error adding animal: ' + error.message);
    } else {
      setFormData(emptyForm);
      fetchAnimals();
    }
  };

  const renderStatusBadge = (status) => {
    const badge = STATUS_BADGES[status];
    if (badge) {
      return <span className={`${badgeBase} ${badge.cls}`}>{badge.label}</span>;
    }
    return (
      <span className={`${badgeBase} bg-slate-800 text-slate-300 border-slate-700 capitalize`}>
        {status || 'unknown'}
      </span>
    );
  };

  if (!canView) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-sm font-semibold">
        Access Denied: You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          <span>🐄</span> Animal Management
        </h2>
      </div>

      {/* Add Animal Form (admin only) */}
      {isAdmin && (
        <form
          onSubmit={handleAddAnimal}
          className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4"
        >
          <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
            Add New Animal
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Tag Number</label>
              <input
                type="text"
                placeholder="e.g. COW-101"
                value={formData.tag_number}
                onChange={(e) => setFormData({ ...formData, tag_number: e.target.value })}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Animal Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className={inputClass}
              >
                <option value="cow">Cow</option>
                <option value="buffalo">Buffalo</option>
                <option value="goat">Goat</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Breed</label>
              <input
                type="text"
                placeholder="e.g. Holstein / Sahiwal"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className={inputClass}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Production &amp; Health Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={inputClass}
              >
                <option value="active">Active (Giving Milk)</option>
                <option value="pregnant_milking">Pregnant (Giving Milk)</option>
                <option value="pregnant_dry">Pregnant (Stopped Milk / Dry)</option>
                <option value="dry">Dry / Non-Lactating</option>
                <option value="sold">Sold</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-emerald-950/50 transition"
            >
              Add Animal
            </button>
          </div>
        </form>
      )}

      {/* Animals Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200">Registered Livestock</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Tag #</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Breed</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">DOB</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Loading animals...
                  </td>
                </tr>
              ) : animals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No animals found.
                  </td>
                </tr>
              ) : (
                animals.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-bold text-emerald-400">{a.tag_number}</td>
                    <td className="px-4 py-3 capitalize text-slate-200">{a.type}</td>
                    <td className="px-4 py-3 text-slate-300">{a.breed || '—'}</td>
                    <td className="px-4 py-3 capitalize text-slate-300">{a.gender}</td>
                    <td className="px-4 py-3 text-slate-400">{a.date_of_birth || '—'}</td>
                    <td className="px-4 py-3">{renderStatusBadge(a.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}