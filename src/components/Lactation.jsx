import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Lactation() {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    animal_id: '',
    date: new Date().toISOString().split('T')[0],
    session: 'morning',
    yield_liters: ''
  });

  useEffect(() => {
    if (isAdmin) {
      fetchLogs();
      fetchAnimals();
    }
  }, [isAdmin]);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('lactation_logs')
      .select('*, animals(tag_number, type)')
      .order('date', { ascending: false });

    if (error) console.error('Error fetching lactation logs:', error.message);
    else setLogs(data || []);
    setLoading(false);
  };

  const fetchAnimals = async () => {
    const { data, error } = await supabase
      .from('animals')
      .select('id, tag_number, type')
      .eq('status', 'active');

    if (error) console.error('Error fetching animals:', error.message);
    else setAnimals(data || []);
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!formData.animal_id || !formData.yield_liters) return;

    const { error } = await supabase.from('lactation_logs').insert([
      {
        animal_id: formData.animal_id,
        date: formData.date,
        session: formData.session,
        yield_liters: parseFloat(formData.yield_liters)
      }
    ]);

    if (error) {
      alert('Error adding lactation log: ' + error.message);
    } else {
      setFormData({
        animal_id: '',
        date: new Date().toISOString().split('T')[0],
        session: 'morning',
        yield_liters: ''
      });
      fetchLogs();
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-sm font-semibold">
        Access Denied. Only admins can access lactation logs.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>🥛</span> Lactation Logs
        </h2>
      </div>

      {/* Add Log Form */}
      <form onSubmit={handleAddLog} className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
          Log Daily Yield
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Animal</label>
            <select
              value={formData.animal_id}
              onChange={(e) => setFormData({ ...formData, animal_id: e.target.value })}
              required
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            >
              <option value="">Choose Tag Number</option>
              {animals.map((a) => (
                <option key={a.id} value={a.id}>
                  Tag: {a.tag_number} ({a.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Session</label>
            <select
              value={formData.session}
              onChange={(e) => setFormData({ ...formData, session: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            >
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Yield (Liters)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.yield_liters}
              onChange={(e) => setFormData({ ...formData, yield_liters: e.target.value })}
              required
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-emerald-950/50 transition"
          >
            Save Log
          </button>
        </div>
      </form>

      {/* Logs Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200">Recent Lactation Records</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Tag Number</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Yield (Liters)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No lactation records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 text-slate-400">{log.date}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">
                      {log.animals?.tag_number || 'N/A'}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-300">
                      {log.animals?.type || 'N/A'}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-300">{log.session}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                        {log.yield_liters} L
                      </span>
                    </td>
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