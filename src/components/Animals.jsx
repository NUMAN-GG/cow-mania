import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Animals() {
  const { isAdmin } = useAuth();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    tag_number: '',
    type: 'cow',
    breed: '',
    date_of_birth: '',
    gender: 'female',
    status: 'active'
  });

  useEffect(() => {
    if (isAdmin) fetchAnimals();
  }, [isAdmin]);

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

    const { error } = await supabase.from('animals').insert([formData]);

    if (error) {
      alert('Error adding animal: ' + error.message);
    } else {
      setFormData({
        tag_number: '',
        type: 'cow',
        breed: '',
        date_of_birth: '',
        gender: 'female',
        status: 'active'
      });
      fetchAnimals();
    }
  };

  if (!isAdmin) return <div className="p-6 text-red-600">Access Denied</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Animal Management</h2>

      {/* Add Animal Form */}
      <form onSubmit={handleAddAnimal} className="bg-white p-4 rounded-lg shadow space-y-4">
        <h3 className="font-semibold text-lg text-gray-700">Add New Animal</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Tag Number</label>
            <input
              type="text"
              placeholder="e.g. COW-101"
              value={formData.tag_number}
              onChange={(e) => setFormData({ ...formData, tag_number: e.target.value })}
              required
              className="w-full border rounded p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Animal Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full border rounded p-2 text-sm"
            >
              <option value="cow">Cow</option>
              <option value="buffalo">Buffalo</option>
              <option value="goat">Goat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Breed</label>
            <input
              type="text"
              placeholder="e.g. Holstein / Sahiwal"
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              className="w-full border rounded p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              className="w-full border rounded p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full border rounded p-2 text-sm"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full border rounded p-2 text-sm"
            >
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
        >
          Add Animal
        </button>
      </form>

      {/* Animals Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">Tag #</th>
              <th className="p-3">Type</th>
              <th className="p-3">Breed</th>
              <th className="p-3">Gender</th>
              <th className="p-3">DOB</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center">Loading animals...</td></tr>
            ) : animals.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center">No animals found.</td></tr>
            ) : (
              animals.map((a) => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-semibold">{a.tag_number}</td>
                  <td className="p-3 capitalize">{a.type}</td>
                  <td className="p-3">{a.breed || '—'}</td>
                  <td className="p-3 capitalize">{a.gender}</td>
                  <td className="p-3">{a.date_of_birth || '—'}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 capitalize">
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}