import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function MilkSales() {
  const { isAdmin } = useAuth();
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State for Admins
  const [formData, setFormData] = useState({
    customer_id: '',
    date: new Date().toISOString().split('T')[0],
    quantity_liters: '',
    total_amount: '',
    payment_status: 'pending'
  });

  useEffect(() => {
    fetchSales();
    if (isAdmin) {
      fetchCustomers();
    }
  }, [isAdmin]);

  const fetchSales = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('milk_sales')
      .select('*, customers(name)')
      .order('date', { ascending: false });

    if (error) console.error('Error fetching sales:', error.message);
    else setSales(data || []);
    setLoading(false);
  };

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, rate_per_liter');

    if (error) console.error('Error fetching customers:', error.message);
    else setCustomers(data || []);
  };

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    const selectedCustomer = customers.find((c) => c.id === customerId);
    
    // Auto-calculate total amount if quantity and customer rate exist
    const rate = selectedCustomer?.rate_per_liter || 0;
    const total = formData.quantity_liters ? (parseFloat(formData.quantity_liters) * rate).toFixed(2) : '';

    setFormData({ ...formData, customer_id: customerId, total_amount: total });
  };

  const handleQuantityChange = (e) => {
    const qty = e.target.value;
    const selectedCustomer = customers.find((c) => c.id === formData.customer_id);
    const rate = selectedCustomer?.rate_per_liter || 0;
    const total = qty && rate ? (parseFloat(qty) * rate).toFixed(2) : '';

    setFormData({ ...formData, quantity_liters: qty, total_amount: total });
  };

  const handleAddSale = async (e) => {
    e.preventDefault();
    if (!formData.customer_id || !formData.quantity_liters || !formData.total_amount) return;

    const { error } = await supabase.from('milk_sales').insert([
      {
        customer_id: formData.customer_id,
        date: formData.date,
        quantity_liters: parseFloat(formData.quantity_liters),
        total_amount: parseFloat(formData.total_amount),
        payment_status: formData.payment_status
      }
    ]);

    if (error) {
      alert('Error adding sale: ' + error.message);
    } else {
      setFormData({
        customer_id: '',
        date: new Date().toISOString().split('T')[0],
        quantity_liters: '',
        total_amount: '',
        payment_status: 'pending'
      });
      fetchSales();
    }
  };

  const togglePaymentStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    const { error } = await supabase
      .from('milk_sales')
      .update({ payment_status: newStatus })
      .eq('id', id);

    if (error) console.error('Error updating status:', error.message);
    else fetchSales();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Milk Sales Management</h2>

      {/* Admin Form: Create Sale */}
      {isAdmin && (
        <form onSubmit={handleAddSale} className="bg-white p-4 rounded-lg shadow space-y-4">
          <h3 className="font-semibold text-lg text-gray-700">Record New Sale</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Customer</label>
              <select
                value={formData.customer_id}
                onChange={handleCustomerChange}
                required
                className="w-full border rounded p-2 text-sm"
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (${c.rate_per_liter}/L)
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
              <label className="block text-sm font-medium text-gray-600">Quantity (Liters)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.quantity_liters}
                onChange={handleQuantityChange}
                required
                className="w-full border rounded p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">Total Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                required
                className="w-full border rounded p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">Payment Status</label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                className="w-full border rounded p-2 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
          >
            Record Sale
          </button>
        </form>
      )}

      {/* Sales List Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Total ($)</th>
              <th className="p-3">Status</th>
              {isAdmin && <th className="p-3">Action</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">Loading sales records...</td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">No sales records found.</td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{sale.date}</td>
                  <td className="p-3 font-medium">{sale.customers?.name || 'N/A'}</td>
                  <td className="p-3">{sale.quantity_liters} L</td>
                  <td className="p-3">${sale.total_amount}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        sale.payment_status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {sale.payment_status.toUpperCase()}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="p-3">
                      <button
                        onClick={() => togglePaymentStatus(sale.id, sale.payment_status)}
                        className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                      >
                        Toggle Status
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}