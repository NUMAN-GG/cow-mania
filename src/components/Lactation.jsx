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
      <div className="p-6 text-red-600 font-semibold">
        Access Denied. Only admins can access lactation logs.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Lactation Logs</h2>

      <form onSubmit={handleAddLog} className="bg-white p-4 rounded-lg shadow space-y-4">
        <h3 className="font-semibold text-lg text-gray-700">Log Daily Yield</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Select Animal</label>
            <select
              value={formData.animal_id}
              onChange={(e) => setFormData({ ...formData, animal_id: e.target.value })}
              required
              className="w-full border rounded p-2 text-sm"
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
            <label className="block text-sm font-medium text-gray-600">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full border rounded p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Session</label>
            <select
              value={formData.session}
              onChange={(e) => setFormData({ ...formData, session: e.target.value })}
              className="w-full border rounded p-2 text-sm"
            >
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Yield (Liters)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.yield_liters}
              onChange={(e) => setFormData({ ...formData, yield_liters: e.target.value })}
              required
              className="w-full border rounded p-2 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
        >
          Save Log
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Tag Number</th>
              <th className="p-3">Type</th>
              <th className="p-3">Session</th>
              <th className="p-3">Yield (Liters)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">Loading logs...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">No lactation records found.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{log.date}</td>
                  <td className="p-3 font-medium">{log.animals?.tag_number || 'N/A'}</td>
                  <td className="p-3 capitalize">{log.animals?.type || 'N/A'}</td>
                  <td className="p-3 capitalize">{log.session}</td>
                  <td className="p-3 font-semibold text-blue-600">{log.yield_liters} L</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}