import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Customers() {
  const { isAdmin } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    rate_per_liter: ''
  });

  useEffect(() => {
    if (isAdmin) fetchCustomers();
  }, [isAdmin]);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true });

    if (error) console.error('Error fetching customers:', error.message);
    else setCustomers(data || []);
    setLoading(false);
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.rate_per_liter) return;

    const { error } = await supabase.from('customers').insert([
      {
        name: formData.name,
        phone: formData.phone,
        rate_per_liter: parseFloat(formData.rate_per_liter)
      }
    ]);

    if (error) {
      alert('Error adding customer: ' + error.message);
    } else {
      setFormData({ name: '', phone: '', rate_per_liter: '' });
      fetchCustomers();
    }
  };

  if (!isAdmin) return <div className="p-6 text-red-600">Access Denied</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Customer Management</h2>

      {/* Add Customer Form */}
      <form onSubmit={handleAddCustomer} className="bg-white p-4 rounded-lg shadow space-y-4">
        <h3 className="font-semibold text-lg text-gray-700">Add New Customer</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Customer Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full border rounded p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Phone Number</label>
            <input
              type="text"
              placeholder="e.g. +1234567890"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border rounded p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Rate per Liter ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.rate_per_liter}
              onChange={(e) => setFormData({ ...formData, rate_per_liter: e.target.value })}
              required
              className="w-full border rounded p-2 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
        >
          Add Customer
        </button>
      </form>

      {/* Customers List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Rate / Liter</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="p-4 text-center">Loading customers...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={3} className="p-4 text-center">No customers found.</td></tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-semibold">{c.name}</td>
                  <td className="p-3">{c.phone || '—'}</td>
                  <td className="p-3 font-medium text-green-600">${c.rate_per_liter} / L</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}