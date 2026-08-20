import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import MilkSales from './components/MilkSales';
import Lactation from './components/Lactation';
import Animals from './components/Animals';
import Customers from './components/Customers';

export default function App() {
  const { user, profile, isAdmin, signOut, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('sales');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-medium text-gray-600">Loading Cow Mania...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold">Welcome to Cow Mania</h1>
        <p className="text-gray-500">Please sign in to access your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-slate-800 text-white p-4 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-xl font-bold">Cow Mania</h1>
          <p className="text-xs text-slate-300">
            Logged in as: <span className="font-semibold">{profile?.full_name || user.email}</span> ({profile?.role})
          </p>
        </div>
        <button
          onClick={signOut}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition"
        >
          Sign Out
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b px-4 py-3 flex gap-6 text-sm font-medium text-gray-700">
        <button
          onClick={() => setActiveTab('sales')}
          className={`${activeTab === 'sales' ? 'text-blue-600 border-b-2 border-blue-600 font-bold' : 'hover:text-blue-600'}`}
        >
          Milk Sales
        </button>

        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab('animals')}
              className={`${activeTab === 'animals' ? 'text-blue-600 border-b-2 border-blue-600 font-bold' : 'hover:text-blue-600'}`}
            >
              Animals
            </button>
            <button
              onClick={() => setActiveTab('lactation')}
              className={`${activeTab === 'lactation' ? 'text-blue-600 border-b-2 border-blue-600 font-bold' : 'hover:text-blue-600'}`}
            >
              Lactation Logs
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`${activeTab === 'customers' ? 'text-blue-600 border-b-2 border-blue-600 font-bold' : 'hover:text-blue-600'}`}
            >
              Customers
            </button>
          </>
        )}
      </nav>

      {/* Content Rendering */}
      <main className="p-6 max-w-7xl mx-auto">
        {activeTab === 'sales' && <MilkSales />}
        {activeTab === 'animals' && isAdmin && <Animals />}
        {activeTab === 'lactation' && isAdmin && <Lactation />}
        {activeTab === 'customers' && isAdmin && <Customers />}
      </main>
    </div>
  );
}